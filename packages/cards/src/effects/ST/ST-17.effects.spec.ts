/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { createDuelCard, DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../../effect-engine/src/effect-engine.js';
import { st17EffectDefinitions } from './ST-17.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST17 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st17EffectDefinitions]);
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

  describe('ST17-001 Crocodile', () => {
    it('processes onPlay without error', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const crocodile = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST17-001',
          number: 'ST17-001',
          name: 'Crocodile',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Baroque Works The Seven Warlords of the Sea'],
        }),
        'crocodile',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: crocodile.instanceId,
        sourceCardId: 'ST17-001',
      });
    });
  });

  describe('ST17-002 Trafalgar Law', () => {
    it('processes onPlay without error', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST17-002');
      host.addPlayer('p2');

      const law = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST17-002',
          number: 'ST17-002',
          name: 'Trafalgar Law',
          type: 'Character',
          cost: 4,
          power: 5000,
        }),
        'law',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: law.instanceId,
        sourceCardId: 'ST17-002',
      });
    });
  });

  describe('ST17-003 Buggy', () => {
    it('processes onPlay arrangeDeckWindow', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const buggy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST17-003',
          number: 'ST17-003',
          name: 'Buggy',
          type: 'Character',
          cost: 1,
          power: 2000,
        }),
        'buggy',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: buggy.instanceId,
        sourceCardId: 'ST17-003',
      });
    });
  });

  describe('ST17-004 Boa Hancock', () => {
    it('processes onPlay arrangeDeckWindow then attachDon', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const hancock = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST17-004',
          number: 'ST17-004',
          name: 'Boa Hancock',
          type: 'Character',
          cost: 4,
          power: 6000,
          families: ['Kuja Pirates The Seven Warlords of the Sea'],
        }),
        'hancock',
      );

      const p1 = host.getPlayer('p1')!;
      for (let index = 0; index < 5; index += 1) {
        p1.zones.donDeck.push(new DuelCard());
      }

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: hancock.instanceId,
        sourceCardId: 'ST17-004',
      });
    });
  });

  describe('ST17-005 Marshall.D.Teach', () => {
    it('processes activateMain with hand-to-deck cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      for (let index = 0; index < 5; index += 1) {
        p1.zones.donDeck.push(new DuelCard());
      }

      const teach = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST17-005',
          number: 'ST17-005',
          name: 'Marshall.D.Teach',
          type: 'Character',
          cost: 2,
          power: 3000,
        }),
        'teach',
      );

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-card',
          number: 'hand-card',
          name: 'Hand Card',
          type: 'Character',
        }),
        'hand-card',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: teach.instanceId,
        sourceCardId: 'ST17-005',
      });
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st17EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST17-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    it('ST17-001 has reveal and ifStoredSelectionMatches actions', () => {
      const card = st17EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST17-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions.length).toBeGreaterThanOrEqual(2);
        expect(stdEntry.effect.actions[0]).toMatchObject({
          type: 'reveal',
          player: 'self',
          zone: 'deck',
          amount: 1,
        });
        expect(stdEntry.effect.actions[1]).toMatchObject({
          type: 'ifStoredSelectionMatches',
        });
      }
    });

    it('ST17-002 has onPlay trigger with moveCard cost and leader trait condition', () => {
      const card = st17EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST17-002',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.costs).toHaveLength(1);
        expect(stdEntry.effect.costs![0]).toMatchObject({
          type: 'moveCard',
        });
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderTrait',
          player: 'self',
          value: 'The Seven Warlords of the Sea',
        });
      }
    });

    it('ST17-003 has arrangeDeckWindow action with amount 3', () => {
      const card = st17EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST17-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions).toContainEqual({
          type: 'arrangeDeckWindow',
          player: 'self',
          amount: 3,
        });
      }
    });

    it('ST17-004 has arrangeDeckWindow and attachDon actions', () => {
      const card = st17EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST17-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions[0]).toMatchObject({
          type: 'arrangeDeckWindow',
          player: 'self',
          amount: 3,
        });
        expect(stdEntry.effect.actions[1]).toMatchObject({
          type: 'attachDon',
          amount: 1,
          rested: true,
        });
      }
    });

    it('ST17-005 has activateMain trigger with moveCard cost and attachDon action', () => {
      const card = st17EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST17-005',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.costs).toHaveLength(1);
        expect(stdEntry.effect.costs![0]).toMatchObject({
          type: 'moveCard',
        });
        expect(stdEntry.effect.actions[0]).toMatchObject({
          type: 'attachDon',
          amount: 2,
          rested: true,
        });
      }
    });

    it('all effect IDs are unique and follow st17-NNN-descriptive-name pattern', () => {
      const ids = new Set<string>();
      for (const card of st17EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'standard' || entry.kind === 'continuous') {
            expect(entry.effect.id).toMatch(/^st17-/);
            expect(ids.has(entry.effect.id)).toBe(false);
            ids.add(entry.effect.id);
          }
        }
      }
    });
  });
});
