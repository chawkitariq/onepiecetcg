/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '../../../web/node_modules/vitest/dist/index.js';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import { st22EffectDefinitions } from './ST-22.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST22 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st22EffectDefinitions]);
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

  describe('ST22-001 Ace & Newgate', () => {
    it('fires optional confirm then selectCards prompt on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const leader = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST22-001',
          number: 'ST22-001',
          name: 'Ace & Newgate',
          type: 'Leader',
          cost: 0,
          power: 5000,
          families: ['Whitebeard Pirates'],
        }),
        'leader-card',
      );

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'wb-card',
          number: 'wb-card',
          name: 'Whitebeard Pirate',
          type: 'Character',
          cost: 3,
          power: 3000,
          families: ['Whitebeard Pirates'],
        }),
        'wb-card',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: leader.instanceId,
        sourceCardId: 'ST22-001',
      });

      // Optional trigger produces a confirm prompt first
      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: decision!.id, confirmed: true });

      // Cost: storeSelectedCards prompts to select which card
      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
    });
  });

  describe('ST22-002 Izo', () => {
    it('searches deck for Whitebeard Pirates card other than Izo on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const izo = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST22-002',
          number: 'ST22-002',
          name: 'Izo',
          type: 'Character',
          cost: 3,
          power: 4000,
          families: ['Whitebeard Pirates'],
        }),
        'izo',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card-1',
          number: 'deck-card-1',
          name: 'Whitebeard Pirate',
          type: 'Character',
          cost: 3,
          power: 5000,
          families: ['Whitebeard Pirates'],
        }),
        'deck-card-1',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: izo.instanceId,
        sourceCardId: 'ST22-002',
      });

      // Search should produce a selectCards decision to pick from found cards
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
    });

    it('trashes self and draws on opponent attack after confirming optional prompt', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const izo = addCharacter(host, 'p1', {
        id: 'ST22-002',
        number: 'ST22-002',
        name: 'Izo',
        instanceSuffix: 'izo',
        cost: 3,
        power: 4000,
        families: ['Whitebeard Pirates'],
      });

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

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onAttacked',
        playerSessionId: 'p1',
        sourceInstanceId: izo.instanceId,
        sourceCardId: 'ST22-002',
      });

      // Optional trigger: first confirm
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: decision!.id, confirmed: true });

      // Cost moveCard auto-resolves (exact 1 match: Izo in characters)
      expect(
        p1.zones.characters.find((c) => c.instanceId === izo.instanceId),
      ).toBeFalsy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === izo.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST22-003 Edward.Newgate', () => {
    it('has continuous double attack entry', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-003',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
    });

    it('has onPlay standard effect', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
    });
  });

  describe('ST22-005 Kouzuki Oden', () => {
    it('trashes 2 cards from hand instead of being removed by effect', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const oden = addCharacter(host, 'p1', {
        id: 'ST22-005',
        number: 'ST22-005',
        name: 'Kouzuki Oden',
        instanceSuffix: 'oden',
        cost: 8,
        power: 8000,
        families: ['Kozuki'],
      });

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-1',
          number: 'hand-1',
          name: 'Hand Card 1',
          type: 'Event',
          cost: 0,
        }),
        'hand-1',
      );

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-2',
          number: 'hand-2',
          name: 'Hand Card 2',
          type: 'Event',
          cost: 0,
        }),
        'hand-2',
      );

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldMoveCard',
        playerSessionId: 'p1',
        sourceInstanceId: oden.instanceId,
        destinationPlayerSessionId: 'p2',
        destinationZone: 'hand',
        reason: 'effect',
      });

      expect(replaced).toBe(true);
      expect(p1.zones.hand.length).toBe(handBefore - 2);
      expect(
        p1.zones.characters.find((c) => c.instanceId === oden.instanceId),
      ).toBeTruthy();
    });

    it('does not replace removal without effect reason', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const oden = addCharacter(host, 'p1', {
        id: 'ST22-005',
        number: 'ST22-005',
        name: 'Kouzuki Oden',
        instanceSuffix: 'oden',
        cost: 8,
        power: 8000,
      });

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldMoveCard',
        playerSessionId: 'p1',
        sourceInstanceId: oden.instanceId,
        reason: 'battle',
      });

      expect(replaced).toBe(false);
    });
  });

  describe('ST22-006 Jozu', () => {
    it('has onPlay with reveal and ifStoredSelectionMatches in its effect', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-006',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions[0].type).toBe('reveal');
        expect(stdEntry.effect.actions[1].type).toBe(
          'ifStoredSelectionMatches',
        );
      }
    });
  });

  describe('ST22-007 Squard', () => {
    it('has activateMain with reveal and conditional attachDon', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-007',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
      }
    });
  });

  describe('ST22-012 Marco', () => {
    it("trashes 1 from hand instead of being KO'd by effect", () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const marco = addCharacter(host, 'p1', {
        id: 'ST22-012',
        number: 'ST22-012',
        name: 'Marco',
        instanceSuffix: 'marco',
        cost: 5,
        power: 6000,
        families: ['Whitebeard Pirates'],
      });

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

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: marco.instanceId,
        reason: 'effect',
      });

      expect(replaced).toBe(true);
      expect(p1.zones.hand.length).toBe(handBefore - 1);
      expect(
        p1.zones.characters.find((c) => c.instanceId === marco.instanceId),
      ).toBeTruthy();
    });

    it('does not replace KO from battle', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const marco = addCharacter(host, 'p1', {
        id: 'ST22-012',
        number: 'ST22-012',
        name: 'Marco',
        instanceSuffix: 'marco',
        cost: 5,
        power: 6000,
        families: ['Whitebeard Pirates'],
      });

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: marco.instanceId,
        reason: 'battle',
      });

      expect(replaced).toBe(false);
    });
  });

  describe('ST22-015 I Am Whitebeard!!', () => {
    it('has chooseActionBranch with two choices', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-015',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.actions.length).toBe(1);
        const branchAction = stdEntry.effect.actions[0];
        if (branchAction.type === 'chooseActionBranch') {
          expect(branchAction.choices.length).toBe(2);
          expect(branchAction.choices[0].id).toBe('only-play');
          expect(branchAction.choices[1].id).toBe('play-and-life');
        } else {
          throw new Error('Expected chooseActionBranch action');
        }
      }
    });
  });

  describe('ST22-016 Take That Back!!', () => {
    it('draws 1 card on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const card = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST22-016',
          number: 'ST22-016',
          name: 'Take That Back!!',
          type: 'Event',
          cost: 0,
        }),
        'card',
      );

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

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: card.instanceId,
        sourceCardId: 'ST22-016',
      });

      expect(p1.zones.hand.length).toBe(handBefore + 1);
    });
  });

  describe('ST22-017 Fire Fist', () => {
    it('prompts to return character with cost 3 or less to hand on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const card = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST22-017',
          number: 'ST22-017',
          name: 'Fire Fist',
          type: 'Event',
          cost: 0,
        }),
        'fire-fist',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target Character',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: card.instanceId,
        sourceCardId: 'ST22-017',
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
        p2.zones.hand.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid card IDs', () => {
      for (const card of st22EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST22-\d{3}$/);
      }
    });

    it('ST22-001 has activateMain trigger with oncePerTurn and optional', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.trigger.optional).toBe(true);
      }
    });

    it('ST22-002 has onPlay search effect and onAttacked optional effect', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-002',
      );
      expect(card).toBeDefined();
      const stdEntries =
        card!.effects?.filter((e) => e.kind === 'standard') ?? [];
      expect(stdEntries.length).toBe(2);
      expect(
        stdEntries.some(
          (e) => e.kind === 'standard' && e.effect.trigger.type === 'onPlay',
        ),
      ).toBe(true);
      expect(
        stdEntries.some(
          (e) =>
            e.kind === 'standard' && e.effect.trigger.type === 'onAttacked',
        ),
      ).toBe(true);
    });

    it('ST22-003 has continuous double attack and onPlay standard effect', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-003',
      );
      expect(card).toBeDefined();
      expect(card!.effects?.some((e) => e.kind === 'continuous')).toBe(true);
      expect(card!.effects?.some((e) => e.kind === 'standard')).toBe(true);
    });

    it('ST22-005 has replacement for wouldMoveCard and activateMain with two costs', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-005',
      );
      expect(card).toBeDefined();
      const replEntry = card!.effects?.find((e) => e.kind === 'replacement');
      expect(replEntry).toBeDefined();
      if (replEntry?.kind === 'replacement') {
        expect(replEntry.effect.event).toBe('wouldMoveCard');
        expect(replEntry.effect.optional).toBe(true);
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.costs?.length).toBe(2);
      }
    });

    it('ST22-006 has onPlay with reveal and ifStoredSelectionMatches', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-006',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.actions[0].type).toBe('reveal');
        expect(stdEntry.effect.actions[1].type).toBe(
          'ifStoredSelectionMatches',
        );
      }
    });

    it('ST22-009 has empty effects array (Blocker-only card)', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-009',
      );
      expect(card).toBeDefined();
      expect(card!.effects).toEqual([]);
    });

    it('ST22-011 has onPlay with controllerTurn condition', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-011',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'controllerTurn',
          value: true,
        });
      }
    });

    it('ST22-012 has replacement for wouldKoCharacter and whenAttacking standard effect', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-012',
      );
      expect(card).toBeDefined();
      const replEntry = card!.effects?.find((e) => e.kind === 'replacement');
      expect(replEntry).toBeDefined();
      if (replEntry?.kind === 'replacement') {
        expect(replEntry.effect.event).toBe('wouldKoCharacter');
        expect(replEntry.effect.oncePerTurn).toBe(true);
        expect(replEntry.effect.optional).toBe(true);
      }
      expect(card!.effects?.some((e) => e.kind === 'standard')).toBe(true);
    });

    it('ST22-016 has activateCounter and trigger effects', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-016',
      );
      expect(card).toBeDefined();
      const stdEntries =
        card!.effects?.filter((e) => e.kind === 'standard') ?? [];
      expect(stdEntries.length).toBe(2);
      expect(
        stdEntries.some(
          (e) =>
            e.kind === 'standard' &&
            e.effect.trigger.type === 'activateCounter',
        ),
      ).toBe(true);
      expect(
        stdEntries.some(
          (e) => e.kind === 'standard' && e.effect.trigger.type === 'trigger',
        ),
      ).toBe(true);
    });

    it('ST22-017 has activateMain with reveal cost and trigger bounce', () => {
      const card = st22EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST22-017',
      );
      expect(card).toBeDefined();
      const stdEntries =
        card!.effects?.filter((e) => e.kind === 'standard') ?? [];
      expect(stdEntries.length).toBe(2);
      const mainEntry = stdEntries.find(
        (e) =>
          e.kind === 'standard' && e.effect.trigger.type === 'activateMain',
      );
      expect(mainEntry).toBeDefined();
      if (mainEntry?.kind === 'standard') {
        expect(mainEntry.effect.trigger.optional).toBe(true);
        expect(mainEntry.effect.costs?.length).toBe(1);
      }
    });
  });
});
