/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import type { CardEffectDefinition } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../types/effect-registry';
import { st04EffectDefinitions } from './st04.effects';

const createRegistry = (): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  for (const card of st04EffectDefinitions.cards) {
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

describe('st04EffectDefinitions', () => {
  const registry = createRegistry();

  describe('ST04-001 kaido-leader-activate-main-trash-life', () => {
    it('defines an activate main effect with removeDon 7 cost and moveCard to trash', () => {
      const card = registry.effectsByCardId['ST04-001'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.trigger.oncePerTurn).toBe(true);
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 7),
      ).toBe(true);
      expect(effect.actions.some((a) => a.type === 'moveCard')).toBe(true);
      const moveAction = effect.actions.find((a) => a.type === 'moveCard')!;
      expect(moveAction.destinationZone).toBe('trash');
    });
  });

  describe('ST04-002 ulti-on-play-play-page-one', () => {
    it('defines onPlay with removeDon 1 cost and play action for Page One', () => {
      const card = registry.effectsByCardId['ST04-002'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.costs?.some((c) => c.type === 'removeDon')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'play')).toBe(true);
      const playAction = effect.actions.find((a) => a.type === 'play')!;
      expect(playAction.selector.filter?.name).toContain('Page One');
      expect(playAction.selector.filter?.costMax).toBe(4);
    });
  });

  describe('ST04-003 kaido-wanted-on-play-ko-and-rush', () => {
    it('defines onPlay with removeDon 5 cost, ko and grantKeywords rush', () => {
      const card = registry.effectsByCardId['ST04-003'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(
        effect.costs?.some((c) => c.type === 'removeDon' && c.amount === 5),
      ).toBe(true);
      expect(effect.actions.some((a) => a.type === 'ko')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'grantKeywords')).toBe(true);
      const grantAction = effect.actions.find(
        (a) => a.type === 'grantKeywords',
      )!;
      expect(grantAction.keywords).toContain('rush');
      expect(grantAction.duration.type).toBe('untilEndOfTurn');
    });
  });

  describe('ST04-004 king-on-play-ko-cost-4-or-less', () => {
    it('defines onPlay with removeDon 1 cost and ko costMax 4', () => {
      const card = registry.effectsByCardId['ST04-004'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.costs?.some((c) => c.type === 'removeDon')).toBe(true);
      const koAction = effect.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(4);
    });
  });

  describe('ST04-005 queen-sp-on-play-draw-2-trash-1', () => {
    it('defines onPlay with removeDon 1 cost, draw 2 and trashFromHand 1', () => {
      const card = registry.effectsByCardId['ST04-005'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.costs?.some((c) => c.type === 'removeDon')).toBe(true);
      expect(
        effect.actions.some((a) => a.type === 'draw' && a.amount === 2),
      ).toBe(true);
      expect(effect.actions.some((a) => a.type === 'trashFromHand')).toBe(true);
    });
  });

  describe('ST04-006 sasaki-on-play-draw-1', () => {
    it('defines onPlay with removeDon 1 cost and draw 1', () => {
      const card = registry.effectsByCardId['ST04-006'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.costs?.some((c) => c.type === 'removeDon')).toBe(true);
      expect(
        effect.actions.some((a) => a.type === 'draw' && a.amount === 1),
      ).toBe(true);
    });
  });

  describe('ST04-008 jack-on-play-add-don', () => {
    it('defines optional onPlay with trashFromHand cost and addDon action', () => {
      const card = registry.effectsByCardId['ST04-008'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.trigger.optional).toBe(true);
      expect(effect.costs?.some((c) => c.type === 'trashFromHand')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'addDon')).toBe(true);
      const addDonAction = effect.actions.find((a) => a.type === 'addDon')!;
      expect(addDonAction.amount).toBe(1);
      expect(addDonAction.rested).toBe(false);
    });
  });

  describe('ST04-010 whoswho-on-play-and-trigger', () => {
    it('defines onPlay with removeDon 1 cost and trigger play this card', () => {
      const card = registry.effectsByCardId['ST04-010'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const onPlay = card.standard![0];
      expect(onPlay.trigger.type).toBe('onPlay');
      expect(onPlay.costs?.some((c) => c.type === 'removeDon')).toBe(true);
      const koAction = onPlay.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(3);

      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions.some((a) => a.type === 'play')).toBe(true);
    });
  });

  describe('ST04-011 black-maria-blocker-only', () => {
    it('has no DSL effects (blocker is innate)', () => {
      const card = registry.effectsByCardId['ST04-011'];
      expect(card).toBeDefined();
      expect(card.standard?.length ?? 0).toBe(0);
      expect(card.continuous?.length ?? 0).toBe(0);
      expect(card.replacements?.length ?? 0).toBe(0);
    });
  });

  describe('ST04-014 lead-performer-main-and-trigger', () => {
    it('defines main and trigger both drawing 1 and adding 1 active don', () => {
      const card = registry.effectsByCardId['ST04-014'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const main = card.standard![0];
      expect(main.trigger.type).toBe('activateMain');
      expect(
        main.actions.some((a) => a.type === 'draw' && a.amount === 1),
      ).toBe(true);
      expect(
        main.actions.some((a) => a.type === 'addDon' && a.rested === false),
      ).toBe(true);

      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(
        trigger.actions.some((a) => a.type === 'draw' && a.amount === 1),
      ).toBe(true);
      expect(
        trigger.actions.some((a) => a.type === 'addDon' && a.rested === false),
      ).toBe(true);
    });
  });

  describe('ST04-015 brachio-bomber-main-and-trigger', () => {
    it('defines main with ko and addDon, and trigger with addDon', () => {
      const card = registry.effectsByCardId['ST04-015'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const main = card.standard![0];
      expect(main.trigger.type).toBe('activateMain');
      expect(main.actions.some((a) => a.type === 'ko')).toBe(true);
      const koAction = main.actions.find((a) => a.type === 'ko')!;
      expect(koAction.selector.filter?.costMax).toBe(6);
      expect(
        main.actions.some((a) => a.type === 'addDon' && a.rested === false),
      ).toBe(true);

      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions.length).toBe(1);
      expect(trigger.actions[0].type).toBe('addDon');
    });
  });

  describe('ST04-016 blast-breath-counter-plus-4000', () => {
    it('defines a counter effect with removeDon 1 cost and +4000 power', () => {
      const card = registry.effectsByCardId['ST04-016'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateCounter');
      expect(effect.costs?.some((c) => c.type === 'removeDon')).toBe(true);
      const modifyAction = effect.actions.find(
        (a) => a.type === 'modifyPower',
      )!;
      expect(modifyAction.amount).toBe(4000);
      expect(modifyAction.duration.type).toBe('untilEndOfBattle');
    });
  });

  describe('ST04-017 onigashima-island-activate-main', () => {
    it('defines activate main with leader trait condition, rest cost, and addDon rested', () => {
      const card = registry.effectsByCardId['ST04-017'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.trigger.optional).toBe(true);
      expect(
        effect.conditions?.some(
          (c) =>
            c.type === 'playerHasLeaderTrait' &&
            c.value === 'Animal Kingdom Pirates',
        ),
      ).toBe(true);
      expect(effect.costs?.some((c) => c.type === 'rest')).toBe(true);
      const addDonAction = effect.actions.find((a) => a.type === 'addDon')!;
      expect(addDonAction.rested).toBe(true);
    });
  });

  describe('cards with no effects have empty arrays', () => {
    const noEffectCards = ['ST04-011'];

    for (const cardId of noEffectCards) {
      it(`${cardId} has empty effects array`, () => {
        const card = registry.effectsByCardId[cardId];
        expect(card).toBeDefined();
        expect(card.standard?.length ?? 0).toBe(0);
      });
    }
  });

  describe('all cards have cardIds matching ST04 pattern', () => {
    for (const card of st04EffectDefinitions.cards) {
      it(`${card.cardId} has ST04- prefix`, () => {
        expect(card.cardId).toMatch(/^ST04-\d{3}$/);
      });
    }
  });
});
