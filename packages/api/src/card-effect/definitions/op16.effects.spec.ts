import { describe, expect, it } from '@jest/globals';
import type { CardEffectDefinition } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../types/effect-registry';
import { op16EffectDefinitions } from './op16.effects';

const createRegistry = (): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  for (const card of op16EffectDefinitions.cards) {
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
          resolved.replacements = [...(resolved.replacements ?? []), entry.effect];
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

describe('op16EffectDefinitions', () => {
  const registry = createRegistry();

  describe('OP16-006 shanks-on-play-rest-don-ko', () => {
    const card = registry.effectsByCardId['OP16-006'];
    it('defines onPlay with rest cost and ko action', () => {
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.trigger.optional).toBe(true);
      expect(effect.costs?.some((c) => c.type === 'rest')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'ko')).toBe(true);
    });
  });

  describe('OP16-014 marco-replacement-and-on-ko', () => {
    it('has a replacement and standard on-ko effect defined', () => {
      const card = registry.effectsByCardId['OP16-014'];
      expect(card).toBeDefined();
      expect(card.replacements?.length).toBe(1);
      expect(card.standard?.length).toBe(1);
    });
  });

  describe('OP16-033 morley-replacement-ko-with-rest', () => {
    it('has a wouldKoCharacter replacement effect defined', () => {
      const card = registry.effectsByCardId['OP16-033'];
      expect(card).toBeDefined();
      expect(card.replacements?.length).toBe(1);
      expect(card.replacements?.[0].event).toBe('wouldKoCharacter');
    });
  });

  describe('OP16-060 sengoku-leader-return-8-don-play-admirals', () => {
    it('defines an activate main effect with removeDon cost', () => {
      const card = registry.effectsByCardId['OP16-060'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.costs?.length).toBe(1);
      expect(effect.costs![0].type).toBe('removeDon');
      expect(effect.actions.some((a) => a.type === 'play')).toBe(true);
    });
  });

  describe('OP16-063 kuzan-add-2-don-and-blocker-lock', () => {
    it('defines onPlay addDon and activateMain grantKeywords cannotBlock', () => {
      const card = registry.effectsByCardId['OP16-063'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const onPlay = card.standard![0];
      expect(onPlay.trigger.type).toBe('onPlay');
      expect(onPlay.actions.some((a) => a.type === 'addDon')).toBe(true);

      const activate = card.standard![1];
      expect(activate.trigger.type).toBe('activateMain');
      expect(activate.costs?.some((c) => c.type === 'removeDon')).toBe(true);
    });
  });

  describe('OP16-080 teach-leader-continuous-cost-plus-1', () => {
    it('has a continuous effect for +1 cost on opponent turn', () => {
      const card = registry.effectsByCardId['OP16-080'];
      expect(card).toBeDefined();
      expect(card.continuous?.length).toBe(1);
      expect(card.continuous![0].modifier.cost).toBe(1);
    });
  });

  describe('OP16-089 mihawk-rush-draw-2-trash-2-modify-cost', () => {
    it('has onPlay with draw, trash and modifyCost actions', () => {
      const card = registry.effectsByCardId['OP16-089'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.actions.some((a) => a.type === 'draw')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'trashFromHand')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'modifyCost')).toBe(true);
    });
  });

  describe('OP16-102 avalo-pizarro-trigger-activate-on-ko', () => {
    it('defines a trigger that activates its on-ko effect', () => {
      const card = registry.effectsByCardId['OP16-102'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions.some((a) => a.type === 'activateEffect')).toBe(true);
    });
  });

  describe('OP16-105 gecko-moria-trigger-play-multiple', () => {
    it('has a trigger effect that plays up to 3 characters from trash', () => {
      const card = registry.effectsByCardId['OP16-105'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('trigger');
      const playActions = effect.actions.filter((a) => a.type === 'play');
      expect(playActions.length).toBe(3);
    });
  });

  describe('OP16-106 sanjuan-wolf-trigger-activate-on-ko', () => {
    it('has trigger that re-activates on-ko effect', () => {
      const card = registry.effectsByCardId['OP16-106'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const onKo = card.standard![0];
      expect(onKo.trigger.type).toBe('onKo');

      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions[0].type).toBe('activateEffect');
    });
  });

  describe('special-ref cards have entries', () => {
    const refs: Record<string, string> = {
      'OP16-032': 'op16-032-cannot-be-rested',
      'OP16-041': 'op16-041-impel-down-removed-play-prisoner',
      'OP16-079': 'op16-079-land-of-wano-from-trash-rush',
      'OP16-080': 'op16-080-attack-redirect',
      'OP16-084': 'op16-084-trash-self-cost-20-play-momo',
      'OP16-115': 'op16-115-negate-effect-trigger',
      'OP16-118': 'op16-118-counter-mod-and-search',
      'OP16-119': 'op16-119-negate-and-ko-trigger',
    };

    for (const [cardId, handlerId] of Object.entries(refs)) {
      it(`${cardId} references special handler ${handlerId}`, () => {
        const card = registry.effectsByCardId[cardId];
        expect(card).toBeDefined();
        expect(card.specialHandlerId).toBe(handlerId);
      });
    }
  });

  describe('cards with no effects have empty arrays', () => {
    const noEffectCards = [
      'OP16-004', 'OP16-016', 'OP16-023', 'OP16-028',
      'OP16-042', 'OP16-044', 'OP16-046', 'OP16-061',
      'OP16-062', 'OP16-086', 'OP16-088', 'OP16-112',
    ];

    for (const cardId of noEffectCards) {
      it(`${cardId} has no effects`, () => {
        const card = registry.effectsByCardId[cardId];
        expect(card).toBeDefined();
        expect(card.standard).toBeUndefined();
        expect(card.continuous).toBeUndefined();
        expect(card.replacements).toBeUndefined();
        expect(card.specialHandlerId).toBeUndefined();
      });
    }
  });

  describe('OP16-087 shinobu-trash-self-modify-cost', () => {
    it('has onPlay with moveCard cost and modifyCost action', () => {
      const card = registry.effectsByCardId['OP16-087'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.costs?.some((c) => c.type === 'moveCard')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'modifyCost')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'draw')).toBe(true);
    });
  });

  describe('OP16-098 yamato-trash-self-play-yamato', () => {
    it('has two standard effects: onPlay draw+trash and activateMain trash+play', () => {
      const card = registry.effectsByCardId['OP16-098'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);
      const drawEffect = card.standard![0];
      expect(drawEffect.trigger.type).toBe('onPlay');
      expect(drawEffect.actions.some((a) => a.type === 'draw')).toBe(true);
      const trashEffect = card.standard![1];
      expect(trashEffect.trigger.type).toBe('activateMain');
      expect(trashEffect.actions.some((a) => a.type === 'play')).toBe(true);
    });
  });

  describe('OP16-082 kinemon-plus-3-cost', () => {
    it('has a continuous +3 cost modifier', () => {
      const card = registry.effectsByCardId['OP16-082'];
      expect(card).toBeDefined();
      expect(card.continuous?.length).toBe(1);
      expect(card.continuous![0].modifier.cost).toBe(3);
    });
  });

  describe('OP16-038 restand-all-with-5-different-impel-down', () => {
    it('requires 5 distinct Impel Down characters and rests 6 DON', () => {
      const card = registry.effectsByCardId['OP16-038'];
      expect(card).toBeDefined();
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.costs?.some((c) => c.type === 'rest')).toBe(true);
      expect(effect.conditions?.some((c) => c.type === 'targetCountAtLeast')).toBe(true);
      const restandAction = effect.actions.find((a) => a.type === 'restand');
      expect(restandAction).toBeDefined();
    });
  });

  describe('OP16-019 main-play-whitebeard-and-trigger-leader-buff', () => {
    it('has activateMain and trigger effects', () => {
      const card = registry.effectsByCardId['OP16-019'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);
      const main = card.standard![0];
      expect(main.trigger.type).toBe('activateMain');
      expect(main.actions.some((a) => a.type === 'play')).toBe(true);
      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions.some((a) => a.type === 'modifyPower')).toBe(true);
    });
  });

  describe('OP16-111 boa-sandersonia-trigger-play', () => {
    it('has trigger with life condition', () => {
      const card = registry.effectsByCardId['OP16-111'];
      expect(card).toBeDefined();
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('trigger');
      expect(effect.conditions?.some((c) => c.type === 'playerHasLifeAtMost')).toBe(true);
    });
  });

  describe('OP16-113 boa-marigold-continuous-blocker-trigger', () => {
    it('has continuous blocker gain and trigger play', () => {
      const card = registry.effectsByCardId['OP16-113'];
      expect(card).toBeDefined();
      expect(card.continuous?.length).toBe(1);
      expect(card.standard?.length).toBe(1);
      expect(card.continuous![0].conditions?.some((c) => c.type === 'playerHasLifeAtMost')).toBe(true);
      expect(card.standard![0].trigger.type).toBe('trigger');
    });
  });
});
