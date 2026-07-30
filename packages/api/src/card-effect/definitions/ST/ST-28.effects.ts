import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const st28EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-28',
  cards: [
    // ST28-004 Kouzuki Momonosuke
    // [Your Turn] If you have 2 or less Life cards, your Leader gains +1000 power.
    // [Activate: Main] [Once Per Turn] You may return 2 total of your currently given DON!! cards to your cost area rested: This Character gains [Rush] and +1000 power during this turn.
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'ST28-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st28-004-your-turn-leader-power',
            text: '[Your Turn] If you have 2 or less Life cards, your Leader gains +1000 power.',
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader'],
                count: { kind: 'exact', value: 1 },
              },
              power: 1000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st28-004-activate-main-rush-power',
            text: '[Activate: Main] [Once Per Turn] You may return 2 total of your currently given DON!! cards to your cost area rested: This Character gains [Rush] and +1000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST28-005 Yamato
    // [DON!! x2] [Your Turn] This Character gains +3000 power.
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Land of Wano" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'ST28-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st28-005-don-2-your-turn-power',
            text: '[DON!! x2] [Your Turn] This Character gains +3000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 3000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st28-005-on-play-search-wano',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Land of Wano" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Land of Wano'], costMin: 2 },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // ST28-003 Kin'emon
    // [Trigger] If your Leader has the "Land of Wano" type and your opponent has 3 or less Life cards, play this card.
    {
      cardId: 'ST28-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st28-003-trigger-play',
            text: '[Trigger] If your Leader has the "Land of Wano" type and your opponent has 3 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Land of Wano',
              },
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ["Kin'emon"] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST28-002 Izo
    // [DON!! x2] This Character gains [Blocker].
    // [On Play] Your "Land of Wano" type Leader gains [Banish] during this turn.
    {
      cardId: 'ST28-002',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st28-002-don-2-gains-blocker',
            text: '[DON!! x2] This Character gains [Blocker].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st28-002-on-play-banish-leader',
            text: '[On Play] Your "Land of Wano" type Leader gains [Banish] during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Land of Wano',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST28-001 Ashura Doji
    // [On Play] If your Leader has the "Land of Wano" type and your opponent has 3 or more Life cards, K.O. up to 1 of your opponent's Characters with a base cost of 5 or less.
    {
      cardId: 'ST28-001',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st28-001-special',
        },
      ],
    },
  ],
};
