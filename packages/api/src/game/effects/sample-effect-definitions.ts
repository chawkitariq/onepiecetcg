import type { CardEffectDefinition } from '@onepiecetcg/shared';

/** Sample real-card-style local effects used by the MVP engine and tests. */
export const sampleEffectDefinitions: CardEffectDefinition[] = [
  {
    cardId: 'OP01-006',
    standard: [
      {
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
    ],
  },
  {
    cardId: 'OP01-016',
    standard: [
      {
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
    ],
  },
  {
    cardId: 'OP01-025',
    continuous: [
      {
        id: 'zoro-your-turn',
        text: '[Your Turn] This Character gets +1000 power.',
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
    ],
  },
  {
    cardId: 'OP02-004',
    standard: [
      {
        id: 'vista-when-attacking',
        text: '[When Attacking] KO up to 1 rested Character with a cost of 3 or less.',
        trigger: { type: 'whenAttacking' },
        actions: [
          {
            type: 'ko',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              filter: {
                cardCategory: ['Character'],
                rested: true,
                costMax: 3,
              },
              count: { kind: 'upTo', value: 1 },
            },
            upTo: true,
            reason: 'effect',
          },
        ],
      },
    ],
  },
  {
    cardId: 'OP05-051',
    replacements: [
      {
        id: 'borsalino-cannot-be-ko-by-effects',
        text: 'This Character cannot be KOd by effects.',
        event: 'wouldKoCharacter',
        replacement: [],
        priority: 0,
      },
    ],
  },
  {
    cardId: 'OP01-047',
    specialHandlerId: 'trafalgar-law-on-play',
  },
];
