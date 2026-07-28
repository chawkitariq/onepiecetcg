import type { GeneratedCardEffectDefinition } from '../../types/effect-definition-source';

export const op01006Effect: GeneratedCardEffectDefinition = {
  cardId: 'OP01-006',
  standards: [
    {
      kind: 'standard',
      effect: {
        id: 'otama-on-play',
        text: '[On Play] Give up to 1 of your opponent Characters -2000 power during this turn.',
        trigger: { type: 'onPlay' },
        actions: [
          {
            type: 'modifyPower',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              filter: { cardCategory: ['Character'] },
              count: { kind: 'upTo', value: 1 },
            },
            amount: -2000,
            duration: { type: 'untilEndOfTurn' },
          },
        ],
      },
    },
  ],
};
