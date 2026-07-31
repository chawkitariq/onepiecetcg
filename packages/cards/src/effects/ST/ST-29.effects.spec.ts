/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '@onepiecetcg/effect-engine';
import { st29EffectDefinitions } from './ST-29.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST29 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st29EffectDefinitions]);
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

  const putDonInCost = (
    host: TestHost,
    sessionId: string,
    count: number,
    rested: boolean,
  ): void => {
    const player = host.getPlayer(sessionId)!;
    for (let index = 0; index < count; index += 1) {
      const don = new DuelCard();
      don.rested = rested;
      player.zones.cost.push(don);
    }
  };

  const addLifeCards = (
    host: TestHost,
    sessionId: string,
    count: number,
  ): void => {
    const player = host.getPlayer(sessionId)!;
    for (let i = 0; i < count; i += 1) {
      player.zones.life.push(new DuelCard());
    }
  };

  describe('ST29-001 Monkey.D.Luffy (Leader)', () => {
    it('draws 1 and trashes 1 from hand when attacking with 2 or less life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.cardId = 'ST29-001';
      addLifeCards(host, 'p1', 2);

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'draw-card',
          number: 'draw-card',
          name: 'Draw Card',
          type: 'Event',
          cost: 0,
        }),
        'draw-card',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-card',
          number: 'trash-card',
          name: 'Trash Card',
          type: 'Event',
          cost: 0,
        }),
        'trash-card',
      );

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST29-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [
          p1.zones.hand.find((card) => card.cardId === 'trash-card')!.instanceId,
        ],
      });

      expect(p1.zones.hand.length).toBe(handBefore);
      expect(p1.zones.trash.length).toBe(1);
    });

    it('does not draw or trash when attacking with more than 2 life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.cardId = 'ST29-001';
      addLifeCards(host, 'p1', 4);

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'draw-card',
          number: 'draw-card',
          name: 'Draw Card',
          type: 'Event',
          cost: 0,
        }),
        'draw-card',
      );

      const handBefore = p1.zones.hand.length;
      const deckBefore = p1.zones.deck.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST29-001',
      });

      expect(p1.zones.hand.length).toBe(handBefore);
      expect(p1.zones.deck.length).toBe(deckBefore);
    });
  });

  describe('ST29-004 Sanji', () => {
    it('searches top 4 deck for Straw Hat Crew on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const sanji = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-004',
          number: 'ST29-004',
          name: 'Sanji',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Straw Hat Crew'],
        }),
        'sanji',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card-1',
          number: 'deck-card-1',
          name: 'Other',
          type: 'Event',
          cost: 0,
        }),
        'd1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card-2',
          number: 'deck-card-2',
          name: 'Nami',
          type: 'Character',
          cost: 3,
          power: 3000,
          families: ['Straw Hat Crew'],
        }),
        'nami',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card-3',
          number: 'deck-card-3',
          name: 'Other2',
          type: 'Event',
          cost: 0,
        }),
        'd3',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card-4',
          number: 'deck-card-4',
          name: 'Other3',
          type: 'Event',
          cost: 0,
        }),
        'd4',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sanji.instanceId,
        sourceCardId: 'ST29-004',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
    });

    it('plays from trash on trigger with hand discard cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const sanji = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST29-004',
          number: 'ST29-004',
          name: 'Sanji',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Straw Hat Crew'],
        }),
        'sanji',
      );

      const handCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-cost',
          number: 'hand-cost',
          name: 'Hand Cost',
          type: 'Event',
          cost: 0,
        }),
        'hand-cost',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: sanji.instanceId,
        sourceCardId: 'ST29-004',
      });

      const costDecision = engine.getPendingDecision();
      expect(costDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(
        p1.zones.characters.find((c) => c.instanceId === sanji.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === handCard.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST29-014 Roronoa Zoro', () => {
    it('has continuous rush:character keyword', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const zoro = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST29-014',
          number: 'ST29-014',
          name: 'Roronoa Zoro',
          type: 'Character',
          cost: 5,
          power: 6000,
          families: ['Straw Hat Crew'],
        }),
        'zoro',
      );

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(zoro.canAttackActiveCharacters).toBe(true);
    });

    it('draws and attaches rested don on activate main with trigger card discard', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const zoro = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST29-014',
          number: 'ST29-014',
          name: 'Roronoa Zoro',
          type: 'Character',
          cost: 5,
          power: 6000,
          families: ['Straw Hat Crew'],
        }),
        'zoro',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'draw-card',
          number: 'draw-card',
          name: 'Draw Card',
          type: 'Event',
          cost: 0,
        }),
        'draw-card',
      );

      const triggerCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trigger-card',
          number: 'trigger-card',
          name: 'Trigger Card',
          type: 'Character',
          cost: 2,
          power: 2000,
          trigger: '[Trigger] Do something',
        }),
        'trigger-card',
      );

      putDonInCost(host, 'p1', 3, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: zoro.instanceId,
        sourceCardId: 'ST29-014',
      });

      const costDecision = engine.getPendingDecision();
      expect(costDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [triggerCard.instanceId],
      });

      const donDecision = engine.getPendingDecision();
      if (donDecision) {
        expect(donDecision.prompt.type).toBe('selectCards');
        engine.answerDecision({
          decisionId: donDecision.id,
          selectedCardInstanceIds: [host.getPlayer('p1')!.zones.leader.instanceId],
        });
      }

      expect(
        host.getPlayer('p1')!.zones.hand.some((card) => card.cardId === 'draw-card'),
      ).toBe(true);
      expect(
        host.getPlayer('p1')!.zones.trash.some(
          (card) => card.instanceId === triggerCard.instanceId,
        ),
      ).toBe(true);
    });
  });

  describe('ST29-008 Nami', () => {
    it('has replacement effect protecting Egghead characters from opponent effect KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const nami = addCharacter(host, 'p1', {
        id: 'ST29-008',
        number: 'ST29-008',
        name: 'Nami',
        instanceSuffix: 'nami',
        cost: 3,
        power: 4000,
        families: ['Egghead'],
      });

      addLifeCards(host, 'p1', 1);

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: nami.instanceId,
        targetInstanceId: nami.instanceId,
        targetCardId: nami.cardId,
        reason: 'effect',
      });

      expect(replaced).toBe(true);
    });

    it('does not replace KO from battle', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const nami = addCharacter(host, 'p1', {
        id: 'ST29-008',
        number: 'ST29-008',
        name: 'Nami',
        instanceSuffix: 'nami',
        cost: 3,
        power: 4000,
        families: ['Egghead'],
      });

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: nami.instanceId,
        reason: 'battle',
      });

      expect(replaced).toBe(false);
    });

    it('plays from trash on trigger if leader is Monkey.D.Luffy', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.name = 'Monkey.D.Luffy';

      const nami = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST29-008',
          number: 'ST29-008',
          name: 'Nami',
          type: 'Character',
          cost: 3,
          power: 4000,
          families: ['Egghead'],
        }),
        'nami',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: nami.instanceId,
        sourceCardId: 'ST29-008',
      });

      expect(
        p1.zones.characters.find((c) => c.instanceId === nami.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST29-002 Usopp', () => {
    it('rests opponent character on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const usopp = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-002',
          number: 'ST29-002',
          name: 'Usopp',
          type: 'Character',
          cost: 3,
          power: 4000,
          families: ['Straw Hat Crew'],
        }),
        'usopp',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 2,
        power: 3000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: usopp.instanceId,
        sourceCardId: 'ST29-002',
      });

      expect(target.rested).toBe(true);
    });
  });

  describe('ST29-003 Kaku', () => {
    it('gains +1000 power when own life is less than opponent life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const kaku = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST29-003',
          number: 'ST29-003',
          name: 'Kaku',
          type: 'Character',
          cost: 2,
          power: 3000,
          families: ['CP0'],
        }),
        'kaku',
      );

      addLifeCards(host, 'p1', 2);
      addLifeCards(host, 'p2', 3);

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(kaku.power).toBe(4000);
    });

    it('does not gain power when own life is greater than opponent life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const kaku = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST29-003',
          number: 'ST29-003',
          name: 'Kaku',
          type: 'Character',
          cost: 2,
          power: 3000,
          families: ['CP0'],
        }),
        'kaku',
      );

      addLifeCards(host, 'p1', 4);
      addLifeCards(host, 'p2', 3);

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(kaku.power).toBe(3000);
    });

    it('ko opponent character cost 3 or less on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const kaku = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-003',
          number: 'ST29-003',
          name: 'Kaku',
          type: 'Character',
          cost: 2,
          power: 3000,
          families: ['CP0'],
        }),
        'kaku',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: kaku.instanceId,
        sourceCardId: 'ST29-003',
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

  describe('ST29-017 Iai Death Lion Song', () => {
    it('gives +4000 power to leader and conditionally ko cost 3 or less', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      const deathLion = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-017',
          number: 'ST29-017',
          name: 'Iai Death Lion Song',
          type: 'Event',
          cost: 2,
        }),
        'death-lion',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });

      addLifeCards(host, 'p1', 1);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: deathLion.instanceId,
        sourceCardId: 'ST29-017',
      });

      // First decision: select self leader/character for +4000 power
      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      // Second decision: select opponent character to KO
      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(p1.zones.leader.power).toBe(9000);
      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
    });

    it('draws 2 and trashes 1 on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const deathLion = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-017',
          number: 'ST29-017',
          name: 'Iai Death Lion Song',
          type: 'Event',
          cost: 2,
        }),
        'death-lion',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'd1',
          number: 'd1',
          name: 'D1',
          type: 'Event',
          cost: 0,
        }),
        'd1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'd2',
          number: 'd2',
          name: 'D2',
          type: 'Event',
          cost: 0,
        }),
        'd2',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-me',
          number: 'trash-me',
          name: 'Trash Me',
          type: 'Event',
          cost: 0,
        }),
        'trash-me',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: deathLion.instanceId,
        sourceCardId: 'ST29-017',
      });

      // Decision: select card from hand to trash
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [
          p1.zones.hand.find((c) => c.cardId === 'trash-me')!.instanceId,
        ],
      });

      expect(p1.zones.hand.length).toBe(3);
      expect(p1.zones.trash.length).toBe(1);
    });
  });

  describe('ST29-012 Monkey.D.Luffy (012)', () => {
    it('attaches rested don to a Monkey.D.Luffy card on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.name = 'Monkey.D.Luffy';

      const luffy = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-012',
          number: 'ST29-012',
          name: 'Monkey.D.Luffy',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Straw Hat Crew'],
        }),
        'luffy',
      );

      putDonInCost(host, 'p1', 3, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: 'ST29-012',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.leader.attachedDon).toBe(1);
    });
  });

  describe('ST29-013 Rob Lucci', () => {
    it('ko opponent character on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const lucci = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-013',
          number: 'ST29-013',
          name: 'Rob Lucci',
          type: 'Character',
          cost: 5,
          power: 6000,
          families: ['CP0'],
        }),
        'lucci',
      );

      addLifeCards(host, 'p1', 3);
      addLifeCards(host, 'p2', 2);

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
        power: 4000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: lucci.instanceId,
        sourceCardId: 'ST29-013',
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

  describe('ST29-015 Raw Heat Strike', () => {
    it('gives +2000 and conditionally -2000 on counter', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const rawHeat = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST29-015',
          number: 'ST29-015',
          name: 'Raw Heat Strike',
          type: 'Event',
          cost: 1,
        }),
        'raw-heat',
      );

      const oppChar = addCharacter(host, 'p2', {
        name: 'Opponent Char',
        instanceSuffix: 'opp',
        cost: 4,
        power: 5000,
      });

      addLifeCards(host, 'p1', 1);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: rawHeat.instanceId,
        sourceCardId: 'ST29-015',
      });

      // First decision: select self leader/character for +2000
      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      // Second decision: select opponent leader/character for -2000
      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [oppChar.instanceId],
      });

      expect(p1.zones.leader.power).toBe(7000);
      expect(oppChar.power).toBe(3000);
    });
  });

  describe('Structural validation', () => {
    it('all ST29 cards have valid effect definitions', () => {
      for (const card of st29EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST29-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
            if (entry.kind === 'continuous') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.modifier.selector).toBeTruthy();
            }
            if (entry.kind === 'replacement') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.event).toBeDefined();
            }
          }
        }
      }
    });

    it('ST29-001 has whenAttacking trigger with life condition', () => {
      const card = st29EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST29-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('whenAttacking');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLifeAtMost',
          player: 'self',
          value: 2,
        });
      }
    });

    it('ST29-014 has continuous rush and activateMain trigger', () => {
      const card = st29EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST29-014',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.keywords).toContain(
          'canAttackActiveCharacters',
        );
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        const trashCost = stdEntry.effect.costs?.find(
          (c) => c.type === 'trashFromHand',
        );
        expect(trashCost).toBeDefined();
      }
    });

    it('ST29-008 has replacement KO protection for Egghead and trigger', () => {
      const card = st29EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST29-008',
      );
      expect(card).toBeDefined();
      const replEntry = card!.effects?.find((e) => e.kind === 'replacement');
      expect(replEntry).toBeDefined();
      if (replEntry?.kind === 'replacement') {
        expect(replEntry.effect.event).toBe('wouldKoCharacter');
        expect(replEntry.effect.optional).toBe(true);
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('trigger');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderName',
          player: 'self',
          value: 'Monkey.D.Luffy',
        });
      }
    });

    it('ST29-003 has continuous power condition and trigger KO', () => {
      const card = st29EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST29-003',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.power).toBe(1000);
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('trigger');
      }
    });

    it('ST29-016 has activateMain and activateCounter', () => {
      const card = st29EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST29-016',
      );
      expect(card).toBeDefined();
      const mainEntry = card!.effects?.find(
        (e) =>
          e.kind === 'standard' && e.effect.trigger.type === 'activateMain',
      );
      expect(mainEntry).toBeDefined();
      if (mainEntry?.kind === 'standard') {
        expect(mainEntry.effect.actions[0].type).toBe('grantKeywords');
      }
      const counterEntry = card!.effects?.find(
        (e) =>
          e.kind === 'standard' && e.effect.trigger.type === 'activateCounter',
      );
      expect(counterEntry).toBeDefined();
    });

    it('ST29-017 has activateCounter and trigger draw 2 trash 1', () => {
      const card = st29EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST29-017',
      );
      expect(card).toBeDefined();
      const stdEntries = card!.effects?.filter((e) => e.kind === 'standard');
      expect(stdEntries?.length).toBe(2);
      const counterEntry = stdEntries?.find(
        (e) =>
          e.kind === 'standard' && e.effect.trigger.type === 'activateCounter',
      );
      expect(counterEntry).toBeDefined();
      if (counterEntry?.kind === 'standard') {
        expect(counterEntry.effect.actions[0].type).toBe('modifyPower');
        expect(counterEntry.effect.actions[0].amount).toBe(4000);
      }
      const triggerEntry = stdEntries?.find(
        (e) => e.kind === 'standard' && e.effect.trigger.type === 'trigger',
      );
      expect(triggerEntry).toBeDefined();
    });
  });
});
