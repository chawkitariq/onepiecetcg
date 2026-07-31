import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st25EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-25',
  cards: [
    // ST25-001 Alvida
    // If you have 2 or more Characters with a base cost of 5 or more, this Character gains +1 cost.
    // [On Play] If your Leader is [Buggy], draw 3 cards and trash 2 cards from your hand.
    {
      cardId: 'ST25-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st25-001-cost-boost-5-base-cost',
            text: 'If you have 2 or more Characters with a base cost of 5 or more, this Character gains +1 cost.',
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMin: 5,
                  },
                  count: { kind: 'any' },
                },
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Alvida'] },
              },
              cost: 1,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st25-001-on-play-draw-3-trash-2-buggy-leader',
            text: '[On Play] If your Leader is [Buggy], draw 3 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Buggy',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 3 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST25-002 Cabaji
    // If you have 2 or more Characters with a base cost of 5 or more, this Character gains [Blocker] and +1 cost.
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Opponent's Turn] This Character gains +5000 power.
    {
      cardId: 'ST25-002',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st25-002-blocker-cost-boost-5-base-cost',
            text: 'If you have 2 or more Characters with a base cost of 5 or more, this Character gains [Blocker] and +1 cost.',
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMin: 5,
                  },
                  count: { kind: 'any' },
                },
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Cabaji'] },
              },
              keywords: ['mustBeAttackTarget'],
              cost: 1,
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'st25-002-opponent-turn-plus-5000',
            text: "[Opponent's Turn] This Character gains +5000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Cabaji'] },
              },
              power: 5000,
            },
          },
        },
      ],
    },
    // ST25-003 Crocodile & Mihawk
    // [On Play] Draw 2 cards and trash 1 card from your hand. Then, play up to 1 "Cross Guild" type Character card with a cost of 4 or less from your hand.
    // [Once Per Turn] If your "Cross Guild" type Character would be removed from the field by your opponent's effect, you may trash 1 card from your hand instead.
    {
      cardId: 'ST25-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st25-003-on-play-draw-2-trash-1-play-cross-guild-4',
            text: '[On Play] Draw 2 cards and trash 1 card from your hand. Then, play up to 1 "Cross Guild" type Character card with a cost of 4 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Cross Guild'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'replacement',
          effect: {
            id: 'st25-003-replacement-cross-guild-removal-discard',
            text: '[Once Per Turn] If your "Cross Guild" type Character would be removed from the field by your opponent\'s effect, you may trash 1 card from your hand instead.',
            event: 'wouldMoveCard',
            oncePerTurn: true,
            optional: true,
            conditions: [
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'eventEffectControllerIs',
                player: 'opponent',
              },
              {
                type: 'eventTargetMatchesFilter',
                filter: { trait: ['Cross Guild'] },
              },
            ],
            replacement: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST25-004 Buggy
    // [Activate:Main] You may trash 1 card from your hand and trash this Character: If your Leader is [Buggy], play up to 1 "Cross Guild" type Character card with a cost of 6 or less from your hand.
    {
      cardId: 'ST25-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st25-004-activate-main-trash-hand-self-play-cross-guild-6',
            text: '[Activate:Main] You may trash 1 card from your hand and trash this Character: If your Leader is [Buggy], play up to 1 "Cross Guild" type Character card with a cost of 6 or less from your hand.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Buggy'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Buggy',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Cross Guild'],
                    costMax: 6,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST25-005 Mohji
    // If you have 2 or more Characters with a base cost of 5 or more, this Character gains [Blocker] and +1 cost.
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On K.O.] If your Leader is [Buggy] and you have 3 or less cards in your hand, draw 1 card.
    {
      cardId: 'ST25-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st25-005-blocker-cost-boost-5-base-cost',
            text: 'If you have 2 or more Characters with a base cost of 5 or more, this Character gains [Blocker] and +1 cost.',
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMin: 5,
                  },
                  count: { kind: 'any' },
                },
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Mohji'] },
              },
              keywords: ['mustBeAttackTarget'],
              cost: 1,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st25-005-on-ko-draw-1-buggy-leader-hand-3-or-less',
            text: '[On K.O.] If your Leader is [Buggy] and you have 3 or less cards in your hand, draw 1 card.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Buggy',
              },
              {
                type: 'playerHasHandAtMost',
                player: 'self',
                value: 3,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
  ],
};
