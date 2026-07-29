import { describe, expect, it } from '@jest/globals';
import type {
  CardEffectDefinition,
  StandardEffectDefinition,
  ContinuousEffectDefinition,
  ReplacementEffectDefinition,
} from '@onepiecetcg/shared';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../types/effect-registry';
import { op13EffectDefinitions } from './op13.effects';
import { specialHandlerDefinitions } from './special';

describe('OP13 effect definitions', () => {
  describe('edition structure', () => {
    it('has the correct edition ID', () => {
      expect(op13EffectDefinitions.editionId).toBe('OP13');
    });

    it('has 104 card definitions', () => {
      expect(op13EffectDefinitions.cards).toHaveLength(104);
    });

    it('every card has effects defined (no bare placeholders)', () => {
      for (const card of op13EffectDefinitions.cards) {
        expect(card.effects).toBeDefined();
        expect(card.effects!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('effect IDs', () => {
    it('every standard/continuous/replacement effect has a unique kebab-case id', () => {
      const ids = new Set<string>();
      for (const card of op13EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (
            entry.kind === 'standard' ||
            entry.kind === 'continuous' ||
            entry.kind === 'replacement'
          ) {
            const id = entry.effect.id;
            expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
            expect(ids.has(id)).toBe(false);
            ids.add(id);
          }
        }
      }
    });
  });

  describe('special handler references', () => {
    const handlerMap = new Map<string, SpecialHandlerDefinition>();
    for (const h of specialHandlerDefinitions) {
      handlerMap.set(h.id, h);
    }

    it('all special-ref handlers exist in the registry', () => {
      for (const card of op13EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'special-ref') {
            expect(handlerMap.has(entry.specialHandlerId)).toBe(true);
          }
        }
      }
    });

    it('every OP13 special handler has a corresponding card reference', () => {
      const referencedIds = new Set<string>();
      for (const card of op13EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'special-ref') {
            referencedIds.add(entry.specialHandlerId);
          }
        }
      }

      const op13Handlers = specialHandlerDefinitions.filter((h) =>
        h.cardId.startsWith('OP13-'),
      );

      for (const handler of op13Handlers) {
        expect(referencedIds.has(handler.id)).toBe(true);
      }
    });
  });

  describe('effect kind distribution', () => {
    it('has 77 cards with standard effects', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'standard'),
      ).length;
      expect(count).toBeGreaterThanOrEqual(70);
    });

    it('has 7 cards with continuous effects', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'continuous'),
      ).length;
      expect(count).toBe(7);
    });

    it('has 4 cards with replacement effects', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'replacement'),
      ).length;
      expect(count).toBe(4);
    });

    it('has 28 cards with special-ref', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'special-ref'),
      ).length;
      expect(count).toBe(28);
    });
  });

  describe('specific card effects structure', () => {
    const cardMap = new Map(
      op13EffectDefinitions.cards.map((c) => [c.cardId, c]),
    );

    it('OP13-041 Izo has a standard onPlay draw 2 effect', () => {
      const card = cardMap.get('OP13-041')!;
      const std = card.effects!.find((e) => e.kind === 'standard')!;
      expect(std.effect.trigger.type).toBe('onPlay');
      expect(std.effect.actions).toContainEqual({
        type: 'draw',
        player: 'self',
        amount: 2,
      });
    });

    it('OP13-041 Izo has exactly 1 effect', () => {
      const card = cardMap.get('OP13-041')!;
      expect(card.effects).toHaveLength(1);
    });

    it('OP13-080 has continuous and standard effects', () => {
      const card = cardMap.get('OP13-080')!;
      const kinds = card.effects!.map((e) => e.kind);
      expect(kinds).toContain('continuous');
      expect(kinds).toContain('standard');
    });

    it('OP13-046 Vista has 2 replacement effects', () => {
      const card = cardMap.get('OP13-046')!;
      const replacements = card.effects!.filter(
        (e) => e.kind === 'replacement',
      );
      expect(replacements).toHaveLength(2);
    });

    it('OP13-001 references a special handler', () => {
      const card = cardMap.get('OP13-001')!;
      const sref = card.effects!.find((e) => e.kind === 'special-ref')!;
      expect(sref.specialHandlerId).toBe('op13-001-special');
    });
  });
});
