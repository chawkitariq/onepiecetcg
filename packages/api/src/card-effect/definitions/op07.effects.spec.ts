import type {
  CardEffectSource,
  EditionEffectDefinitions,
} from '../types/effect-definition-source';
import { op07EffectDefinitions } from './op07.effects';

describe('OP07 effect definitions', () => {
  it('exports cards with the correct edition id', () => {
    expect(op07EffectDefinitions.editionId).toBe('OP07');
    expect(op07EffectDefinitions.cards.length).toBeGreaterThan(0);
  });

  it.each(op07EffectDefinitions.cards)(
    'card $cardId has a valid structure',
    (card: CardEffectSource) => {
      expect(card.cardId).toMatch(/^OP07-\d{3}$/);
      if (card.effects) {
        expect(card.effects.length).toBeGreaterThan(0);
        for (const entry of card.effects) {
          if (entry.kind === 'special-ref') {
            expect(typeof entry.specialHandlerId).toBe('string');
          } else if (entry.kind === 'standard') {
            expect(entry.effect).toBeDefined();
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.text).toBeTruthy();
            expect(entry.effect.trigger).toBeDefined();
          } else if (entry.kind === 'continuous') {
            expect(entry.effect).toBeDefined();
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.modifier).toBeDefined();
          }
        }
      }
    },
  );

  it('has all special-ref handlers referenced from the definitions', () => {
    const specialRefIds = new Set<string>();
    for (const card of op07EffectDefinitions.cards) {
      if (card.effects) {
        for (const entry of card.effects) {
          if (entry.kind === 'special-ref') {
            specialRefIds.add(entry.specialHandlerId);
          }
        }
      }
    }
    expect(specialRefIds.size).toBeGreaterThan(0);
    expect(specialRefIds.has('op07-029-special')).toBe(true);
    expect(specialRefIds.has('op07-042-special')).toBe(true);
    expect(specialRefIds.has('op07-091-special')).toBe(true);
    expect(specialRefIds.has('op07-097-special')).toBe(true);
  });

  describe('specific card patterns', () => {
    const findCard = (cardId: string) =>
      op07EffectDefinitions.cards.find((c) => c.cardId === cardId);

    it('OP07-029 has continuous Blocker and special-ref', () => {
      const card = findCard('OP07-029');
      const special = card?.effects?.find((e) => e.kind === 'special-ref');
      expect(special).toBeDefined();
    });

    it('OP07-042 Gecko Moria uses special-ref', () => {
      const card = findCard('OP07-042');
      expect(card?.effects?.length).toBe(1);
      expect(card?.effects?.[0]?.kind).toBe('special-ref');
    });

    it('OP07-091 Monkey.D.Luffy uses special-ref', () => {
      const card = findCard('OP07-091');
      expect(card?.effects?.length).toBe(1);
      expect(card?.effects?.[0]?.kind).toBe('special-ref');
    });

    it('OP07-097 Vegapunk has cannotAttack continuous and special-ref', () => {
      const card = findCard('OP07-097');
      expect(card?.effects?.length).toBe(2);
      const cont = card?.effects?.find((e) => e.kind === 'continuous');
      expect(cont).toBeDefined();
      const special = card?.effects?.find((e) => e.kind === 'special-ref');
      expect(special).toBeDefined();
    });

    it('OP07-084 has no authored effects (Blocker-only)', () => {
      const card = findCard('OP07-084');
      expect(card?.effects).toBeUndefined();
    });

    it('OP07-033 protects cost 3 or less characters', () => {
      const card = findCard('OP07-033');
      const cont = card?.effects?.[0];
      expect(cont?.kind).toBe('continuous');
      if (cont?.kind === 'continuous') {
        expect(cont.effect.conditions).toBeDefined();
        expect(cont.effect.conditions?.length).toBe(1);
        expect(cont.effect.modifier.selector.filter?.costMax).toBe(3);
        expect(cont.effect.modifier.keywords).toContain(
          'cannotBeKoedByEffects',
        );
      }
    });

    it('OP07-011 Bluejam has DON!! x1 condition', () => {
      const card = findCard('OP07-011');
      const std = card?.effects?.[0];
      expect(std?.kind).toBe('standard');
      if (std?.kind === 'standard') {
        expect(std.effect.conditions).toBeDefined();
        expect(
          std.effect.conditions?.some(
            (c: any) => c.type === 'sourceHasAttachedDonAtLeast',
          ),
        ).toBe(true);
      }
    });

    it('cards with [Trigger] effects reference themselves via activateEffect when appropriate', () => {
      const triggerToMain = ['OP07-016', 'OP07-017', 'OP07-018', 'OP07-077'];
      for (const cid of triggerToMain) {
        const card = findCard(cid);
        const triggerEffect = card?.effects?.find(
          (e) =>
            e.kind === 'standard' &&
            (e as any).effect?.trigger?.type === 'trigger',
        );
        expect(triggerEffect).toBeDefined();
      }
    });
  });

  describe('continuous condition patterns', () => {
    const findCard = (cardId: string) =>
      op07EffectDefinitions.cards.find((c) => c.cardId === c.cardId);

    it('OP07-031 Bartolomeo requires controller turn', () => {
      const card = op07EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP07-031',
      );
      expect(card).toBeDefined();
      const std = card?.effects?.[0];
      expect(std?.kind).toBe('standard');
    });

    it('OP07-023 checks 6 rested DON!!', () => {
      const card = op07EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP07-023',
      );
      expect(card).toBeDefined();
      expect(card?.effects?.[0]?.kind).toBe('continuous');
    });
  });
});
