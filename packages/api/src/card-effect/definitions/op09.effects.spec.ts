import { describe, expect, it } from '@jest/globals';
import type { Card, CardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../types/effect-registry';
import { op09EffectDefinitions } from './op09.effects';

describe('OP09 effect definitions', () => {
  it('exports the edition definitions', () => {
    expect(op09EffectDefinitions.editionId).toBe('OP09');
  });

  it('has card entries for all OP09 cards', () => {
    const cardIds = op09EffectDefinitions.cards.map((c) => c.cardId);
    expect(cardIds.length).toBeGreaterThanOrEqual(108);
    const op09Prefix = cardIds.filter((id) => id.startsWith('OP09-'));
    expect(op09Prefix.length).toBe(cardIds.length);
  });

  it('each card has valid effect entries', () => {
    const validKinds = new Set([
      'standard',
      'continuous',
      'replacement',
      'special-ref',
    ]);

    for (const card of op09EffectDefinitions.cards) {
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

    for (const card of op09EffectDefinitions.cards) {
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

  it('OP09-001 Shanks has an onAttacked effect', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-001',
    );
    expect(card).toBeDefined();
    expect(card!.effects).toBeDefined();
    expect(card!.effects!.length).toBeGreaterThan(0);

    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      expect(entry.effect.trigger.type).toBe('onAttacked');
      expect(entry.effect.trigger.oncePerTurn).toBe(true);
    }
  });

  it('OP09-004 Shanks has continuous power reduction', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-004',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('continuous');
    if (entry.kind === 'continuous') {
      expect(entry.effect.modifier.power).toBe(-1000);
    }
  });

  it('OP09-012 Monster has a replacement effect', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-012',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('replacement');
    if (entry.kind === 'replacement') {
      expect(entry.effect.event).toBe('wouldKoCharacter');
      expect(entry.effect.optional).toBe(true);
    }
  });

  it('OP09-118 Gol.D.Roger uses a special handler', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-118',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('special-ref');
    if (entry.kind === 'special-ref') {
      expect(entry.specialHandlerId).toBe('op09-118-special');
    }
  });

  it('OP09-014 Limejuice has cannotBlock keyword effect', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-014',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('grantKeywords');
      if (action.type === 'grantKeywords') {
        expect(action.keywords).toContain('cannotBlock');
      }
    }
  });

  it('OP09-084 Catarina Devon has chooseActionBranch', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-084',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('chooseActionBranch');
      if (action.type === 'chooseActionBranch') {
        expect(action.choices.length).toBe(3);
      }
    }
  });

  it('OP09-086 Jesus Burgess has powerPerCount modifier', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-086',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.modifier.powerPerCount).toBeDefined();
      expect(contEntry.effect.modifier.powerPerCount!.divisor).toBe(4);
    }
  });
});
