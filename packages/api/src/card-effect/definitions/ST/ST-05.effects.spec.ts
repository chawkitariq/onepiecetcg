/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import type { CardEffectDefinition } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../../types/effect-registry';
import { st05EffectDefinitions } from './ST-05.effects';

const createRegistry = (): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  for (const card of st05EffectDefinitions.cards) {
    const resolved: CardEffectDefinition = { cardId: card.cardId };
    for (const entry of card.effects ?? []) {
      switch (entry.kind) {
        case 'standard':
          resolved.standard = [...(resolved.standard ?? []), entry.effect];
          break;
        case 'continuous':
          resolved.continuous = [...(resolved.continuous ?? []), entry.effect];
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
  return { effectsByCardId } as EffectRegistry;
};

describe('st05EffectDefinitions', () => {
  const registry = createRegistry();

  describe('ST05-001 sakazuki-leader-activate-main-ko', () => {
    it('defines activate main with removeDon 1 cost and ko cost 3 or less', () => {
      const card = registry.effectsByCardId['ST05-001'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.trigger.oncePerTurn).toBe(true);
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 1),
      ).toBe(true);
      expect(effect.actions.some((a) => a.type === 'ko')).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(3);
    });
  });

  describe('ST05-002 sakazuki-rush-and-attack-ko-all-cost-0', () => {
    it('defines rush continuous effect', () => {
      const card = registry.effectsByCardId['ST05-002'];
      expect(card).toBeDefined();
      expect(
        card.continuous?.some((c) => c.modifier.keywords?.includes('rush')),
      ).toBe(true);
    });

    it('defines when attacking ko all cost 0', () => {
      const card = registry.effectsByCardId['ST05-002'];
      const effect = card.standard?.find(
        (s) => s.trigger.type === 'whenAttacking',
      );
      expect(effect).toBeDefined();
      expect(effect!.actions.some((a) => a.type === 'koAllCharacters')).toBe(
        true,
      );
      const koAction = effect!.actions.find(
        (a) => a.type === 'koAllCharacters',
      )!;
      expect(koAction.selector.filter?.costMax).toBe(0);
    });
  });

  describe('ST05-003 borsalino-on-block-ko', () => {
    it('defines on block with removeDon 1 cost and ko cost 4 or less', () => {
      const card = registry.effectsByCardId['ST05-003'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onBlock');
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 1),
      ).toBe(true);
      expect(effect.actions.some((a) => a.type === 'ko')).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(4);
    });
  });

  describe('ST05-004 kuzan-on-play-ko-and-attach-don', () => {
    it('defines on play with removeDon 2 cost, ko cost 5 or less, and attachDon', () => {
      const card = registry.effectsByCardId['ST05-004'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 2),
      ).toBe(true);
      expect(effect.actions.some((a) => a.type === 'ko')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'attachDon')).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(5);
      const attachAction = effect.actions.find((a) => a.type === 'attachDon')!;
      expect(attachAction.rested).toBe(true);
      expect(attachAction.amount).toBe(1);
    });
  });

  describe('ST05-005 rob-lucci-on-ko', () => {
    it('defines on ko with removeDon 1 cost and ko cost 4 or less', () => {
      const card = registry.effectsByCardId['ST05-005'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onKo');
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 1),
      ).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(4);
    });
  });

  describe('ST05-006 spandam-on-play-search-navy', () => {
    it('defines on play search from deck for Navy type', () => {
      const card = registry.effectsByCardId['ST05-006'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.actions.some((a) => a.type === 'search')).toBe(true);
      const searchAction = effect.actions.find((a) => a.type === 'search')!;
      expect(searchAction.sourceZone).toBe('deck');
      expect(searchAction.filter?.trait).toContain('Navy');
      expect(searchAction.amount).toBe(5);
      expect(searchAction.destination).toBe('hand');
    });
  });

  describe('ST05-010 smoker-when-attacking-ko', () => {
    it('defines when attacking with removeDon 1 cost and ko cost 3 or less', () => {
      const card = registry.effectsByCardId['ST05-010'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('whenAttacking');
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 1),
      ).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(3);
    });
  });

  describe('ST05-011 garp-on-play-ko', () => {
    it('defines on play with removeDon 1 cost and ko cost 5 or less', () => {
      const card = registry.effectsByCardId['ST05-011'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 1),
      ).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(5);
    });
  });

  describe('ST05-012 sengoku-on-play-ko', () => {
    it('defines on play with removeDon 2 cost and ko cost 7 or less', () => {
      const card = registry.effectsByCardId['ST05-012'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 2),
      ).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(7);
    });
  });

  describe('ST05-014 white-chase-counter-and-trigger', () => {
    it('defines activateCounter with +4000 power and conditional addDon if Navy leader', () => {
      const card = registry.effectsByCardId['ST05-014'];
      expect(card).toBeDefined();
      const counterEffect = card.standard?.find(
        (s) => s.trigger.type === 'activateCounter',
      );
      expect(counterEffect).toBeDefined();
      expect(counterEffect!.actions.some((a) => a.type === 'modifyPower')).toBe(
        true,
      );
      const modifyAction = counterEffect!.actions.find(
        (a) => a.type === 'modifyPower',
      )!;
      expect(modifyAction.amount).toBe(4000);
      expect(modifyAction.duration.type).toBe('untilEndOfBattle');
      expect(
        counterEffect!.actions.some((a) => a.type === 'ifConditionsMatch'),
      ).toBe(true);
    });

    it('defines trigger effect to play this card', () => {
      const card = registry.effectsByCardId['ST05-014'];
      const triggerEffect = card.standard?.find(
        (s) => s.trigger.type === 'trigger',
      );
      expect(triggerEffect).toBeDefined();
      expect(triggerEffect!.actions.some((a) => a.type === 'play')).toBe(true);
    });
  });

  describe('ST05-015 very-good-counter-and-trigger', () => {
    it('defines activateCounter with +4000 power for Navy type', () => {
      const card = registry.effectsByCardId['ST05-015'];
      expect(card).toBeDefined();
      const counterEffect = card.standard?.find(
        (s) => s.trigger.type === 'activateCounter',
      );
      expect(counterEffect).toBeDefined();
      expect(counterEffect!.actions.some((a) => a.type === 'modifyPower')).toBe(
        true,
      );
      const modifyAction = counterEffect!.actions.find(
        (a) => a.type === 'modifyPower',
      )!;
      expect(modifyAction.amount).toBe(4000);
      expect(modifyAction.selector.filter?.trait).toContain('Navy');
    });

    it('defines trigger effect to play this card', () => {
      const card = registry.effectsByCardId['ST05-015'];
      const triggerEffect = card.standard?.find(
        (s) => s.trigger.type === 'trigger',
      );
      expect(triggerEffect).toBeDefined();
      expect(triggerEffect!.actions.some((a) => a.type === 'play')).toBe(true);
    });
  });

  describe('ST05-016 navy-hq-stage-activate-main', () => {
    it('defines activateMain with rest cost, navy leader condition, and power boost', () => {
      const card = registry.effectsByCardId['ST05-016'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.costs?.some((c) => c.type === 'rest')).toBe(true);
      expect(
        effect.conditions?.some(
          (c) => c.type === 'playerHasLeaderTrait' && c.value === 'Navy',
        ),
      ).toBe(true);
      expect(effect.actions.some((a) => a.type === 'modifyPower')).toBe(true);
      const modifyAction = effect.actions.find(
        (a) => a.type === 'modifyPower',
      )!;
      expect(modifyAction.amount).toBe(1000);
      expect(modifyAction.duration.type).toBe('untilEndOfTurn');
    });
  });

  describe('cards without effects', () => {
    it('ST05-007 Koby has no effect entries (blocker is implicit)', () => {
      const card = registry.effectsByCardId['ST05-007'];
      expect(card).toBeDefined();
      expect(card.standard).toBeUndefined();
      expect(card.continuous).toBeUndefined();
    });

    it('ST05-008 Helmeppo has no effect entries', () => {
      const card = registry.effectsByCardId['ST05-008'];
      expect(card).toBeDefined();
      expect(card.standard).toBeUndefined();
    });

    it('ST05-009 Tashigi has no effect entries', () => {
      const card = registry.effectsByCardId['ST05-009'];
      expect(card).toBeDefined();
      expect(card.standard).toBeUndefined();
    });

    it('ST05-013 Hina has no effect entries', () => {
      const card = registry.effectsByCardId['ST05-013'];
      expect(card).toBeDefined();
      expect(card.standard).toBeUndefined();
    });

    it('ST05-017 Momonga has no effect entries', () => {
      const card = registry.effectsByCardId['ST05-017'];
      expect(card).toBeDefined();
      expect(card.standard).toBeUndefined();
    });
  });
});
