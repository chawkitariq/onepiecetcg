import { op08EffectDefinitions } from './op08.effects';

describe('OP08 Effect Definitions', () => {
  it('should export the edition definitions with editionId OP08', () => {
    expect(op08EffectDefinitions.editionId).toBe('OP08');
  });

  it('should have cards array with entries', () => {
    expect(op08EffectDefinitions.cards.length).toBeGreaterThan(0);
  });

  it('every card should have a valid cardId', () => {
    for (const card of op08EffectDefinitions.cards) {
      expect(card.cardId).toMatch(/^OP08-\d{3}$/);
    }
  });

  it('every card should have effects defined', () => {
    for (const card of op08EffectDefinitions.cards) {
      expect(card.effects).toBeDefined();
      expect(card.effects?.length).toBeGreaterThan(0);
    }
  });

  it('every effect entry should have a valid kind', () => {
    const validKinds = ['standard', 'continuous', 'replacement', 'special-ref'];
    for (const card of op08EffectDefinitions.cards) {
      for (const effect of card.effects ?? []) {
        expect(validKinds).toContain(effect.kind);
      }
    }
  });

  describe('standard effects', () => {
    it('should have text, trigger, and actions', () => {
      for (const card of op08EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'standard') {
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.text).toBeTruthy();
            expect(entry.effect.trigger).toBeDefined();
            expect(entry.effect.actions).toBeDefined();
            expect(entry.effect.actions.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('special-ref entries', () => {
    it('should reference a valid handler id', () => {
      for (const card of op08EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'special-ref') {
            expect(entry.specialHandlerId).toBeTruthy();
            expect(entry.specialHandlerId).toMatch(/^op08-\d{3}-special$/);
          }
        }
      }
    });

    it('should keep converted cards on the standard DSL path', () => {
      const blackMaria = op08EffectDefinitions.cards.find(
        (card) => card.cardId === 'OP08-074',
      );
      const charlotteAngel = op08EffectDefinitions.cards.find(
        (card) => card.cardId === 'OP08-101',
      );

      expect(
        blackMaria?.effects?.some(
          (entry) =>
            entry.kind === 'standard' &&
            entry.effect.actions.some(
              (action) => action.type === 'scheduleActionsAtTurnEnd',
            ),
        ),
      ).toBe(true);
      expect(
        charlotteAngel?.effects?.some(
          (entry) =>
            entry.kind === 'standard' &&
            entry.effect.actions.some(
              (action) => action.type === 'scheduleActionsAtTurnEnd',
            ),
        ),
      ).toBe(true);
    });
  });

  describe('continuous effects', () => {
    it('should have a valid modifier', () => {
      for (const card of op08EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'continuous') {
            expect(entry.effect.modifier).toBeDefined();
            expect(entry.effect.modifier.selector).toBeDefined();
          }
        }
      }
    });
  });

  describe('Key card patterns', () => {
    it('Charlotte Pudding OP08-067: Your Turn Once Per Turn on DON!! returned', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-067',
      );
      expect(card).toBeDefined();
      const stdEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEffect).toBeDefined();
      if (stdEffect?.kind === 'standard') {
        expect(stdEffect.effect.trigger.type).toBe('onDonReturned');
        expect(stdEffect.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEffect.effect.actions).toContainEqual(
          expect.objectContaining({ type: 'addDon', amount: 1, rested: true }),
        );
      }
    });

    it('Mont Blanc Noland OP08-109: conditional addToLife', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-109',
      );
      expect(card).toBeDefined();
      const stdEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEffect).toBeDefined();
      if (stdEffect?.kind === 'standard') {
        expect(stdEffect.effect.conditions).toBeDefined();
        expect(stdEffect.effect.conditions!.length).toBe(2);
        expect(stdEffect.effect.actions[0]).toMatchObject({
          type: 'addToLife',
        });
      }
    });

    it('S-Hawk OP08-114: continuous +2000 and cannotBeKoedInBattle with trigger', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-114',
      );
      expect(card).toBeDefined();
      const contEffect = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEffect).toBeDefined();
      if (contEffect?.kind === 'continuous') {
        expect(contEffect.effect.modifier.keywords).toContain(
          'cannotBeKoedInBattle',
        );
        expect(contEffect.effect.modifier.power).toBe(2000);
        expect(contEffect.effect.conditions).toContainEqual(
          expect.objectContaining({
            type: 'playerHasLessLifeThan',
            player: 'self',
          }),
        );
      }
      const triggerEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(triggerEffect).toBeDefined();
    });

    it('Thatch OP08-045: replacement effect', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-045',
      );
      expect(card).toBeDefined();
      const replEffect = card!.effects?.find((e) => e.kind === 'replacement');
      expect(replEffect).toBeDefined();
      if (replEffect?.kind === 'replacement') {
        expect(replEffect.effect.event).toBe('wouldKoCharacter');
        expect(replEffect.effect.replacement).toHaveLength(2);
      }
    });

    it('Pedro OP08-030: On K.O. choose one branch', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-030',
      );
      expect(card).toBeDefined();
      const stdEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEffect).toBeDefined();
      if (stdEffect?.kind === 'standard') {
        expect(stdEffect.effect.trigger.type).toBe('onKo');
        expect(stdEffect.effect.actions[0]).toMatchObject({
          type: 'chooseActionBranch',
        });
      }
    });

    it('Biscuit Warrior OP08-072: Blocker continuous', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-072',
      );
      expect(card).toBeDefined();
      const contEffect = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEffect).toBeDefined();
      if (contEffect?.kind === 'continuous') {
        expect(contEffect.effect.modifier.keywords).toContain(
          'mustBeAttackTarget',
        );
      }
    });

    it('Zou OP08-039: Stage with end-of-turn effect', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-039',
      );
      expect(card).toBeDefined();
      const turnEndEffect = card!.effects?.find(
        (e) =>
          e.kind === 'standard' &&
          'trigger' in e.effect &&
          e.effect.trigger.type === 'onTurnEnd',
      );
      expect(turnEndEffect).toBeDefined();
    });

    it('Special ref cards should reference valid handler IDs', () => {
      const specialRefCards = op08EffectDefinitions.cards.filter((c) =>
        c.effects?.some((e) => e.kind === 'special-ref'),
      );
      expect(specialRefCards.length).toBe(9);
    });
  });
});
