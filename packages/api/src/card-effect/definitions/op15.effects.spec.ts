import { describe, expect, it } from '@jest/globals';
import { type Card, type CardEffectDefinition } from '@onepiecetcg/shared';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../types/effect-registry';
import { buildEffectIndexes } from '../effect-indexes';
import { op15EffectDefinitions } from './op15.effects';

const createRegistry = (
  specialHandlers: readonly SpecialHandlerDefinition[] = [],
): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  const specialHandlersByCardId: Record<string, SpecialHandlerDefinition> = {};

  for (const card of op15EffectDefinitions.cards) {
    const resolved: CardEffectDefinition = { cardId: card.cardId };

    for (const entry of card.effects ?? []) {
      switch (entry.kind) {
        case 'standard':
          resolved.standard = [...(resolved.standard ?? []), entry.effect];
          break;
        case 'continuous':
          resolved.continuous = [
            ...(resolved.continuous ?? []),
            entry.effect,
          ];
          break;
        case 'replacement':
          resolved.replacements = [
            ...(resolved.replacements ?? []),
            entry.effect,
          ];
          break;
        case 'special-ref':
          resolved.specialHandlerId = entry.specialHandlerId;
          break;
      }
    }

    effectsByCardId[resolved.cardId] = resolved;
  }

  for (const handler of specialHandlers) {
    specialHandlersByCardId[handler.cardId] = handler;
  }

  const indexes = buildEffectIndexes(effectsByCardId, specialHandlersByCardId);

  return {
    effectsByCardId,
    specialHandlersByCardId,
    triggeredEffectsByTrigger: indexes.triggeredEffectsByTrigger,
    replacementEffectsByEventType: indexes.replacementEffectsByEventType,
  };
};

describe('OP15 effect definitions', () => {
  it('loads all OP15 cards without error', () => {
    const registry = createRegistry();
    const cards = op15EffectDefinitions.cards;

    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const resolved = registry.effectsByCardId[card.cardId];
      expect(resolved).toBeDefined();
      expect(resolved.cardId).toBe(card.cardId);
    }
  });

  it('has correct edition ID', () => {
    expect(op15EffectDefinitions.editionId).toBe('OP15');
  });

  it('counts all defined cards', () => {
    const allCards = op15EffectDefinitions.cards;
    expect(allCards.length).toBe(op15EffectDefinitions.cards.length);
    expect(allCards.length).toBeGreaterThan(100);

    const withEffects = allCards.filter(
      (c) => c.effects && c.effects.length > 0,
    );
    const withSpecialRef = allCards.filter((c) =>
      c.effects?.some((e) => e.kind === 'special-ref'),
    );
    const empty = allCards.filter(
      (c) => !c.effects || c.effects.length === 0,
    );

    expect(withEffects.length).toBeGreaterThan(0);
    expect(withSpecialRef.length).toBe(15);
    expect(empty.length).toBeGreaterThan(0);

    const emptyIds = empty.map((c) => c.cardId);
    expect(emptyIds).toContain('OP15-016');
    expect(emptyIds).toContain('OP15-030');
    expect(emptyIds).toContain('OP15-049');
    expect(emptyIds).toContain('OP15-062');
    expect(emptyIds).toContain('OP15-089');
    expect(emptyIds).toContain('OP15-107');
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];

    for (const card of op15EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard' || entry.kind === 'continuous' || entry.kind === 'replacement') {
          allIds.push(entry.effect.id);
        }
      }
    }

    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('has unique card IDs', () => {
    const cardIds = op15EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('registers special handlers for all special-ref cards', () => {
    const specialRefIds: string[] = [];

    for (const card of op15EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'special-ref') {
          specialRefIds.push(entry.specialHandlerId);
        }
      }
    }

    expect(specialRefIds).toHaveLength(15);
    expect(specialRefIds).toContain('op15-001-special');
    expect(specialRefIds).toContain('op15-002-special');
    expect(specialRefIds).toContain('op15-008-special');
    expect(specialRefIds).toContain('op15-014-special');
    expect(specialRefIds).toContain('op15-020-special');
    expect(specialRefIds).toContain('op15-029-special');
    expect(specialRefIds).toContain('op15-031-special');
    expect(specialRefIds).toContain('op15-046-special');
    expect(specialRefIds).toContain('op15-058-special');
    expect(specialRefIds).toContain('op15-059-special');
    expect(specialRefIds).toContain('op15-070-special');
    expect(specialRefIds).toContain('op15-071-special');
    expect(specialRefIds).toContain('op15-086-special');
    expect(specialRefIds).toContain('op15-092-special');
    expect(specialRefIds).toContain('op15-119-special');
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of op15EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        switch (entry.kind) {
          case 'standard':
            standardCount++;
            break;
          case 'continuous':
            continuousCount++;
            break;
          case 'replacement':
            replacementCount++;
            break;
          case 'special-ref':
            specialRefCount++;
            break;
        }
      }
    }

    expect(standardCount).toBeGreaterThan(0);
    expect(continuousCount).toBeGreaterThan(0);
    expect(replacementCount).toBeGreaterThan(0);
    expect(specialRefCount).toBe(15);
  });

  it('validates Krieg leader continuous effect structure', () => {
    const resolved = createRegistry();
    const krieg = resolved.effectsByCardId['OP15-001'];
    expect(krieg).toBeDefined();
    expect(krieg.continuous).toHaveLength(1);
    expect(krieg.continuous![0].conditions).toHaveLength(3);
    expect(krieg.continuous![0].modifier.power).toBe(-2000);
    expect(krieg.standard).toBeUndefined();
    expect(krieg.specialHandlerId).toBe('op15-001-special');
  });

  it('validates Rebecca leader cannot-attack continuous effect', () => {
    const resolved = createRegistry();
    const rebecca = resolved.effectsByCardId['OP15-039'];
    expect(rebecca).toBeDefined();
    expect(rebecca.continuous).toHaveLength(1);
    expect(rebecca.continuous![0].modifier.keywords).toContain('cannotAttack');
    expect(rebecca.standard).toHaveLength(1);
  });

  it('validates Brook leader win-on-deck-out keyword', () => {
    const resolved = createRegistry();
    const brook = resolved.effectsByCardId['OP15-022'];
    expect(brook).toBeDefined();
    expect(brook.continuous).toHaveLength(1);
    expect(brook.continuous![0].modifier.keywords).toContain('winOnDeckOut');
  });

  it('validates replacement effects', () => {
    const resolved = createRegistry();
    const alvida = resolved.effectsByCardId['OP15-003'];
    expect(alvida.replacements).toHaveLength(1);
    expect(alvida.replacements![0].event).toBe('wouldKoCharacter');
    expect(alvida.replacements![0].optional).toBe(true);

    const koby = resolved.effectsByCardId['OP15-009'];
    expect(koby.replacements).toHaveLength(1);
    expect(koby.replacements![0].event).toBe('wouldMoveCard');
  });

  it('validates search-based effects use correct structure', () => {
    const resolved = createRegistry();

    const viola = resolved.effectsByCardId['OP15-040'];
    expect(viola.standard).toHaveLength(1);
    const searchAction = viola.standard![0].actions[0];
    expect(searchAction.type).toBe('search');
    if (searchAction.type === 'search') {
      expect(searchAction.sourceZone).toBe('deck');
      expect(searchAction.amount).toBe(3);
      expect(searchAction.filter.trait).toContain('Dressrosa');
    }
  });

  it('validates cards with chooseActionBranch', () => {
    const resolved = createRegistry();

    const memento = resolved.effectsByCardId['OP15-054'];
    expect(memento.standard).toHaveLength(1);
    const branchAction = memento.standard![0].actions[0];
    expect(branchAction.type).toBe('chooseActionBranch');

    const goAhead = resolved.effectsByCardId['OP15-055'];
    expect(goAhead.standard).toHaveLength(1);
    const branchAction2 = goAhead.standard![0].actions[0];
    expect(branchAction2.type).toBe('chooseActionBranch');
  });

  it('validates all standard effects have triggers', () => {
    const resolved = createRegistry();

    for (const [cardId, def] of Object.entries(resolved.effectsByCardId)) {
      for (const std of def.standard ?? []) {
        expect(std.trigger).toBeDefined();
        expect(std.trigger.type).toBeTruthy();
      }
    }
  });
});
