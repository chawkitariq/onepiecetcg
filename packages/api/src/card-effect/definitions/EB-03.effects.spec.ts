import { describe, expect, it } from '@jest/globals';
import { createRegistry } from './test-utils';
import { eb03EffectDefinitions } from './EB-03.effects';

describe('EB03 effect definitions', () => {
  it('loads all EB03 cards without error', () => {
    const registry = createRegistry([eb03EffectDefinitions]);
    expect(registry.effectsByCardId).toBeDefined();
  });

  it('has correct edition ID', () => {
    expect(eb03EffectDefinitions.editionId).toBe('EB03');
  });

  it('counts all defined cards', () => {
    expect(eb03EffectDefinitions.cards.length).toBe(59);
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];
    for (const card of eb03EffectDefinitions.cards) {
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
    const cardIds = eb03EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of eb03EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') standardCount++;
        else if (entry.kind === 'continuous') continuousCount++;
        else if (entry.kind === 'replacement') replacementCount++;
        else if (entry.kind === 'special-ref') specialRefCount++;
      }
    }

    expect(standardCount).toBeGreaterThan(0);
    expect(specialRefCount).toBe(0);
  });

  it('EB03-001 Vivi Leader has replacement and standard effects', () => {
    const viviCard = eb03EffectDefinitions.cards.find(
      (c) => c.cardId === 'EB03-001',
    );
    expect(viviCard).toBeDefined();
    expect(viviCard!.effects?.some((e) => e.kind === 'replacement')).toBe(true);
    expect(viviCard!.effects?.some((e) => e.kind === 'standard')).toBe(true);
  });

  it('all standard effects have trigger', () => {
    for (const card of eb03EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') {
          expect(entry.effect.trigger.type).toBeDefined();
          expect(entry.effect.actions.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('all continuous effects have modifier', () => {
    for (const card of eb03EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'continuous') {
          expect(entry.effect.modifier).toBeDefined();
          expect(entry.effect.modifier.selector).toBeDefined();
        }
      }
    }
  });
});
