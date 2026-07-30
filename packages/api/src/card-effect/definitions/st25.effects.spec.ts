/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import type { Card } from '@onepiecetcg/shared';
import { DuelCard } from '@onepiecetcg/shared';
import { EffectEngine } from '../effect-engine';
import { st25EffectDefinitions } from './st25.effects';
import { createRegistry, makeCard, TestHost } from './test-utils';

describe('ST25 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const reg = createRegistry([st25EffectDefinitions]);
    return new EffectEngine(reg, host);
  };

  const getRegistry = () => createRegistry([st25EffectDefinitions]);

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

  describe('ST25-001 Alvida', () => {
    it('has continuous effect for +1 cost when 2+ base cost 5+ characters exist', () => {
      const registry = getRegistry();
      const alvida = registry.effectsByCardId['ST25-001'];
      expect(alvida).toBeDefined();
      expect(alvida.continuous).toHaveLength(1);
      expect(alvida.continuous![0].modifier.cost).toBe(1);
      expect(alvida.continuous![0].conditions).toContainEqual({
        type: 'targetCountAtLeast',
        selector: {
          player: 'self',
          zones: ['characters'],
          filter: {
            cardCategory: ['Character'],
            baseCostMin: 5,
          },
          count: { kind: 'any' },
        },
        value: 2,
      });
    });

    it('draws 3 and trashes 2 on play with Buggy leader', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST25-004'); // leader card id
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      // Rename leader to Buggy
      p1.zones.leader.name = 'Buggy';
      p1.zones.leader.cardId = 'Buggy';

      const alvida = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST25-001',
          number: 'ST25-001',
          name: 'Alvida',
          type: 'Character',
          cost: 3,
          power: 4000,
        }),
        'alvida',
      );

      // Add 3 deck cards for drawing
      for (let i = 0; i < 3; i++) {
        host.addCardToZone(
          'p1',
          'deck',
          makeCard({
            id: `deck-${i}`,
            number: `deck-${i}`,
            name: `Deck ${i}`,
            type: 'Event',
            cost: 0,
          }),
          `deck-${i}`,
        );
      }

      // Add 2 hand cards to trash
      const trash1 = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-1',
          number: 'trash-1',
          name: 'Trash 1',
          type: 'Event',
          cost: 0,
        }),
        'trash-1',
      );
      const trash2 = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-2',
          number: 'trash-2',
          name: 'Trash 2',
          type: 'Event',
          cost: 0,
        }),
        'trash-2',
      );

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: alvida.instanceId,
        sourceCardId: 'ST25-001',
      });

      // Draw 3: handBefore + 3
      const afterDraw = handBefore + 3;
      expect(p1.zones.hand.length).toBe(afterDraw);

      // Trash decision: select 2 cards
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      expect((decision?.prompt as any).min).toBe(2);
      expect((decision?.prompt as any).max).toBe(2);

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [trash1.instanceId, trash2.instanceId],
      });

      // Hand should be afterDraw - 2
      expect(p1.zones.hand.length).toBe(afterDraw - 2);
      expect(
        p1.zones.trash.find((c) => c.instanceId === trash1.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === trash2.instanceId),
      ).toBeTruthy();
    });

    it('does nothing on play when leader is not Buggy', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'NonBuggy');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const alvida = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST25-001',
          number: 'ST25-001',
          name: 'Alvida',
          type: 'Character',
          cost: 3,
          power: 4000,
        }),
        'alvida',
      );

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: alvida.instanceId,
        sourceCardId: 'ST25-001',
      });

      expect(p1.zones.hand.length).toBe(handBefore);
    });
  });

  describe('ST25-002 Cabaji', () => {
    it('has continuous blocker/cost effect and opponent turn power effect', () => {
      const registry = getRegistry();
      const cabaji = registry.effectsByCardId['ST25-002'];
      expect(cabaji).toBeDefined();
      expect(cabaji.continuous).toHaveLength(2);

      const blockerEffect = cabaji.continuous![0];
      expect(blockerEffect.modifier.keywords).toContain('blocker');
      expect(blockerEffect.modifier.cost).toBe(1);

      const powerEffect = cabaji.continuous![1];
      expect(powerEffect.modifier.power).toBe(5000);
      expect(powerEffect.conditions).toContainEqual({
        type: 'controllerTurn',
        value: false,
      });
    });
  });

  describe('ST25-003 Crocodile & Mihawk', () => {
    it('draws 2, trashes 1, and plays Cross Guild on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      // Add ST25-003 as a regular character on the field (not leader)
      const leader = addCharacter(host, 'p1', {
        id: 'ST25-003',
        number: 'ST25-003',
        name: 'Crocodile & Mihawk',
        cost: 7,
        power: 7000,
        instanceSuffix: 'croc-mihawk',
      });

      // Deck cards for drawing
      for (let i = 0; i < 2; i++) {
        host.addCardToZone(
          'p1',
          'deck',
          makeCard({
            id: `deck-${i}`,
            number: `deck-${i}`,
            name: `Deck ${i}`,
            type: 'Event',
            cost: 0,
          }),
          `deck-${i}`,
        );
      }

      // Cross Guild card in hand to play
      const crossGuildCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'cross-guild-char',
          number: 'cross-guild-char',
          name: 'Cross Guild Fighter',
          type: 'Character',
          cost: 3,
          power: 4000,
          families: ['Cross Guild'],
        }),
        'cross-guild',
      );

      // Card to trash from hand
      const trashCard = host.addCardToZone(
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

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: leader.instanceId,
        sourceCardId: 'ST25-003',
      });

      // Draw 2: handBefore + 2
      const afterDraw = handBefore + 2;
      expect(p1.zones.hand.length).toBe(afterDraw);

      // Trash decision: up to 1
      const trashDecision = engine.getPendingDecision();
      expect(trashDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: trashDecision!.id,
        selectedCardInstanceIds: [trashCard.instanceId],
      });

      // Play decision: select Cross Guild
      const playDecision = engine.getPendingDecision();
      expect(playDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: playDecision!.id,
        selectedCardInstanceIds: [crossGuildCard.instanceId],
      });

      expect(
        p1.zones.characters.find(
          (c) => c.instanceId === crossGuildCard.instanceId,
        ),
      ).toBeTruthy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === trashCard.instanceId),
      ).toBeTruthy();
    });

    it('has replacement effect for Cross Guild removal by opponent effect', () => {
      const registry = getRegistry();
      const leader = registry.effectsByCardId['ST25-003'];
      expect(leader).toBeDefined();
      expect(leader.replacements).toHaveLength(1);
      const repl = leader.replacements![0];
      expect(repl.event).toBe('wouldMoveCard');
      expect(repl.oncePerTurn).toBe(true);
      expect(repl.optional).toBe(true);
      expect(repl.conditions).toContainEqual({
        type: 'eventReasonIs',
        value: 'effect',
      });
      expect(repl.conditions).toContainEqual({
        type: 'eventEffectControllerIs',
        player: 'opponent',
      });
      expect(repl.conditions).toContainEqual({
        type: 'eventTargetMatchesFilter',
        filter: { trait: ['Cross Guild'] },
      });
      expect(repl.replacement[0].type).toBe('trashFromHand');
    });
  });

  describe('ST25-004 Buggy', () => {
    it('trashes hand and self to play Cross Guild with Buggy leader', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST25-004');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Buggy';
      p1.zones.leader.cardId = 'Buggy';

      const buggy = addCharacter(host, 'p1', {
        id: 'ST25-004',
        instanceSuffix: 'buggy',
        name: 'Buggy',
        cost: 5,
        power: 6000,
      });

      const crossGuildCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'cross-guild-char',
          number: 'cross-guild-char',
          name: 'Cross Guild Fighter',
          type: 'Character',
          cost: 5,
          power: 5000,
          families: ['Cross Guild'],
        }),
        'cross-guild',
      );

      const handCost = host.addCardToZone(
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
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: buggy.instanceId,
        sourceCardId: 'ST25-004',
      });

      // First: select 1 card from hand to trash (cost 1)
      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      expect((decision?.prompt as any).min).toBe(1);
      expect((decision?.prompt as any).max).toBe(1);
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCost.instanceId],
      });

      // Second: play Cross Guild from hand (action)
      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [crossGuildCard.instanceId],
      });

      // Buggy should be trashed (self-cost)
      expect(
        p1.zones.characters.find((c) => c.instanceId === buggy.instanceId),
      ).toBeFalsy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === buggy.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === handCost.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.characters.find(
          (c) => c.instanceId === crossGuildCard.instanceId,
        ),
      ).toBeTruthy();
    });

    it('does nothing when leader is not Buggy', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'NonBuggy');
      host.addPlayer('p2');

      const buggy = addCharacter(host, 'p1', {
        id: 'ST25-004',
        instanceSuffix: 'buggy',
        name: 'Buggy',
        cost: 5,
        power: 6000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: buggy.instanceId,
        sourceCardId: 'ST25-004',
      });

      expect(engine.getPendingDecision()).toBeNull();
    });
  });

  describe('ST25-005 Mohji', () => {
    it('has continuous effect for blocker and +1 cost', () => {
      const registry = getRegistry();
      const mohji = registry.effectsByCardId['ST25-005'];
      expect(mohji).toBeDefined();
      expect(mohji.continuous).toHaveLength(1);
      expect(mohji.continuous![0].modifier.keywords).toContain('blocker');
      expect(mohji.continuous![0].modifier.cost).toBe(1);
    });

    it('draws 1 on KO with Buggy leader and 3 or less hand cards', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST25-005');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Buggy';
      p1.zones.leader.cardId = 'Buggy';

      const mohji = addCharacter(host, 'p1', {
        id: 'ST25-005',
        instanceSuffix: 'mohji',
        name: 'Mohji',
        cost: 3,
        power: 4000,
      });

      // Add 1 deck card to draw
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

      const deckBefore = p1.zones.deck.length;
      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: mohji.instanceId,
        sourceCardId: 'ST25-005',
      });

      expect(p1.zones.hand.length).toBe(handBefore + 1);
      expect(p1.zones.deck.length).toBe(deckBefore - 1);
    });

    it('does not draw on KO when hand has more than 3 cards', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST25-005');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Buggy';
      p1.zones.leader.cardId = 'Buggy';

      const mohji = addCharacter(host, 'p1', {
        id: 'ST25-005',
        instanceSuffix: 'mohji',
        name: 'Mohji',
        cost: 3,
        power: 4000,
      });

      // Add 4 cards to hand
      for (let i = 0; i < 4; i++) {
        host.addCardToZone(
          'p1',
          'hand',
          makeCard({
            id: `hand-${i}`,
            number: `hand-${i}`,
            name: `Hand ${i}`,
            type: 'Event',
            cost: 0,
          }),
          `hand-${i}`,
        );
      }

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: mohji.instanceId,
        sourceCardId: 'ST25-005',
      });

      expect(p1.zones.hand.length).toBe(handBefore);
    });

    it('does not draw on KO when leader is not Buggy', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'NonBuggy');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const mohji = addCharacter(host, 'p1', {
        id: 'ST25-005',
        instanceSuffix: 'mohji',
        name: 'Mohji',
        cost: 3,
        power: 4000,
      });

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: mohji.instanceId,
        sourceCardId: 'ST25-005',
      });

      expect(p1.zones.hand.length).toBe(handBefore);
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st25EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST25-\d{3}$/);
        expect(card.effects).toBeDefined();
        expect(card.effects!.length).toBeGreaterThan(0);
        for (const entry of card.effects!) {
          if (entry.kind === 'standard') {
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.trigger.type).toBeTruthy();
            expect(entry.effect.actions.length).toBeGreaterThan(0);
          }
          if (entry.kind === 'continuous') {
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.modifier).toBeDefined();
          }
          if (entry.kind === 'replacement') {
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.event).toBe('wouldMoveCard');
            expect(entry.effect.replacement.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('ST25-001 has continuous cost boost and onPlay with leader condition', () => {
      const card = st25EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST25-001',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.cost).toBe(1);
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'targetCountAtLeast',
          selector: {
            player: 'self',
            zones: ['characters'],
            filter: {
              cardCategory: ['Character'],
              baseCostMin: 5,
            },
            count: { kind: 'any' },
          },
          value: 2,
        });
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderName',
          player: 'self',
          value: 'Buggy',
        });
      }
    });

    it('ST25-003 has onPlay and replacement effects', () => {
      const card = st25EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST25-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions.length).toBe(3);
        expect(stdEntry.effect.actions[0].type).toBe('draw');
        expect(stdEntry.effect.actions[1].type).toBe('trashFromHand');
        expect(stdEntry.effect.actions[2].type).toBe('play');
      }
      const replEntry = card!.effects?.find((e) => e.kind === 'replacement');
      expect(replEntry).toBeDefined();
      if (replEntry?.kind === 'replacement') {
        expect(replEntry.effect.event).toBe('wouldMoveCard');
        expect(replEntry.effect.oncePerTurn).toBe(true);
        expect(replEntry.effect.optional).toBe(true);
        expect(replEntry.effect.conditions).toContainEqual({
          type: 'eventReasonIs',
          value: 'effect',
        });
        expect(replEntry.effect.conditions).toContainEqual({
          type: 'eventEffectControllerIs',
          player: 'opponent',
        });
      }
    });

    it('ST25-004 has activateMain with trash costs', () => {
      const card = st25EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST25-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.costs).toHaveLength(2);
        expect(stdEntry.effect.costs![0].type).toBe('trashFromHand');
        expect(stdEntry.effect.costs![1].type).toBe('moveCard');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderName',
          player: 'self',
          value: 'Buggy',
        });
      }
    });

    it('ST25-005 has continuous blocker/cost and onKo draw', () => {
      const card = st25EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST25-005',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.keywords).toContain('blocker');
        expect(contEntry.effect.modifier.cost).toBe(1);
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onKo');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderName',
          player: 'self',
          value: 'Buggy',
        });
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasHandAtMost',
          player: 'self',
          value: 3,
        });
      }
    });
  });
});
