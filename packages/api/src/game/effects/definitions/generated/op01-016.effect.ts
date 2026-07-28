import type { GeneratedCardEffectDefinition } from '../../types/effect-definition-source';

export const op01016Effect: GeneratedCardEffectDefinition = {
  cardId: 'OP01-016',
  standards: [
    {
      kind: 'standard',
      effect: {
        id: 'nami-on-play',
        text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} card and add it to your hand.',
        trigger: { type: 'onPlay' },
        actions: [
          {
            type: 'search',
            player: 'self',
            sourceZone: 'deck',
            amount: 5,
            filter: { trait: ['Straw Hat Crew'], excludeName: ['Nami'] },
            count: { kind: 'upTo', value: 1 },
            destination: 'hand',
          },
        ],
      },
    },
  ],
};
