/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { DuelCard, createDuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../../effect-engine/src/effect-engine.js';
import { st09EffectDefinitions } from './ST-09.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST09 effect definitions', () => {
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

  it('exports ST09 edition definitions', () => {
    expect(st09EffectDefinitions.editionId).toBe('ST-09');
  });

  it('each card has valid effect entries', () => {
    const validKinds = new Set([
      'standard',
      'continuous',
      'replacement',
      'special-ref',
    ]);

    for (const card of st09EffectDefinitions.cards) {
      expect(card.cardId).toBeTruthy();
      expect(card.effects).toBeDefined();

      for (const entry of card.effects ?? []) {
        expect(validKinds.has(entry.kind)).toBe(true);

        if (entry.kind === 'special-ref') {
          expect(entry.specialHandlerId).toBeTruthy();
        }

        if (entry.kind === 'standard' && entry.effect) {
          expect(entry.effect.id).toBeTruthy();
          expect(entry.effect.text).toBeTruthy();
          expect(entry.effect.trigger).toBeTruthy();
          expect(entry.effect.trigger.type).toBeTruthy();
          expect(Array.isArray(entry.effect.actions)).toBe(true);
        }

        if (entry.kind === 'continuous' && entry.effect) {
          expect(entry.effect.id).toBeTruthy();
          expect(entry.effect.text).toBeTruthy();
          expect(entry.effect.modifier).toBeTruthy();
          expect(entry.effect.modifier.selector).toBeTruthy();
        }

        if (entry.kind === 'replacement' && entry.effect) {
          expect(entry.effect.id).toBeTruthy();
          expect(entry.effect.text).toBeTruthy();
          expect(entry.effect.event).toBeTruthy();
          expect(Array.isArray(entry.effect.replacement)).toBe(true);
        }
      }
    }
  });

  it('all effect IDs are unique', () => {
    const ids = new Set<string>();
    const duplicates: string[] = [];

    for (const card of st09EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind !== 'special-ref' && entry.effect) {
          if (ids.has(entry.effect.id)) {
            duplicates.push(entry.effect.id);
          }
          ids.add(entry.effect.id);
        }
      }
    }

    expect(duplicates).toEqual([]);
  });

  describe('ST09-001 Yamato (Leader)', () => {
    it('gains +1000 power when DON!! x1 attached, opponent turn, and life ≤ 2', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST09-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      host.state.activePlayerSessionId = 'p2';
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.leader.attachedDon = 1;

      const basePower = p1.zones.leader.power;
      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(basePower + 1000);
    });

    it('does NOT gain power without DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST09-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      host.state.activePlayerSessionId = 'p2';
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.leader.attachedDon = 0;

      const basePower = p1.zones.leader.power;
      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(basePower);
    });

    it('does NOT gain power during own turn', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST09-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      host.state.activePlayerSessionId = 'p1';
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.leader.attachedDon = 1;

      const basePower = p1.zones.leader.power;
      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(basePower);
    });

    it('does NOT gain power with more than 2 life', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST09-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      host.state.activePlayerSessionId = 'p2';
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.leader.attachedDon = 1;

      const basePower = p1.zones.leader.power;
      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(basePower);
    });
  });

  describe('ST09-004 Kaido', () => {
    it('gains cannotBeKoedInBattle when DON!! x1 and life ≤ 2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const kaido = addCharacter(host, 'p1', {
        id: 'ST09-004',
        number: 'ST09-004',
        name: 'Kaido',
        instanceSuffix: 'kaido',
      });
      const p1 = host.getPlayer('p1')!;

      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      kaido.attachedDon = 1;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(kaido.cannotBeKoedInBattle).toBe(true);
    });

    it('does NOT gain cannotBeKoedInBattle without DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const kaido = addCharacter(host, 'p1', {
        id: 'ST09-004',
        number: 'ST09-004',
        name: 'Kaido',
        instanceSuffix: 'kaido',
      });
      const p1 = host.getPlayer('p1')!;

      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      kaido.attachedDon = 0;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(kaido.cannotBeKoedInBattle).toBeFalsy();
    });

    it('does NOT gain cannotBeKoedInBattle with more than 2 life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const kaido = addCharacter(host, 'p1', {
        id: 'ST09-004',
        number: 'ST09-004',
        name: 'Kaido',
        instanceSuffix: 'kaido',
      });
      const p1 = host.getPlayer('p1')!;

      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      kaido.attachedDon = 1;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(kaido.cannotBeKoedInBattle).toBeFalsy();
    });
  });

  describe('ST09-005 Kouzuki Oden', () => {
    it('gains doubleAttack when DON!! x1 is attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const oden = addCharacter(host, 'p1', {
        id: 'ST09-005',
        number: 'ST09-005',
        name: 'Kouzuki Oden',
        instanceSuffix: 'oden',
      });
      oden.attachedDon = 1;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(oden.hasDoubleAttack).toBe(true);
    });

    it('does NOT have doubleAttack without DON!!', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const oden = addCharacter(host, 'p1', {
        id: 'ST09-005',
        number: 'ST09-005',
        name: 'Kouzuki Oden',
        instanceSuffix: 'oden',
      });
      oden.attachedDon = 0;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.reapplyContinuousEffects();

      expect(oden.hasDoubleAttack).toBeFalsy();
    });

    it('trashes 2 from hand on KO to add top of deck to life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const oden = addCharacter(host, 'p1', {
        id: 'ST09-005',
        number: 'ST09-005',
        name: 'Kouzuki Oden',
        instanceSuffix: 'oden',
      });

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({ id: 'H1', number: 'H1', name: 'Card1', type: 'Character' }),
        'hand1',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({ id: 'H2', number: 'H2', name: 'Card2', type: 'Character' }),
        'hand2',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'D1',
          number: 'D1',
          name: 'DeckCard',
          type: 'Character',
        }),
        'deck1',
      );

      const initialLifeCount = p1.zones.life.length;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: oden.instanceId,
        sourceCardId: 'ST09-005',
      });

      expect(p1.zones.life.length).toBe(initialLifeCount + 1);
      expect(p1.zones.life[0].cardId).toBe('D1');
    });
  });

  describe('ST09-007 Shinobu', () => {
    it('on block, moves a life card to hand and gains +4000 power', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const shinobu = addCharacter(host, 'p1', {
        id: 'ST09-007',
        number: 'ST09-007',
        name: 'Shinobu',
        instanceSuffix: 'shinobu',
      });
      const p1 = host.getPlayer('p1')!;

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'L1',
          number: 'L1',
          name: 'LifeCard',
          type: 'Character',
        }),
        'life1',
      );

      const basePower = shinobu.power;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.handleEvent({
        type: 'onBlock',
        playerSessionId: 'p1',
        sourceInstanceId: shinobu.instanceId,
        sourceCardId: 'ST09-007',
      });

      expect(p1.zones.life.length).toBe(0);
      expect(shinobu.power).toBe(basePower + 4000);
    });
  });

  describe('ST09-008 Shimotsuki Ushimaru', () => {
    it('with DON!! x1, moves life card to hand and plays a yellow Land of Wano character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const ushimaru = addCharacter(host, 'p1', {
        id: 'ST09-008',
        number: 'ST09-008',
        name: 'Shimotsuki Ushimaru',
        instanceSuffix: 'ushimaru',
      });
      const p1 = host.getPlayer('p1')!;

      ushimaru.attachedDon = 1;

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'L1',
          number: 'L1',
          name: 'LifeCard',
          type: 'Character',
        }),
        'life1',
      );

      const wanoChar = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'WANO1',
          number: 'WANO1',
          name: 'Wano Samurai',
          type: 'Character',
          cost: 3,
          power: 4000,
          colors: ['Yellow'],
          families: ['Land of Wano'],
        }),
        'wano1',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: ushimaru.instanceId,
        sourceCardId: 'ST09-008',
      });

      // The play action uses upTo selector, so we must answer the decision
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [wanoChar.instanceId],
      });

      expect(p1.zones.characters).toContain(wanoChar);
      expect(p1.zones.life.length).toBe(0);
    });

    it('does NOT trigger without DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const ushimaru = addCharacter(host, 'p1', {
        id: 'ST09-008',
        number: 'ST09-008',
        name: 'Shimotsuki Ushimaru',
        instanceSuffix: 'ushimaru',
      });
      const p1 = host.getPlayer('p1')!;
      ushimaru.attachedDon = 0;

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'L1',
          number: 'L1',
          name: 'LifeCard',
          type: 'Character',
        }),
        'life1',
      );

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'WANO1',
          number: 'WANO1',
          name: 'Wano Samurai',
          type: 'Character',
          cost: 3,
          power: 4000,
          colors: ['Yellow'],
          families: ['Land of Wano'],
        }),
        'wano1',
      );

      const initialCharCount = p1.zones.characters.length;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: ushimaru.instanceId,
        sourceCardId: 'ST09-008',
      });

      expect(p1.zones.characters.length).toBe(initialCharCount);
      expect(p1.zones.life.length).toBe(1);
    });
  });

  describe('ST09-010 Portgas.D.Ace (replacement)', () => {
    it('has a wouldKoCharacter replacement effect defined', () => {
      const card = st09EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST09-010',
      );
      expect(card).toBeDefined();
      const entry = card!.effects![0];
      expect(entry.kind).toBe('replacement');
      if (entry.kind === 'replacement') {
        expect(entry.effect.event).toBe('wouldKoCharacter');
        expect(entry.effect.oncePerTurn).toBe(true);
        expect(entry.effect.optional).toBe(true);
      }
    });

    it('trashes a life card to prevent KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const ace = addCharacter(host, 'p1', {
        id: 'ST09-010',
        number: 'ST09-010',
        name: 'Portgas.D.Ace',
        instanceSuffix: 'ace',
      });
      const p1 = host.getPlayer('p1')!;

      const lifeCard = host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'L1',
          number: 'L1',
          name: 'LifeCard',
          type: 'Character',
        }),
        'life1',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: ace.instanceId,
        reason: 'battle',
      });

      expect(replaced).toBe(true);
      expect(p1.zones.trash).toContain(lifeCard);
      expect(p1.zones.characters).toContain(ace);
    });

    it('respects once per turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const ace = addCharacter(host, 'p1', {
        id: 'ST09-010',
        number: 'ST09-010',
        name: 'Portgas.D.Ace',
        instanceSuffix: 'ace',
      });
      const p1 = host.getPlayer('p1')!;

      // First replacement: 1 life card, auto-resolves
      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'L1',
          number: 'L1',
          name: 'LifeCard1',
          type: 'Character',
        }),
        'life1',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      const first = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: ace.instanceId,
        reason: 'battle',
      });
      expect(first).toBe(true);
      expect(p1.zones.life.length).toBe(0);

      // Second KO attempt: oncePerTurn should prevent the replacement
      // (Effect was already used this turn per the same-turn tracking)
      const second = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: ace.instanceId,
        reason: 'battle',
      });
      expect(second).toBe(false);
    });

    it('does NOT trigger if no life cards are available', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const ace = addCharacter(host, 'p1', {
        id: 'ST09-010',
        number: 'ST09-010',
        name: 'Portgas.D.Ace',
        instanceSuffix: 'ace',
      });

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      // No life cards - condition check fails, replacement should not fire
      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: ace.instanceId,
        reason: 'battle',
      });

      expect(replaced).toBe(false);
    });
  });

  describe('ST09-012 Yamato (Character)', () => {
    it('moves life to hand and gains +2000 power until next turn when attacking', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const yamato = addCharacter(host, 'p1', {
        id: 'ST09-012',
        number: 'ST09-012',
        name: 'Yamato',
        instanceSuffix: 'yamato',
      });
      const p1 = host.getPlayer('p1')!;

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'L1',
          number: 'L1',
          name: 'LifeCard',
          type: 'Character',
        }),
        'life1',
      );

      const basePower = yamato.power;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: yamato.instanceId,
        sourceCardId: 'ST09-012',
      });

      // modifyPower with exact count 1 auto-resolves: life card moved, power boosted
      expect(p1.zones.life.length).toBe(0);
      expect(yamato.power).toBe(basePower + 2000);
    });
  });

  describe('ST09-014 Narikabura Arrow', () => {
    it('reduces opponent power by -3000 as counter when life ≤ 2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());

      const opponentChar = addCharacter(host, 'p2', {
        name: 'Opponent',
        instanceSuffix: 'opp',
        power: 5000,
      });

      // Add the event card to hand so it can be found as source
      const narikabura = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST09-014',
          number: 'ST09-014',
          name: 'Narikabura Arrow',
          type: 'Event',
          cost: 1,
        }),
        'narikabura',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      const basePower = opponentChar.power;
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: narikabura.instanceId,
        sourceCardId: 'ST09-014',
      });

      // modifyPower with upTo requires a decision
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [opponentChar.instanceId],
      });

      expect(opponentChar.power).toBe(basePower - 3000);
    });

    it('does NOT reduce power as counter when life > 2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());

      const opponentChar = addCharacter(host, 'p2', {
        name: 'Opponent',
        instanceSuffix: 'opp',
        power: 5000,
      });

      const narikabura = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST09-014',
          number: 'ST09-014',
          name: 'Narikabura Arrow',
          type: 'Event',
          cost: 1,
        }),
        'narikabura',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      const basePower = opponentChar.power;
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: narikabura.instanceId,
        sourceCardId: 'ST09-014',
      });

      // Condition fails so no effect fires - no pending decision
      expect(engine.hasPendingDecision()).toBe(false);
      expect(opponentChar.power).toBe(basePower);
    });

    it('trashes 2 from hand to add top of deck to life as trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({ id: 'H1', number: 'H1', name: 'Card1', type: 'Character' }),
        'hand1',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({ id: 'H2', number: 'H2', name: 'Card2', type: 'Character' }),
        'hand2',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'D1',
          number: 'D1',
          name: 'DeckCard',
          type: 'Character',
        }),
        'deck1',
      );

      // Add the card itself to trash so trigger can fire
      const narikabura = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST09-014',
          number: 'ST09-014',
          name: 'Narikabura Arrow',
          type: 'Event',
          cost: 1,
        }),
        'narikabura',
      );

      const initialLifeCount = p1.zones.life.length;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: narikabura.instanceId,
        sourceCardId: 'ST09-014',
      });

      // Should have trashed 2 cards from hand (auto-resolved since exact count matches)
      expect(p1.zones.hand.length).toBe(0);
      expect(p1.zones.life.length).toBe(initialLifeCount + 1);
      expect(p1.zones.life[0].cardId).toBe('D1');
    });
  });

  describe('ST09-015 Thunder Bagua', () => {
    it('adds +4000 power to own leader as counter', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const thunderBagua = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST09-015',
          number: 'ST09-015',
          name: 'Thunder Bagua',
          type: 'Event',
          cost: 2,
        }),
        'thunder-bagua',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      const basePower = p1.zones.leader.power;
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: thunderBagua.instanceId,
        sourceCardId: 'ST09-015',
      });

      // modifyPower with upTo requires a decision
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.leader.power).toBe(basePower + 4000);
    });

    it('moves opponent character to life when life ≤ 2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 4000,
      });

      const thunderBagua = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST09-015',
          number: 'ST09-015',
          name: 'Thunder Bagua',
          type: 'Event',
          cost: 2,
        }),
        'thunder-bagua',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: thunderBagua.instanceId,
        sourceCardId: 'ST09-015',
      });

      // First decision: modifyPower target selection
      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      // Second decision: moveCard target selection (ifConditionsMatch triggered)
      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(p2.zones.life).toContain(target);
      expect(p2.zones.characters).not.toContain(target);
    });

    it('does NOT move opponent character when life > 2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());
      p1.zones.life.push(new DuelCard());

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 4000,
      });

      const thunderBagua = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST09-015',
          number: 'ST09-015',
          name: 'Thunder Bagua',
          type: 'Event',
          cost: 2,
        }),
        'thunder-bagua',
      );

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );

      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: thunderBagua.instanceId,
        sourceCardId: 'ST09-015',
      });

      // Only one decision needed (modifyPower), the ifConditionsMatch fails
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p2.zones.characters).toContain(target);
      expect(p2.zones.life.length).toBe(0);
    });

    it('draws 1 card as trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const deckCard = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'D1',
          number: 'D1',
          name: 'DeckCard',
          type: 'Character',
        }),
        'deck1',
      );

      const thunderBagua = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST09-015',
          number: 'ST09-015',
          name: 'Thunder Bagua',
          type: 'Event',
          cost: 2,
        }),
        'thunder-bagua',
      );

      const initialHandSize = p1.zones.hand.length;

      const engine = new EffectEngine(
        createRegistry([st09EffectDefinitions]),
        host,
      );
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: thunderBagua.instanceId,
        sourceCardId: 'ST09-015',
      });

      expect(p1.zones.hand.length).toBe(initialHandSize + 1);
      expect(p1.zones.hand[p1.zones.hand.length - 1].cardId).toBe('D1');
      expect(p1.zones.deck.length).toBe(0);
    });
  });
});
