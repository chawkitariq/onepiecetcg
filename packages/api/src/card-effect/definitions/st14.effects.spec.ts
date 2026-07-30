/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import { DuelCard, createDuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../effect-engine';
import { st14EffectDefinitions } from './st14.effects';
import { createRegistry, makeCard, TestHost } from './test-utils';

describe('ST14 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st14EffectDefinitions]);
    return new EffectEngine(registry, host);
  };

  const addCharacter = (
    host: TestHost,
    sessionId: string,
    overrides: Partial<Card> & { instanceSuffix: string },
  ): DuelCard =>
    host.addCardToZone(
      sessionId,
      'characters',
      makeCard({
        id: 'test-character',
        number: 'test-character',
        name: 'Test Character',
        type: 'Character',
        cost: 3,
        power: 5000,
        ...overrides,
      }),
      overrides.instanceSuffix,
    );

  describe('ST14-001 Monkey.D.Luffy (Leader)', () => {
    it('gives +1 cost to all characters when DON!! x1 is attached', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST14-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const char = addCharacter(host, 'p1', {
        name: 'Straw Hat',
        instanceSuffix: 'sh',
        cost: 3,
      });
      p1.zones.leader.attachedDon = 1;

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(char.cost).toBe(4);
    });

    it('does not give +1 cost without DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST14-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const char = addCharacter(host, 'p1', {
        name: 'Straw Hat',
        instanceSuffix: 'sh',
        cost: 3,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(char.cost).toBe(3);
    });

    it('gives +1000 power to Leader when character with cost >= 8 exists', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST14-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.attachedDon = 1;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(6000);
    });
  });

  describe('ST14-002 Usopp', () => {
    it('KOs cost-4 or less character on attack with DON!! x1 and cost 8+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      const usopp = addCharacter(host, 'p1', {
        id: 'ST14-002',
        number: 'ST14-002',
        name: 'Usopp',
        instanceSuffix: 'usopp',
      });
      usopp.attachedDon = 1;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
        power: 4000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: usopp.instanceId,
        sourceCardId: 'ST14-002',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
      expect(
        p2.zones.trash.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST14-003 Sanji', () => {
    it('KOs cost-5 or less character on play with cost 6+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 6,
        power: 6000,
      });

      const sanji = addCharacter(host, 'p1', {
        id: 'ST14-003',
        number: 'ST14-003',
        name: 'Sanji',
        instanceSuffix: 'sanji',
      });

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sanji.instanceId,
        sourceCardId: 'ST14-003',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
    });
  });

  describe('ST14-004 Jinbe', () => {
    it('gives +2 cost to a black Straw Hat Crew character on Activate:Main once per turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const target = addCharacter(host, 'p1', {
        name: 'Straw Hat',
        instanceSuffix: 'sh',
        cost: 3,
        colors: ['Black'],
        families: ['Straw Hat Crew'],
      });

      const jinbe = addCharacter(host, 'p1', {
        id: 'ST14-004',
        number: 'ST14-004',
        name: 'Jinbe',
        instanceSuffix: 'jinbe',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: jinbe.instanceId,
        sourceCardId: 'ST14-004',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.cost).toBe(5);
    });
  });

  describe('ST14-006 Nami', () => {
    it('draws 1 card on play with hand <= 6 and cost 8+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      const nami = addCharacter(host, 'p1', {
        id: 'ST14-006',
        number: 'ST14-006',
        name: 'Nami',
        instanceSuffix: 'nami',
      });

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'card1',
          number: 'card1',
          name: 'Card 1',
          type: 'Character',
        }),
        'card1',
      );

      p1.zones.deck.push(new DuelCard());

      const engine = createEngine(host);
      expect(p1.zones.hand.length).toBe(1);

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: nami.instanceId,
        sourceCardId: 'ST14-006',
      });

      expect(p1.zones.hand.length).toBe(2);
    });
  });

  describe('ST14-007 Nico Robin', () => {
    it('gives -5 cost on play with cost 8+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      const robin = addCharacter(host, 'p1', {
        id: 'ST14-007',
        number: 'ST14-007',
        name: 'Nico Robin',
        instanceSuffix: 'robin',
      });

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 8,
        power: 7000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: robin.instanceId,
        sourceCardId: 'ST14-007',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.cost).toBe(3);
    });
  });

  describe('ST14-008 Haredas', () => {
    it('rests self, gives +2 cost, then draws and trashes with cost 8+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const haredas = addCharacter(host, 'p1', {
        id: 'ST14-008',
        number: 'ST14-008',
        name: 'Haredas',
        instanceSuffix: 'haredas',
        cost: 1,
        power: 0,
      });

      const target = addCharacter(host, 'p1', {
        name: 'Straw Hat',
        instanceSuffix: 'sh',
        cost: 3,
        colors: ['Black'],
        families: ['Straw Hat Crew'],
      });

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      p1.zones.deck.push(new DuelCard());

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: haredas.instanceId,
        sourceCardId: 'ST14-008',
      });

      expect(haredas.rested).toBe(true);

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.cost).toBe(5);
    });
  });

  describe('ST14-009 Franky', () => {
    it('gains cannotBeKoedByEffects and +2000 power with DON!! x1, opponent turn, cost 6+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const franky = addCharacter(host, 'p1', {
        id: 'ST14-009',
        number: 'ST14-009',
        name: 'Franky',
        instanceSuffix: 'franky',
        cost: 5,
        power: 6000,
      });
      franky.attachedDon = 1;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 6,
        power: 6000,
      });

      host.state.activePlayerSessionId = 'p2';

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(franky.power).toBe(8000);
    });
  });

  describe('ST14-011 Heracles', () => {
    it('rests self to give +2 cost to a black Straw Hat Crew character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const heracles = addCharacter(host, 'p1', {
        id: 'ST14-011',
        number: 'ST14-011',
        name: 'Heracles',
        instanceSuffix: 'heracles',
        cost: 1,
        power: 2000,
      });

      const target = addCharacter(host, 'p1', {
        name: 'Straw Hat',
        instanceSuffix: 'sh',
        cost: 3,
        colors: ['Black'],
        families: ['Straw Hat Crew'],
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: heracles.instanceId,
        sourceCardId: 'ST14-011',
      });

      expect(heracles.rested).toBe(true);

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.cost).toBe(5);
    });
  });

  describe('ST14-012 Monkey.D.Luffy (012)', () => {
    it('gains Rush when a character with cost >= 10 exists', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 10,
        power: 10000,
      });

      const luffy = addCharacter(host, 'p1', {
        id: 'ST14-012',
        number: 'ST14-012',
        name: 'Monkey.D.Luffy (012)',
        instanceSuffix: 'luffy',
        cost: 8,
        power: 10000,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(luffy.hasRush).toBe(true);
    });

    it('does not gain Rush without a cost >= 10 character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const luffy = addCharacter(host, 'p1', {
        id: 'ST14-012',
        number: 'ST14-012',
        name: 'Monkey.D.Luffy (012)',
        instanceSuffix: 'luffy',
        cost: 8,
        power: 10000,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(luffy.hasRush).toBe(false);
    });
  });

  describe('ST14-014 Gum-Gum Giant Rifl', () => {
    it('grants +3000 power during battle as counter with cost 8+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      const giantRifl = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST14-014',
          number: 'ST14-014',
          name: 'Gum-Gum Giant Rifl',
          type: 'Event',
          cost: 1,
        }),
        'giantRifl',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: giantRifl.instanceId,
        sourceCardId: 'ST14-014',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });
    });

    it('retrieves cost-2 or less character from trash on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const deadChar = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'dead-char',
          number: 'dead-char',
          name: 'Dead Character',
          type: 'Character',
          cost: 2,
        }),
        'dead',
      );

      const giantRifl = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST14-014',
          number: 'ST14-014',
          name: 'Gum-Gum Giant Rifl',
          type: 'Event',
          cost: 1,
        }),
        'giantRifl',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: giantRifl.instanceId,
        sourceCardId: 'ST14-014',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [deadChar.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === deadChar.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST14-015 Gum-Gum Diable Three-Swords Style Mouten Jet Six Hundred Pound Phoenix Cannon', () => {
    it('gives +3000 power as main and KOs cost-2 character with cost 8+', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 2,
        power: 2000,
      });

      const cannon = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST14-015',
          number: 'ST14-015',
          name: 'Gum-Gum Diable Three-Swords Style Mouten Jet Six Hundred Pound Phoenix Cannon',
          type: 'Event',
          cost: 2,
        }),
        'cannon',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: cannon.instanceId,
        sourceCardId: 'ST14-015',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
    });

    it('KOs cost-5 or less character on trigger with cost 8+ character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      addCharacter(host, 'p1', {
        name: 'Big Guy',
        instanceSuffix: 'big',
        cost: 8,
        power: 8000,
      });

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
        power: 5000,
      });

      const cannon = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST14-015',
          number: 'ST14-015',
          name: 'Gum-Gum Diable Three-Swords Style Mouten Jet Six Hundred Pound Phoenix Cannon',
          type: 'Event',
          cost: 2,
        }),
        'cannon',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: cannon.instanceId,
        sourceCardId: 'ST14-015',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
    });
  });

  describe('ST14-016 I Have My Crew!!', () => {
    it('draws 1 card and gives +3 cost to a character as main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const target = addCharacter(host, 'p1', {
        name: 'Straw Hat',
        instanceSuffix: 'sh',
        cost: 3,
      });

      p1.zones.deck.push(new DuelCard());

      const event = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST14-016',
          number: 'ST14-016',
          name: 'I Have My Crew!!',
          type: 'Event',
          cost: 1,
        }),
        'ihmc',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: event.instanceId,
        sourceCardId: 'ST14-016',
      });

      expect(p1.zones.hand.length).toBe(2);

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.cost).toBe(6);
    });

    it('KOs cost-3 or less character on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });

      const event = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST14-016',
          number: 'ST14-016',
          name: 'I Have My Crew!!',
          type: 'Event',
          cost: 1,
        }),
        'ihmc',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: event.instanceId,
        sourceCardId: 'ST14-016',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
    });
  });

  describe('ST14-017 Thousand Sunny', () => {
    it('gives +1 cost to all black Straw Hat Crew characters continuously', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const target = addCharacter(host, 'p1', {
        name: 'Straw Hat',
        instanceSuffix: 'sh',
        cost: 3,
        colors: ['Black'],
        families: ['Straw Hat Crew'],
      });

      const other = addCharacter(host, 'p1', {
        name: 'Other',
        instanceSuffix: 'other',
        cost: 3,
        colors: ['Red'],
        families: ['Straw Hat Crew'],
      });

      p1.zones.stage = createDuelCard(
        makeCard({
          id: 'ST14-017',
          number: 'ST14-017',
          name: 'Thousand Sunny',
          type: 'Stage',
          cost: 1,
        }),
        'p1:sunny',
        'p1',
      );

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(target.cost).toBe(4);
      expect(other.cost).toBe(3);
    });

    it('draws 1 card on play if leader has Straw Hat Crew trait', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST14-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.families.push('Straw Hat Crew');
      p1.zones.deck.push(new DuelCard());

      const sunny = createDuelCard(
        makeCard({
          id: 'ST14-017',
          number: 'ST14-017',
          name: 'Thousand Sunny',
          type: 'Stage',
          cost: 1,
        }),
        'p1:sunny',
        'p1',
      );
      p1.zones.stage = sunny;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sunny.instanceId,
        sourceCardId: 'ST14-017',
      });

      expect(p1.zones.hand.length).toBe(1);
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st14EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST14-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
            if (entry.kind === 'continuous') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.modifier).toBeDefined();
            }
          }
        }
      }
    });

    it('ST14-001 has two continuous effects', () => {
      const card = st14EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST14-001',
      );
      expect(card).toBeDefined();
      const continuous = card!.effects?.filter((e) => e.kind === 'continuous');
      expect(continuous).toHaveLength(2);
    });

    it('ST14-004 has activateMain oncePerTurn', () => {
      const card = st14EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST14-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
      }
    });

    it('ST14-009 uses cannotBeKoedByEffects keyword', () => {
      const card = st14EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST14-009',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.keywords).toContain(
          'cannotBeKoedByEffects',
        );
      }
    });

    it('ST14-017 has continuous cost bonus and onPlay draw', () => {
      const card = st14EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST14-017',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.cost).toBe(1);
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
      }
    });

    it('all effect IDs are globally unique within the edition', () => {
      const ids = new Set<string>();
      for (const card of st14EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'standard' || entry.kind === 'continuous') {
            expect(ids.has(entry.effect.id)).toBe(false);
            ids.add(entry.effect.id);
          }
        }
      }
    });
  });
});
