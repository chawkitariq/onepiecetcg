/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../../effect-engine/src/effect-engine.js';
import { st24EffectDefinitions } from './ST-24.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST24 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st24EffectDefinitions]);
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

  describe('ST24-001 Capone "Gang" Bege', () => {
    it('draws 1 and trashes 1 from hand on play when 6+ rested cards', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.rested = true;

      putDonInCost(host, 'p1', 5, true);

      const bege = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-001',
          number: 'ST24-001',
          name: 'Capone"Gang"Bege',
          type: 'Character',
          cost: 2,
          power: 1000,
          counter: 1000,
          families: ['Firetank Pirates', 'Supernovas'],
        }),
        'bege',
      );

      const deckCard = host.addCardToZone(
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

      const handBefore = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: bege.instanceId,
        sourceCardId: 'ST24-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(p1.zones.hand.length).toBe(handBefore);
      expect(
        p1.zones.hand.find((c) => c.instanceId === deckCard.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === handCard.instanceId),
      ).toBeTruthy();
    });

    it('does not trigger on play when fewer than 6 rested cards', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const bege = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-001',
          number: 'ST24-001',
          name: 'Capone"Gang"Bege',
          type: 'Character',
          cost: 2,
          power: 1000,
          families: ['Firetank Pirates', 'Supernovas'],
        }),
        'bege',
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
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: bege.instanceId,
        sourceCardId: 'ST24-001',
      });

      expect(engine.getPendingDecision()).toBeNull();
      expect(p1.zones.hand.length).toBe(handBefore);
    });
  });

  describe('ST24-002 Kid & Killer', () => {
    it('searches top 5 of deck for Supernovas on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const kid = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-002',
          number: 'ST24-002',
          name: 'Kid & Killer',
          type: 'Character',
          cost: 2,
          power: 2000,
          counter: 1000,
          families: ['Kid Pirates', 'Supernovas'],
        }),
        'kid',
      );

      const supernova = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'supernova-card',
          number: 'supernova-card',
          name: 'Supernova Character',
          type: 'Character',
          cost: 3,
          power: 5000,
          families: ['Supernovas'],
        }),
        'supernova',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'other-1',
          number: 'other-1',
          name: 'Other 1',
          type: 'Event',
          cost: 1,
        }),
        'other-1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'other-2',
          number: 'other-2',
          name: 'Other 2',
          type: 'Event',
          cost: 2,
        }),
        'other-2',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'other-3',
          number: 'other-3',
          name: 'Other 3',
          type: 'Event',
          cost: 3,
        }),
        'other-3',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'other-4',
          number: 'other-4',
          name: 'Other 4',
          type: 'Event',
          cost: 4,
        }),
        'other-4',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: kid.instanceId,
        sourceCardId: 'ST24-002',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [supernova.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === supernova.instanceId),
      ).toBeTruthy();
    });

    it('shows optional confirm prompt on opponent attack', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const kid = addCharacter(host, 'p1', {
        id: 'ST24-002',
        number: 'ST24-002',
        name: 'Kid & Killer',
        instanceSuffix: 'kid',
        cost: 2,
        power: 2000,
        families: ['Kid Pirates', 'Supernovas'],
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onAttacked',
        playerSessionId: 'p1',
        sourceInstanceId: kid.instanceId,
        sourceCardId: 'ST24-002',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('confirm');
      expect(decision?.prompt.optional).toBe(true);
    });
  });

  describe('ST24-003 Basil Hawkins', () => {
    it('registered in the card effect definitions', () => {
      const card = st24EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST24-003',
      );
      expect(card).toBeDefined();
      expect(card!.effects).toBeDefined();
      expect(card!.effects!.length).toBe(1);
    });
  });

  describe('ST24-004 Law & Bepo', () => {
    it('rests opponent character and gives leader power if 2+ rested', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      const lawBepo = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-004',
          number: 'ST24-004',
          name: 'Law & Bepo',
          type: 'Character',
          cost: 10,
          power: 11000,
          counter: 0,
          families: ['Heart Pirates', 'Minks', 'Supernovas'],
        }),
        'law-bepo',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
        power: 6000,
      });

      const secondRested = addCharacter(host, 'p2', {
        name: 'Already Rested',
        instanceSuffix: 'already-rested',
        cost: 3,
        power: 3000,
      });
      secondRested.rested = true;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: lawBepo.instanceId,
        sourceCardId: 'ST24-004',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.rested).toBe(true);
      expect(p1.zones.leader.power).toBe(7000);
    });

    it('does not give leader power when fewer than 2 opponent characters are rested', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const lawBepo = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-004',
          number: 'ST24-004',
          name: 'Law & Bepo',
          type: 'Character',
          cost: 10,
          power: 11000,
          families: ['Heart Pirates', 'Minks', 'Supernovas'],
        }),
        'law-bepo',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
        power: 6000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: lawBepo.instanceId,
        sourceCardId: 'ST24-004',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.rested).toBe(true);
      expect(host.getPlayer('p1')!.zones.leader.power).toBe(5000);
    });
  });

  describe('ST24-005 X.Drake', () => {
    it('rests opponent character if leader has Supernovas type', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'supernovas-leader');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.families = ['Supernovas'];

      const xDrake = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-005',
          number: 'ST24-005',
          name: 'X.Drake',
          type: 'Character',
          cost: 5,
          power: 5000,
          counter: 2000,
          families: ['Drake Pirates', 'Navy', 'Supernovas'],
        }),
        'x-drake',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: xDrake.instanceId,
        sourceCardId: 'ST24-005',
      });

      expect(target.rested).toBe(true);
    });

    it('does not rest if leader does not have Supernovas', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'non-supernovas-leader');
      host.addPlayer('p2');

      const xDrake = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-005',
          number: 'ST24-005',
          name: 'X.Drake',
          type: 'Character',
          cost: 5,
          power: 5000,
          families: ['Drake Pirates', 'Navy', 'Supernovas'],
        }),
        'x-drake',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: xDrake.instanceId,
        sourceCardId: 'ST24-005',
      });

      expect(target.rested).toBe(false);
    });

    it('does not rest characters with cost over 5', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'supernovas-leader');
      host.addPlayer('p2');
      host.getPlayer('p1')!.zones.leader.families = ['Supernovas'];

      const xDrake = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST24-005',
          number: 'ST24-005',
          name: 'X.Drake',
          type: 'Character',
          cost: 5,
          power: 5000,
          families: ['Drake Pirates', 'Navy', 'Supernovas'],
        }),
        'x-drake',
      );

      const target = addCharacter(host, 'p2', {
        name: 'High Cost',
        instanceSuffix: 'high-cost',
        cost: 7,
        power: 7000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: xDrake.instanceId,
        sourceCardId: 'ST24-005',
      });

      expect(target.rested).toBe(false);
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st24EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST24-\d{3}$/);
        expect(card.effects).toBeDefined();
        expect(card.effects!.length).toBeGreaterThan(0);
        for (const entry of card.effects!) {
          if (entry.kind === 'standard') {
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.trigger.type).toBeTruthy();
            expect(entry.effect.actions.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('ST24-001 has onPlay trigger with rested condition', () => {
      const card = st24EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST24-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'targetCountAtLeast',
          selector: {
            player: 'self',
            zones: ['leader', 'characters', 'stage', 'cost'],
            filter: { rested: true },
          },
          value: 6,
        });
      }
    });

    it('ST24-002 has onPlay search and onAttacked self-trash effects', () => {
      const card = st24EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST24-002',
      );
      expect(card).toBeDefined();
      const onPlayEntry = card!.effects?.find(
        (e) => e.kind === 'standard' && e.effect.trigger.type === 'onPlay',
      );
      expect(onPlayEntry).toBeDefined();
      if (onPlayEntry?.kind === 'standard') {
        expect(onPlayEntry.effect.actions[0].type).toBe('search');
      }
      const onAttackEntry = card!.effects?.find(
        (e) => e.kind === 'standard' && e.effect.trigger.type === 'onAttacked',
      );
      expect(onAttackEntry).toBeDefined();
      if (onAttackEntry?.kind === 'standard') {
        expect(onAttackEntry.effect.trigger.optional).toBe(true);
        expect(onAttackEntry.effect.costs).toBeDefined();
      }
    });

    it('ST24-003 has onTurnEnd trigger with controllerTurn', () => {
      const card = st24EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST24-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onTurnEnd');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'controllerTurn',
          value: true,
        });
        expect(stdEntry.effect.actions[0].type).toBe('restand');
      }
    });

    it('ST24-004 has onPlay with rest, skipRefresh, and conditional power', () => {
      const card = st24EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST24-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions.length).toBe(3);
        expect(stdEntry.effect.actions[0].type).toBe('rest');
        expect(stdEntry.effect.actions[1].type).toBe('skipNextRefreshPhases');
        expect(stdEntry.effect.actions[2].type).toBe('ifConditionsMatch');
      }
    });

    it('ST24-005 has onPlay with leader trait condition and scheduled DON set', () => {
      const card = st24EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST24-005',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderTrait',
          player: 'self',
          value: 'Supernovas',
        });
        expect(stdEntry.effect.actions.length).toBe(2);
        expect(stdEntry.effect.actions[1].type).toBe(
          'scheduleActionsAtTurnEnd',
        );
      }
    });
  });
});
