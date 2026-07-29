import { describe, expect, it } from '@jest/globals';
import type { Card, CardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../types/effect-registry';
import { op10EffectDefinitions } from './op10.effects';

describe('OP10 effect definitions', () => {
  it('exports the edition definitions', () => {
    expect(op10EffectDefinitions.editionId).toBe('OP10');
  });

  it('has card entries for all 119 OP10 cards', () => {
    const cardIds = op10EffectDefinitions.cards.map((c) => c.cardId);
    expect(cardIds.length).toBe(119);
    const op10Prefix = cardIds.filter((id) => id.startsWith('OP10-'));
    expect(op10Prefix.length).toBe(cardIds.length);
  });

  it('each card has valid effect entries', () => {
    const validKinds = new Set([
      'standard',
      'continuous',
      'replacement',
      'special-ref',
    ]);

    for (const card of op10EffectDefinitions.cards) {
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

    for (const card of op10EffectDefinitions.cards) {
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

  it('OP10-001 Smoker has continuous power buff and activate main effect', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-001',
    );
    expect(card).toBeDefined();
    expect(card!.effects).toBeDefined();
    expect(card!.effects!.length).toBe(2);

    const cont = card!.effects![0];
    expect(cont.kind).toBe('continuous');
    if (cont.kind === 'continuous') {
      expect(cont.effect.modifier.power).toBe(1000);
      expect(cont.effect.conditions).toEqual(
        expect.arrayContaining([{ type: 'controllerTurn', value: false }]),
      );
    }

    const std = card!.effects![1];
    expect(std.kind).toBe('standard');
    if (std.kind === 'standard') {
      expect(std.effect.trigger.type).toBe('activateMain');
      expect(std.effect.trigger.oncePerTurn).toBe(true);
    }
  });

  it('OP10-042 Usopp leader has continuous cost modifier and special-ref', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-042',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(2);

    const cont = card!.effects![0];
    expect(cont.kind).toBe('continuous');
    if (cont.kind === 'continuous') {
      expect(cont.effect.modifier.cost).toBe(1);
    }

    const special = card!.effects![1];
    expect(special.kind).toBe('special-ref');
  });

  it('OP10-074 Pica has replacement effect', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-074',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(1);

    const entry = card!.effects![0];
    expect(entry.kind).toBe('replacement');
    if (entry.kind === 'replacement') {
      expect(entry.effect.event).toBe('wouldKoCharacter');
      expect(entry.effect.oncePerTurn).toBe(true);
      expect(entry.effect.optional).toBe(true);
    }
  });

  it('OP10-094 Ryuma has DON!! x1 continuous Double Attack', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-094',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(1);

    const cont = card!.effects![0];
    expect(cont.kind).toBe('continuous');
    if (cont.kind === 'continuous') {
      expect(cont.effect.conditions).toEqual(
        expect.arrayContaining([
          { type: 'sourceHasAttachedDonAtLeast', value: 1 },
        ]),
      );
      expect(cont.effect.modifier.keywords).toContain('doubleAttack');
    }
  });

  it('OP10-022 has special handler ref', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-022',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(1);
    expect(card!.effects![0].kind).toBe('special-ref');
    if (card!.effects![0].kind === 'special-ref') {
      expect(card!.effects![0].specialHandlerId).toBe('op10-022-special');
    }
  });

  it('all special-ref handlers have valid IDs', () => {
    const pattern = /^op10-\d{3}-special$/;
    for (const card of op10EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'special-ref') {
          expect(entry.specialHandlerId).toMatch(pattern);
        }
      }
    }
  });

  it('empty-text cards have empty effects', () => {
    const emptyCards = [
      'OP10-012',
      'OP10-013',
      'OP10-014',
      'OP10-031',
      'OP10-050',
      'OP10-054',
      'OP10-064',
      'OP10-068',
      'OP10-073',
      'OP10-084',
      'OP10-089',
      'OP10-101',
      'OP10-105',
    ];
    for (const cardId of emptyCards) {
      const card = op10EffectDefinitions.cards.find((c) => c.cardId === cardId);
      expect(card).toBeDefined();
      expect(card!.effects).toEqual([]);
    }
  });
});
