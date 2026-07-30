/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from '@jest/globals';
import type { EffectRegistry } from '../types/effect-registry';
import { st03EffectDefinitions } from './st03.effects';

const createRegistry = (): EffectRegistry => {
  const effectsByCardId: Record<string, any> = {};

  for (const card of st03EffectDefinitions.cards) {
    const resolved: any = { cardId: card.cardId };

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

describe('st03EffectDefinitions', () => {
  const registry = createRegistry();

  describe('ST03-001 crocodile-leader-activate-main-don-minus-4-bounce-cost-5-or-less', () => {
    it('defines an activate main effect with removeDon 4 cost and moveCard bounce', () => {
      const card = registry.effectsByCardId['ST03-001'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.trigger.oncePerTurn).toBe(true);
      expect(
        effect.costs?.some(
          (c: any) => c.type === 'removeDon' && c.amount === 4,
        ),
      ).toBe(true);
      expect(effect.actions.some((a: any) => a.type === 'moveCard')).toBe(true);
      const bounce = effect.actions.find((a: any) => a.type === 'moveCard');
      expect(bounce.destinationZone).toBe('hand');
      expect(bounce.selector.filter?.costMax).toBe(5);
      expect(bounce.selector.filter?.cardCategory).toContain('Character');
    });
  });

  describe('ST03-003 crocodile-on-block-don-1-bottom-deck-cost-2-or-less', () => {
    it('defines on block effect with DON!! x1 condition and moveCard to bottom of deck', () => {
      const card = registry.effectsByCardId['ST03-003'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onBlock');
      expect(
        effect.conditions?.some(
          (c: any) => c.type === 'sourceHasAttachedDonAtLeast' && c.value === 1,
        ),
      ).toBe(true);
      expect(effect.actions.some((a: any) => a.type === 'moveCard')).toBe(true);
      const move = effect.actions.find((a: any) => a.type === 'moveCard');
      expect(move.destinationZone).toBe('deck');
      expect(move.toBottom).toBe(true);
      expect(move.selector.filter?.costMax).toBe(2);
      expect(move.destinationPlayer).toBe('selectedCardOwner');
    });
  });

  describe('ST03-004 gecko-moria-on-play-recover-warlord-or-thriller-bark', () => {
    it('defines on play search from trash with trait filter and excludeName', () => {
      const card = registry.effectsByCardId['ST03-004'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.actions.some((a: any) => a.type === 'search')).toBe(true);
      const search = effect.actions.find((a: any) => a.type === 'search');
      expect(search.sourceZone).toBe('trash');
      expect(search.filter?.trait).toContain('The Seven Warlords of the Sea');
      expect(search.filter?.trait).toContain('Thriller Bark Pirates');
      expect(search.filter?.costMax).toBe(4);
      expect(search.filter?.excludeName).toContain('Gecko Moria');
      expect(search.destination).toBe('hand');
    });
  });

  describe('ST03-005 dracule-mihawk-when-attacking-draw-2-trash-2', () => {
    it('defines when attacking effect with draw 2 and trashFromHand 2', () => {
      const card = registry.effectsByCardId['ST03-005'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('whenAttacking');
      expect(
        effect.conditions?.some(
          (c: any) => c.type === 'sourceHasAttachedDonAtLeast' && c.value === 1,
        ),
      ).toBe(true);
      expect(effect.actions.some((a: any) => a.type === 'draw')).toBe(true);
      expect(effect.actions.some((a: any) => a.type === 'trashFromHand')).toBe(
        true,
      );
      const draw = effect.actions.find((a: any) => a.type === 'draw');
      expect(draw.amount).toBe(2);
      const trash = effect.actions.find((a: any) => a.type === 'trashFromHand');
      expect(trash.selector.count?.kind).toBe('exact');
      expect(trash.selector.count?.value).toBe(2);
    });
  });

  describe('ST03-007 sentomaru-activate-main-don-2-search-pacifista', () => {
    it('defines activate main with removeDon 2 cost, search for Pacifista, and shuffleDeck', () => {
      const card = registry.effectsByCardId['ST03-007'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.trigger.oncePerTurn).toBe(true);
      expect(
        effect.conditions?.some(
          (c: any) => c.type === 'sourceHasAttachedDonAtLeast' && c.value === 1,
        ),
      ).toBe(true);
      expect(
        effect.costs?.some(
          (c: any) => c.type === 'removeDon' && c.amount === 2,
        ),
      ).toBe(true);
      expect(effect.actions.some((a: any) => a.type === 'search')).toBe(true);
      const search = effect.actions.find((a: any) => a.type === 'search');
      expect(search.sourceZone).toBe('deck');
      expect(search.filter?.name).toContain('Pacifista');
      expect(search.filter?.costMax).toBe(4);
      expect(search.destination).toBe('characters');
      expect(effect.actions.some((a: any) => a.type === 'shuffleDeck')).toBe(
        true,
      );
    });
  });

  describe('ST03-008 trafalgar-law-blocker-only', () => {
    it('has no effect entries (Blocker is resolved by the engine)', () => {
      const card = registry.effectsByCardId['ST03-008'];
      expect(card).toBeDefined();
      expect(card.standard?.length ?? 0).toBe(0);
    });
  });

  describe('ST03-009 donquixote-doflamingo-on-play-bounce-cost-7-or-less', () => {
    it('defines on play bounce with costMax 7', () => {
      const card = registry.effectsByCardId['ST03-009'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.actions.some((a: any) => a.type === 'moveCard')).toBe(true);
      const bounce = effect.actions.find((a: any) => a.type === 'moveCard');
      expect(bounce.selector.filter?.costMax).toBe(7);
      expect(bounce.destinationZone).toBe('hand');
      expect(bounce.destinationPlayer).toBe('selectedCardOwner');
    });
  });

  describe('ST03-010 bartholomew-kuma-on-play-arrange-top-3', () => {
    it('defines on play arrangeDeckWindow 3 and trigger play', () => {
      const card = registry.effectsByCardId['ST03-010'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const arrangeEffect = card.standard![0];
      expect(arrangeEffect.trigger.type).toBe('onPlay');
      expect(
        arrangeEffect.actions.some((a: any) => a.type === 'arrangeDeckWindow'),
      ).toBe(true);
      const arrange = arrangeEffect.actions.find(
        (a: any) => a.type === 'arrangeDeckWindow',
      );
      expect(arrange.amount).toBe(3);

      const triggerEffect = card.standard![1];
      expect(triggerEffect.trigger.type).toBe('trigger');
      expect(triggerEffect.actions.some((a: any) => a.type === 'play')).toBe(
        true,
      );
      const play = triggerEffect.actions.find((a: any) => a.type === 'play');
      expect(play?.selector?.filter?.name).toContain('Bartholomew Kuma');
    });
  });

  describe('ST03-013 boa-hancock-trigger-play', () => {
    it('defines a trigger effect that plays this card', () => {
      const card = registry.effectsByCardId['ST03-013'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('trigger');
      expect(effect.actions.some((a: any) => a.type === 'play')).toBe(true);
      const play = effect.actions.find((a: any) => a.type === 'play');
      expect(play?.selector?.filter?.name).toContain('Boa Hancock');
    });
  });

  describe('ST03-014 marshall-d-teach-on-play-bounce-cost-3-or-less', () => {
    it('defines on play bounce with costMax 3', () => {
      const card = registry.effectsByCardId['ST03-014'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.actions.some((a: any) => a.type === 'moveCard')).toBe(true);
      const bounce = effect.actions.find((a: any) => a.type === 'moveCard');
      expect(bounce.selector.filter?.costMax).toBe(3);
      expect(bounce.destinationZone).toBe('hand');
    });
  });

  describe('ST03-015 sables-main-and-trigger-bounce-cost-7-or-less', () => {
    it('defines main and trigger effects that both bounce cost 7 or less', () => {
      const card = registry.effectsByCardId['ST03-015'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const mainEffect = card.standard![0];
      expect(mainEffect.trigger.type).toBe('activateMain');
      expect(mainEffect.actions.some((a: any) => a.type === 'moveCard')).toBe(
        true,
      );
      const mainBounce = mainEffect.actions.find(
        (a: any) => a.type === 'moveCard',
      );
      expect(mainBounce.selector.filter?.costMax).toBe(7);

      const triggerEffect = card.standard![1];
      expect(triggerEffect.trigger.type).toBe('trigger');
      expect(
        triggerEffect.actions.some((a: any) => a.type === 'moveCard'),
      ).toBe(true);
      const triggerBounce = triggerEffect.actions.find(
        (a: any) => a.type === 'moveCard',
      );
      expect(triggerBounce.selector.filter?.costMax).toBe(7);
    });
  });

  describe('ST03-016 thrust-pad-cannon-counter-and-trigger-bounce-cost-3-or-less', () => {
    it('defines counter and trigger effects that both bounce cost 3 or less', () => {
      const card = registry.effectsByCardId['ST03-016'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const counterEffect = card.standard![0];
      expect(counterEffect.trigger.type).toBe('activateCounter');
      expect(
        counterEffect.actions.some((a: any) => a.type === 'moveCard'),
      ).toBe(true);
      const counterBounce = counterEffect.actions.find(
        (a: any) => a.type === 'moveCard',
      );
      expect(counterBounce.selector.filter?.costMax).toBe(3);

      const triggerEffect = card.standard![1];
      expect(triggerEffect.trigger.type).toBe('trigger');
      expect(
        triggerEffect.actions.some((a: any) => a.type === 'moveCard'),
      ).toBe(true);
      const triggerBounce = triggerEffect.actions.find(
        (a: any) => a.type === 'moveCard',
      );
      expect(triggerBounce.selector.filter?.costMax).toBe(3);
    });
  });

  describe('ST03-017 love-love-mellow-counter-plus-4000-and-draw', () => {
    it('defines counter effect with +4000 power and conditional draw', () => {
      const card = registry.effectsByCardId['ST03-017'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const powerEffect = card.standard![0];
      expect(powerEffect.trigger.type).toBe('activateCounter');
      expect(
        powerEffect.actions.some((a: any) => a.type === 'modifyPower'),
      ).toBe(true);
      const modify = powerEffect.actions.find(
        (a: any) => a.type === 'modifyPower',
      );
      expect(modify.amount).toBe(4000);
      expect(modify.duration.type).toBe('untilEndOfBattle');
      expect(modify.selector.zones).toContain('leader');
      expect(modify.selector.zones).toContain('characters');

      const drawEffect = card.standard![1];
      expect(drawEffect.trigger.type).toBe('activateCounter');
      expect(
        drawEffect.conditions?.some(
          (c: any) => c.type === 'playerHasHandAtMost' && c.value === 3,
        ),
      ).toBe(true);
      expect(drawEffect.actions.some((a: any) => a.type === 'draw')).toBe(true);
      const draw = drawEffect.actions.find((a: any) => a.type === 'draw');
      expect(draw.amount).toBe(1);
    });
  });
});
