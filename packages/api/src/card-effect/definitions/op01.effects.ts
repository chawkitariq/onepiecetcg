import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op01EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP01',
  cards: [
    {
      cardId: 'OP01-006',
      effects: [
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
    },
    {
      cardId: 'OP01-016',
      effects: [
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
    },
    {
      cardId: 'OP01-025',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'zoro-plus-1000-during-your-turn',
            text: '[Your Turn] This Character gains +1000 power.',
            conditions: [{ type: 'controllerTurn', value: true }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Roronoa Zoro'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP01-047',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'trafalgar-law-on-play',
        },
      ],
    },
  ],
};
