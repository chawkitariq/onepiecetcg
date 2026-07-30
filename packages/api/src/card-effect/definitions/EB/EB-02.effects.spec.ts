import { describe, expect, it } from '@jest/globals';
import { createRegistry } from '../test-utils';
import { eb02EffectDefinitions } from './EB-02.effects';

describe('EB02 effect definitions', () => {
  it('loads all EB02 cards without error', () => {
    const registry = createRegistry([eb02EffectDefinitions]);
    expect(registry.effectsByCardId).toBeDefined();
  });

  it('has correct edition ID', () => {
    expect(eb02EffectDefinitions.editionId).toBe('EB02');
  });

  it('counts all defined cards', () => {
    expect(eb02EffectDefinitions.cards.length).toBe(55);
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];
    for (const card of eb02EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') allIds.push(entry.effect.id);
        if (entry.kind === 'continuous') allIds.push(entry.effect.id);
        if (entry.kind === 'replacement') allIds.push(entry.effect.id);
      }
    }
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('has unique card IDs', () => {
    const cardIds = eb02EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('registers special handler for EB02-039', () => {
    const specialRefCards = eb02EffectDefinitions.cards.filter((c) =>
      c.effects?.some((e) => e.kind === 'special-ref'),
    );
    expect(specialRefCards.length).toBe(1);
    const entry = specialRefCards[0].effects?.find(
      (e): e is { kind: 'special-ref'; specialHandlerId: string } =>
        e.kind === 'special-ref',
    );
    expect(entry?.specialHandlerId).toBe(
      'germa-66-main-trash-germa-play-same-name',
    );
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of eb02EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') standardCount++;
        else if (entry.kind === 'continuous') continuousCount++;
        else if (entry.kind === 'replacement') replacementCount++;
        else if (entry.kind === 'special-ref') specialRefCount++;
      }
    }

    expect(standardCount).toBeGreaterThan(0);
    expect(specialRefCount).toBe(1);
  });
});
