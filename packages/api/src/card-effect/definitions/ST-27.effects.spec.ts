/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import { type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../effect-engine';
import { st27EffectDefinitions } from './ST-27.effects';
import { createRegistry, makeCard, TestHost } from './test-utils';

describe('ST27 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st27EffectDefinitions]);
    return new EffectEngine(registry, host);
  };

  const addCharacter = (
    host: TestHost,
    sessionId: string,
    overrides: Partial<Card> & { instanceSuffix: string },
  ) =>
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

  describe('ST27-005 Marshall.D.Teach', () => {
    it('KO up to 1 character with cost 3 or less on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const teach = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST27-005',
          number: 'ST27-005',
          name: 'Marshall.D.Teach',
          type: 'Character',
          cost: 8,
          power: 8000,
          families: ['Blackbeard Pirates'],
        }),
        'teach',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });
      addCharacter(host, 'p2', {
        name: 'Big Target',
        instanceSuffix: 'big-target',
        cost: 5,
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: teach.instanceId,
        sourceCardId: 'ST27-005',
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
        p2.zones.characters.find((c) => c.instanceId === 'p2:big-target'),
      ).toBeTruthy();
      expect(p2.zones.trash.length).toBe(1);
    });

    it('adds up to 1 black card from trash to hand on KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const teach = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST27-005',
          number: 'ST27-005',
          name: 'Marshall.D.Teach',
          type: 'Character',
          cost: 8,
          power: 8000,
          families: ['Blackbeard Pirates'],
        }),
        'teach',
      );

      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'black-card',
          number: 'black-card',
          name: 'Black Card',
          type: 'Event',
          cost: 2,
          colors: ['Black'],
        }),
        'black-card',
      );
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'red-card',
          number: 'red-card',
          name: 'Red Card',
          type: 'Event',
          cost: 0,
          colors: ['Red'],
        }),
        'red-card',
      );

      const blackCard = p1.zones.trash.find((c) => c.cardId === 'black-card')!;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: teach.instanceId,
        sourceCardId: 'ST27-005',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [blackCard.instanceId],
      });

      expect(p1.zones.hand.find((c) => c.cardId === 'black-card')).toBeTruthy();
      expect(p1.zones.trash.find((c) => c.cardId === 'red-card')).toBeTruthy();
    });
  });

  describe('ST27-003 Kuzan', () => {
    it('plays Blackbeard Pirates character from trash rested on KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const kuzan = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST27-003',
          number: 'ST27-003',
          name: 'Kuzan',
          type: 'Character',
          cost: 5,
          power: 6000,
          families: ['Blackbeard Pirates'],
        }),
        'kuzan',
      );

      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'bb-character',
          number: 'bb-character',
          name: 'Blackbeard Pirate',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Blackbeard Pirates'],
        }),
        'bb-character',
      );

      const bbCharacter = p1.zones.trash.find(
        (c) => c.cardId === 'bb-character',
      )!;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: kuzan.instanceId,
        sourceCardId: 'ST27-003',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [bbCharacter.instanceId],
      });

      const played = p1.zones.characters.find(
        (c) => c.cardId === 'bb-character',
      );
      expect(played).toBeTruthy();
      expect(played?.rested).toBe(true);
    });
  });

  describe('ST27-002 Catarina Devon', () => {
    it('trashes self, reduces opponent character cost by 1 on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const leader = host.getPlayer('p1')!.zones.leader;
      leader.families = ['Blackbeard Pirates'];

      const devon = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST27-002',
          number: 'ST27-002',
          name: 'Catarina Devon',
          type: 'Character',
          cost: 3,
          power: 4000,
          families: ['Blackbeard Pirates'],
        }),
        'devon',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: devon.instanceId,
        sourceCardId: 'ST27-002',
      });

      expect(
        host
          .getPlayer('p1')!
          .zones.characters.find((c) => c.instanceId === devon.instanceId),
      ).toBeFalsy();
      expect(
        host
          .getPlayer('p1')!
          .zones.trash.find((c) => c.instanceId === devon.instanceId),
      ).toBeTruthy();
    });

    it('draws 1 card on KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      // Give p1 some cards in deck to draw from
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card',
          number: 'deck-card',
          name: 'Deck Card',
          type: 'Event',
          cost: 0,
        }),
        'deck-card',
      );

      const devon = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST27-002',
          number: 'ST27-002',
          name: 'Catarina Devon',
          type: 'Character',
          cost: 3,
          power: 4000,
          families: ['Blackbeard Pirates'],
        }),
        'devon',
      );

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: devon.instanceId,
        sourceCardId: 'ST27-002',
      });

      expect(p1.zones.hand.length).toBe(handBefore + 1);
    });
  });

  describe('ST27-004 Sanjuan.Wolf', () => {
    it('trashes 1 card from hand on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-card',
          number: 'hand-card',
          name: 'Hand Card',
          type: 'Event',
          cost: 0,
        }),
        'hand-card',
      );

      const wolf = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST27-004',
          number: 'ST27-004',
          name: 'Sanjuan.Wolf',
          type: 'Character',
          cost: 5,
          power: 5000,
          families: ['Blackbeard Pirates'],
        }),
        'wolf',
      );

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: wolf.instanceId,
        sourceCardId: 'ST27-004',
      });

      const costDecision = engine.getPendingDecision();
      expect(costDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: ['p1:hand-card'],
      });

      expect(p1.zones.hand.length).toBe(handBefore - 1);
      expect(p1.zones.trash.find((c) => c.cardId === 'hand-card')).toBeTruthy();
    });
  });

  describe('ST27-001 Avalo Pizarro', () => {
    it('gains +4000 power on activate main with Blackbeard Pirates leader', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const leader = host.getPlayer('p1')!.zones.leader;
      leader.families = ['Blackbeard Pirates'];

      const pizarro = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST27-001',
          number: 'ST27-001',
          name: 'Avalo Pizarro',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Blackbeard Pirates'],
        }),
        'pizarro',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: pizarro.instanceId,
        sourceCardId: 'ST27-001',
      });

      expect(pizarro.power).toBe(5000);
    });

    it('draws 1 card on KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card',
          number: 'deck-card',
          name: 'Deck Card',
          type: 'Event',
          cost: 0,
        }),
        'deck-card',
      );

      const pizarro = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST27-001',
          number: 'ST27-001',
          name: 'Avalo Pizarro',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Blackbeard Pirates'],
        }),
        'pizarro',
      );

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: pizarro.instanceId,
        sourceCardId: 'ST27-001',
      });

      expect(p1.zones.hand.length).toBe(handBefore + 1);
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st27EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST27-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
            if (entry.kind === 'replacement') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.replacement.length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    it('ST27-005 has activateMain and onKo effects', () => {
      const card = st27EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST27-005',
      );
      expect(card).toBeDefined();
      const stdEffects = card!.effects?.filter((e) => e.kind === 'standard');
      expect(stdEffects).toHaveLength(2);
      if (stdEffects?.[0]?.kind === 'standard') {
        expect(stdEffects[0].effect.trigger.type).toBe('activateMain');
      }
      if (stdEffects?.[1]?.kind === 'standard') {
        expect(stdEffects[1].effect.trigger.type).toBe('onKo');
      }
    });

    it('ST27-003 has onKo effect to play from trash', () => {
      const card = st27EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST27-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onKo');
        expect(stdEntry.effect.actions[0].type).toBe('play');
      }
    });

    it('ST27-002 has activateMain with moveCard cost and onKo draw', () => {
      const card = st27EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST27-002',
      );
      expect(card).toBeDefined();
      const stdEffects = card!.effects?.filter((e) => e.kind === 'standard');
      expect(stdEffects).toHaveLength(2);
      if (stdEffects?.[0]?.kind === 'standard') {
        expect(stdEffects[0].effect.trigger.type).toBe('activateMain');
        expect(stdEffects[0].effect.costs).toBeDefined();
        expect(stdEffects[0].effect.costs![0].type).toBe('moveCard');
        expect(stdEffects[0].effect.actions[0].type).toBe('modifyCost');
      }
      if (stdEffects?.[1]?.kind === 'standard') {
        expect(stdEffects[1].effect.trigger.type).toBe('onKo');
        expect(stdEffects[1].effect.actions[0].type).toBe('draw');
      }
    });

    it('ST27-004 has special-ref and onPlay trash effect', () => {
      const card = st27EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST27-004',
      );
      expect(card).toBeDefined();
      const specialRef = card!.effects?.find((e) => e.kind === 'special-ref');
      expect(specialRef).toBeDefined();
      if (specialRef?.kind === 'special-ref') {
        expect(specialRef.specialHandlerId).toBe('st27-004-special');
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions[0].type).toBe('trashFromHand');
      }
    });

    it('ST27-001 has activateMain with oncePerTurn and onKo draw', () => {
      const card = st27EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST27-001',
      );
      expect(card).toBeDefined();
      const stdEffects = card!.effects?.filter((e) => e.kind === 'standard');
      expect(stdEffects).toHaveLength(2);
      if (stdEffects?.[0]?.kind === 'standard') {
        expect(stdEffects[0].effect.trigger.type).toBe('activateMain');
        expect(stdEffects[0].effect.trigger.oncePerTurn).toBe(true);
        expect(stdEffects[0].effect.actions[0].type).toBe('modifyPower');
      }
      if (stdEffects?.[1]?.kind === 'standard') {
        expect(stdEffects[1].effect.trigger.type).toBe('onKo');
        expect(stdEffects[1].effect.actions[0].type).toBe('draw');
      }
    });
  });
});
