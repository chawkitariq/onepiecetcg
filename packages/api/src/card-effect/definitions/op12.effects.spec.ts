import { describe, expect, it } from '@jest/globals';
import type { Card, CardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../types/effect-registry';
import { op12EffectDefinitions } from './op12.effects';

describe('OP12 effect definitions', () => {
  it('exports the edition definitions', () => {
    expect(op12EffectDefinitions.editionId).toBe('OP12');
  });

  it('has card entries for all OP12 cards', () => {
    const cardIds = op12EffectDefinitions.cards.map((c) => c.cardId);
    expect(cardIds.length).toBeGreaterThanOrEqual(95);
    const op12Prefix = cardIds.filter((id) => id.startsWith('OP12-'));
    expect(op12Prefix.length).toBe(cardIds.length);
  });

  it('each card has valid effect entries', () => {
    const validKinds = new Set([
      'standard',
      'continuous',
      'replacement',
      'special-ref',
    ]);

    for (const card of op12EffectDefinitions.cards) {
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

    for (const card of op12EffectDefinitions.cards) {
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

  it('OP12-060 Boeuf Burst has chooseActionBranch', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-060',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('chooseActionBranch');
      if (action.type === 'chooseActionBranch') {
        expect(action.choices.length).toBe(2);
      }
    }
  });

  it('OP12-015 Monkey.D.Luffy has continuous power with DON!! x2', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-015',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.conditions).toBeDefined();
      expect(contEntry.effect.conditions!.length).toBeGreaterThan(0);
      expect(contEntry.effect.conditions![0]).toMatchObject({
        type: 'sourceHasAttachedDonAtLeast',
        value: 2,
      });
      expect(contEntry.effect.modifier.power).toBe(2000);
    }
  });

  it('OP12-070 Sanji has powerPerCount modifier', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-070',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.modifier.powerPerCount).toBeDefined();
      expect(contEntry.effect.modifier.powerPerCount!.divisor).toBe(5);
      expect(contEntry.effect.modifier.powerPerCount!.amount).toBe(1000);
    }
  });

  it('OP12-027 Koushirou has a replacement effect', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-027',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('replacement');
    if (entry.kind === 'replacement') {
      expect(entry.effect.event).toBe('wouldKoCharacter');
      expect(entry.effect.optional).toBe(true);
    }
  });

  it('OP12-061 Donquixote Rosinante has replacement for Law + cost reduction', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-061',
    );
    expect(card).toBeDefined();
    const replEntry = card!.effects!.find((e) => e.kind === 'replacement');
    expect(replEntry).toBeDefined();
    if (replEntry?.kind === 'replacement') {
      expect(replEntry.effect.event).toBe('wouldKoCharacter');
      expect(replEntry.effect.oncePerTurn).toBe(true);
    }
    const stdEntry = card!.effects!.find((e) => e.kind === 'standard');
    expect(stdEntry).toBeDefined();
    if (stdEntry?.kind === 'standard') {
      const action = stdEntry.effect.actions[0];
      expect(action.type).toBe('registerNextPlayCostModifier');
    }
  });

  it('OP12-098 Hair Removal Fist has additional conditional power', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-098',
    );
    expect(card).toBeDefined();
    const entries = card!.effects!.filter((e) => e.kind === 'standard');
    expect(entries.length).toBeGreaterThanOrEqual(2);
    const additionalBoost = entries.find(
      (e) =>
        e.kind === 'standard' &&
        e.effect.id === 'hair-removal-fist-counter-additional-plus-2000',
    );
    expect(additionalBoost).toBeDefined();
  });

  it('OP12-107 Donquixote Doflamingo has rush continuous and on-ko deck-to-life', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-107',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.conditions).toBeDefined();
      expect(contEntry.effect.modifier.keywords).toContain('rush');
    }
    const koEntry = card!.effects!.find(
      (e) => e.kind === 'standard' && e.effect?.trigger?.type === 'onKo',
    );
    expect(koEntry).toBeDefined();
  });

  it('OP12-058 uses revealTopAndPlayIfMatches', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-058',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('revealTopAndPlayIfMatches');
    }
  });

  it('OP12-118 Jewelry Bonney checks for 8 or more rested cards', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-118',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      expect(entry.effect.conditions).toBeDefined();
      const restCondition = entry.effect.conditions!.find(
        (c: any) => c.type === 'targetCountAtLeast',
      );
      expect(restCondition).toBeDefined();
      expect((restCondition as any).value).toBe(8);
    }
  });

  it('OP12-061 has special-ref cards that reference valid handler IDs', () => {
    const specialRefCards = op12EffectDefinitions.cards.filter((c) =>
      c.effects?.some((e) => e.kind === 'special-ref'),
    );
    const handlerIds = specialRefCards.map(
      (c) => c.effects!.find((e) => e.kind === 'special-ref')?.specialHandlerId,
    );
    expect(handlerIds.filter(Boolean).length).toBeGreaterThanOrEqual(1);
    for (const id of handlerIds) {
      expect(id).toMatch(/^op12-\d{3}-special$/);
    }
  });

  it('OP12-022 Inuarashi uses skipNextRefreshPhases', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-022',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('skipNextRefreshPhases');
    }
  });

  it('OP12-021 Ipponmatsu has cannotBeRemovedByOpponentEffects keyword', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-021',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('continuous');
    if (entry.kind === 'continuous') {
      expect(entry.effect.modifier.keywords).toContain(
        'cannotBeRemovedByOpponentEffects',
      );
    }
  });
});
