import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op06EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP06',
  cards: [
    // OP06-001 Uta (Leader, Purple/Red)
    // [When Attacking] You may trash 1 "FILM" type card from your hand: Give up to 1 of your opponent's Characters -2000 power during this turn. Then, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP06-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uta-leader-when-attacking-trash-film-minus-2000-add-don',
            text: '[When Attacking] You may trash 1 "FILM" type card from your hand: Give up to 1 of your opponent\'s Characters -2000 power during this turn. Then, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['FILM'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
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
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-002 Inazuma (Character, Red)
    // If this Character has 7000 power or more, this Character gains [Banish].
    {
      cardId: 'OP06-002',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'inazuma-power-7000-or-more-banish',
            text: 'If this Character has 7000 power or more, this Character gains [Banish].',
            conditions: [{ type: 'sourcePowerAtLeast', value: 7000 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Inazuma'] },
              },
              keywords: ['banish'],
            },
          },
        },
      ],
    },
    // OP06-003 Emporio.Ivankov (Character, Red)
    // [On Play] Look at 3 cards from the top of your deck and play up to 1 [Revolutionary Army] type Character card with 5000 power or less. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP06-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emporio-ivankov-on-play-search-revolutionary-army',
            text: '[On Play] Look at 3 cards from the top of your deck and play up to 1 [Revolutionary Army] type Character card with 5000 power or less. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Revolutionary Army'],
                  powerMax: 5000,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-004 Baron Omatsuri (Character, Red)
    // [On Play] Play up to 1 [Lily Carnation] from your hand.
    {
      cardId: 'OP06-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baron-omatsuri-on-play-lily-carnation',
            text: '[On Play] Play up to 1 [Lily Carnation] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Lily Carnation'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-006 Saga (Character, Red)
    // [DON!! x1][When Attacking] This Character gains +1000 power until the start of your next turn. Then, trash 1 of your [FILM] type Characters at the end of this turn.
    {
      cardId: 'OP06-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'saga-when-attacking-plus-1000-schedule-trash-film',
            text: '[DON!! x1][When Attacking] This Character gains +1000 power until the start of your next turn. Then, trash 1 of your [FILM] type Characters at the end of this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Saga'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'scheduleMoveAtEndOfBattle',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['FILM'], cardCategory: ['Character'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP06-007 Shanks (Character, Red)
    // [On play] K.O. up to 1 of your opponent's Characters with 10000 power or less.
    {
      cardId: 'OP06-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shanks-007-on-play-ko-10000-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with 10000 power or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 10000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-009 Shuraiya (Character, Red)
    // [Blocker] [When Attacking] / [On Block] [Once Per Turn] This Character's base power becomes the same as your opponent's Leader until the start of your next turn.
    {
      cardId: 'OP06-009',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op06-009-special',
        },
      ],
    },
    // OP06-010 Douglas Bullet (Character, Red)
    // If your Leader has the "FILM" type, this Character gains [Blocker].
    {
      cardId: 'OP06-010',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'douglas-bullet-film-leader-blocker',
            text: 'If your Leader has the "FILM" type, this Character gains [Blocker].',
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'FILM' },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Douglas Bullet'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP06-011 Tot Musica (Character, Red)
    // [Activate:Main] [Once Per Turn] You may rest 1 of your [Uta] cards: This Character gains +5000 power during this turn.
    {
      cardId: 'OP06-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tot-musica-activate-main-rest-uta-plus-5000',
            text: '[Activate:Main] [Once Per Turn] You may rest 1 of your [Uta] cards: This Character gains +5000 power during this turn.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Uta'], rested: false },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Tot Musica'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP06-012 Bear.King (Character, Red)
    // If your opponent has a Leader or Character with a base power of 6000 or more, this Character cannot be K.O.'d in battle.
    {
      cardId: 'OP06-012',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'bear-king-cannot-be-koed-in-battle-if-opponent-has-6000-base',
            text: "If your opponent has a Leader or Character with a base power of 6000 or more, this Character cannot be K.O.'d in battle.",
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { basePowerMin: 6000 },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Bear.King'] },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // OP06-013 Monkey.D.Luffy (Character, Red)
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 "FILM" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [On Play] effect.
    {
      cardId: 'OP06-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-013-on-play-search-film',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 "FILM" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['FILM'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-013-trigger-on-play',
            text: "[Trigger] Activate this card's [On Play] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP06-013',
                effectId: 'monkey-d-luffy-013-on-play-search-film',
              },
            ],
          },
        },
      ],
    },
    // OP06-014 Ratchet (Character, Red)
    // [On Your Opponent's Attack] You may trash any number of [FILM] type cards from your hand. Your Leader or 1 of your Characters gains +1000 power during this battle for every card trashed.
    {
      cardId: 'OP06-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ratchet-on-attacked-trash-any-film-plus-1000-per-card',
            text: "[On Your Opponent's Attack] You may trash any number of [FILM] type cards from your hand. Your Leader or 1 of your Characters gains +1000 power during this battle for every card trashed.",
            trigger: { type: 'onAttacked', optional: true },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'ratchet-film-trash',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['FILM'] },
                  count: { kind: 'any' },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'ratchet-film-trash',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              {
                type: 'modifyPowerByStoredCount',
                key: 'ratchet-film-trash',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amountPerCard: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP06-015 Lily Carnation (Character, Red)
    // [Activate:Main][Once Per Turn] You may trash 1 of your Characters with 6000 power or more: Play up to 1 [FILM] type Character card with 2000 to 5000 power from your trash rested.
    {
      cardId: 'OP06-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lily-carnation-activate-main-trash-6000-plus-play-film-rested',
            text: '[Activate:Main][Once Per Turn] You may trash 1 of your Characters with 6000 power or more: Play up to 1 [FILM] type Character card with 2000 to 5000 power from your trash rested.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 6000 },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['FILM'],
                    powerMin: 2000,
                    powerMax: 5000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-016 Raise Max (Character, Red)
    // [Activate:Main] You may place this Character at the bottom of the owner's deck: Give up to 1 of your opponent's Characters -3000 power during this turn.
    {
      cardId: 'OP06-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'raise-max-activate-main-self-bottom-deck-minus-3000',
            text: "[Activate:Main] You may place this Character at the bottom of the owner's deck: Give up to 1 of your opponent's Characters -3000 power during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Raise Max'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP06-017 Meteor-Strike of Love (Event, Red)
    // [Main] / [Counter] You may add 1 card from the top of your Life cards to your hand: Up to 1 of your Leader or Character cards gains +3000 power during this turn.
    {
      cardId: 'OP06-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'meteor-strike-love-main-life-to-hand-plus-3000',
            text: '[Main] You may add 1 card from the top of your Life cards to your hand: Up to 1 of your Leader or Character cards gains +3000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'meteor-strike-love-counter-life-to-hand-plus-3000',
            text: '[Counter] You may add 1 card from the top of your Life cards to your hand: Up to 1 of your Leader or Character cards gains +3000 power during this turn.',
            trigger: { type: 'activateCounter', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP06-018 Gum-Gum King Kong Gatling (Event, Red)
    // [Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if your opponent has a Character with 7000 power or more, up to 1 of your Leader or Character cards gains +1000 power during this turn.
    // [Trigger] K.O. up to 1 of your opponent's Characters with 5000 power or less.
    {
      cardId: 'OP06-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'king-kong-gatling-main-plus-3000',
            text: '[Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'king-kong-gatling-main-additional-1000-if-opponent-7000',
            text: 'Then, if your opponent has a Character with 7000 power or more, up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 7000 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'king-kong-gatling-trigger-ko-5000-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 5000 power or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 5000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-019 Blue Dragon Seal Water Stream (Event, Red)
    // [Main] K.O. up to 1 of your opponent's Characters with 5000 power or less.
    // [Trigger] K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'OP06-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blue-dragon-seal-water-stream-main-ko-5000',
            text: "[Main] K.O. up to 1 of your opponent's Characters with 5000 power or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 5000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'blue-dragon-seal-water-stream-trigger-ko-4000',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 4000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-020 Hody Jones (Leader, Green)
    // [Activate:Main] You may rest this Leader: Rest up to 1 of your opponent's DON!! cards or Characters with a cost of 3 or less. Then, you cannot add Life cards to your hand using your own effects during this turn.
    {
      cardId: 'OP06-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hody-jones-020-activate-main-rest-opponent-don-or-char',
            text: "[Activate:Main] You may rest this Leader: Rest up to 1 of your opponent's DON!! cards or Characters with a cost of 3 or less. Then, you cannot add Life cards to your hand using your own effects during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Hody Jones'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'rest-don',
                    label: "Rest up to 1 of your opponent's DON!! cards",
                    actions: [
                      {
                        type: 'rest',
                        selector: {
                          player: 'opponent',
                          zones: ['cost'],
                          count: { kind: 'upTo', value: 1 },
                        },
                      },
                    ],
                  },
                  {
                    id: 'rest-character',
                    label:
                      "Rest up to 1 of your opponent's Characters with a cost of 3 or less",
                    actions: [
                      {
                        type: 'rest',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 3 },
                          count: { kind: 'upTo', value: 1 },
                        },
                      },
                    ],
                  },
                ],
              },
              {
                type: 'preventOwnEffectLifeToHand',
                player: 'self',
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP06-021 Perona (Leader, Green/Black)
    // [Activate:Main] [Once Per Turn] Choose one:
    // • Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    // • Give up to 1 of your opponent's Characters -1 cost during this turn.
    {
      cardId: 'OP06-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'perona-021-activate-main-choose-rest-or-cost-minus',
            text: "[Activate:Main] [Once Per Turn] Choose one: \u2022 Rest up to 1 of your opponent's Characters with a cost of 4 or less. \u2022 Give up to 1 of your opponent's Characters -1 cost during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'rest-cost-4-or-less',
                    label:
                      "Rest up to 1 of your opponent's Characters with a cost of 4 or less",
                    actions: [
                      {
                        type: 'rest',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 4 },
                          count: { kind: 'upTo', value: 1 },
                        },
                      },
                    ],
                  },
                  {
                    id: 'cost-minus-1',
                    label:
                      "Give up to 1 of your opponent's Characters -1 cost during this turn",
                    actions: [
                      {
                        type: 'modifyCost',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'] },
                          count: { kind: 'upTo', value: 1 },
                        },
                        amount: -1,
                        duration: { type: 'untilEndOfTurn' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP06-022 Yamato (Leader, Green/Yellow)
    // [Double Attack] [Activate:Main] [Once Per Turn] If your opponent has 3 or less Life cards, give up to 2 rested DON!! cards to 1 of your Characters.
    {
      cardId: 'OP06-022',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'yamato-022-double-attack',
            text: '[Double Attack]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader'],
                filter: { name: ['Yamato'] },
              },
              keywords: ['doubleAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'yamato-022-activate-main-attach-2-rested-don',
            text: '[Activate:Main] [Once Per Turn] If your opponent has 3 or less Life cards, give up to 2 rested DON!! cards to 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-023 Arlong (Character, Green)
    // [On Play] You may trash 1 card from your hand: Up to 1 of your opponent's rested Leader cannot attack until the end of your opponent's next turn.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP06-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'arlong-023-on-play-trash-1-rested-leader-cannot-attack',
            text: "[On Play] You may trash 1 card from your hand: Up to 1 of your opponent's rested Leader cannot attack until the end of your opponent's next turn.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['leader'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'arlong-023-trigger-rest-cost-4-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP06-024 Ikaros Much (Character, Green)
    // [On Play] If your Leader has the [New Fish-Man Pirates] type, play up to 1 [Fish-Man] type Character card with a cost of 4 or less from your hand. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP06-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ikaros-much-on-play-fish-man-play-and-life-to-hand',
            text: '[On Play] If your Leader has the [New Fish-Man Pirates] type, play up to 1 [Fish-Man] type Character card with a cost of 4 or less from your hand. Then, add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'New Fish-Man Pirates',
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
                    trait: ['Fish-Man'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-025 Camie (Character, Green)
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 "Fish-Man" or "Merfolk" type card other than [Camie] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP06-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'camie-on-play-search-fish-man-or-merfolk',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 "Fish-Man" or "Merfolk" type card other than [Camie] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Fish-Man', 'Merfolk'],
                  excludeName: ['Camie'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-026 Koushirou (Character, Green)
    // [On Play] Set up to 1 of your "Slash" attribute Characters with a cost of 4 or less as active. Then, you cannot attack a Leader during this turn.
    {
      cardId: 'OP06-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koushirou-on-play-unrest-slash-and-cannot-attack-leader',
            text: '[On Play] Set up to 1 of your "Slash" attribute Characters with a cost of 4 or less as active. Then, you cannot attack a Leader during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    attribute: ['Slash'],
                    costMax: 4,
                    rested: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP06-027 Gyro (Character, Green)
    // [On K.O.] Rest up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP06-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gyro-on-ko-rest-cost-3-or-less',
            text: "[On K.O.] Rest up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP06-028 Zeo (Character, Green)
    // [DON!! x1][When Attacking] If your Leader has the [New Fish-Man Pirates] type, set up to 1 of your DON!! cards as active and this Character gains +1000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP06-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zeo-when-attacking-don-1-unrest-don-plus-1000-life-to-hand',
            text: '[DON!! x1][When Attacking] If your Leader has the [New Fish-Man Pirates] type, set up to 1 of your DON!! cards as active and this Character gains +1000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'New Fish-Man Pirates',
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Zeo'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-029 Daruma (Character, Green)
    // [DON!! x1][When Attacking][Once Per Turn] If your Leader has the [New Fish-Man Pirates] type, set this Character as active and this Character gains +1000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP06-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'daruma-when-attacking-unrest-self-plus-1000-life-to-hand',
            text: '[DON!! x1][When Attacking][Once Per Turn] If your Leader has the [New Fish-Man Pirates] type, set this Character as active and this Character gains +1000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'New Fish-Man Pirates',
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Daruma'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Daruma'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-030 Dosun (Character, Green)
    // [When Attacking] If your Leader has the [New Fish-Man Pirates] type, this Character cannot be K.O.'d in battle and gains +2000 power until the start of your next turn. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP06-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dosun-when-attacking-unkoable-plus-2000-life-to-hand',
            text: "[When Attacking] If your Leader has the [New Fish-Man Pirates] type, this Character cannot be K.O.'d in battle and gains +2000 power until the start of your next turn. Then, add 1 card from the top of your Life cards to your hand.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'New Fish-Man Pirates',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Dosun'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['cannotBeKoedInBattle'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Dosun'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-031 Hatchan (Character, Green)
    // [Trigger] Play up to 1 [Fish-Man] or [Merfolk] type Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP06-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hatchan-trigger-play-fish-man-or-merfolk',
            text: '[Trigger] Play up to 1 [Fish-Man] or [Merfolk] type Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Fish-Man', 'Merfolk'],
                    costMax: 3,
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
    // OP06-033 Vander Decken IX (Character, Green)
    // [On Play] You may trash 1 "Fish-Man" type card from your hand or 1 [The Ark Noah] from your hand or field: K.O. up to 1 of your opponent's rested Characters.
    {
      cardId: 'OP06-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vander-decken-ix-on-play-trash-choice-ko-rested',
            text: '[On Play] You may trash 1 "Fish-Man" type card from your hand or 1 [The Ark Noah] from your hand or field: K.O. up to 1 of your opponent\'s rested Characters.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'chooseActionBranch',
                message: 'Choose a card to trash:',
                choices: [
                  {
                    id: 'trash-fish-man-hand',
                    label: 'Trash 1 "Fish-Man" type card from your hand',
                    actions: [
                      {
                        type: 'trashFromHand',
                        selector: {
                          player: 'self',
                          zones: ['hand'],
                          filter: { trait: ['Fish-Man'] },
                          count: { kind: 'exact', value: 1 },
                        },
                      },
                    ],
                  },
                  {
                    id: 'trash-the-ark-noah-hand-or-field',
                    label: 'Trash 1 [The Ark Noah] from your hand or field',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['hand', 'characters', 'stage'],
                          filter: { name: ['The Ark Noah'] },
                          count: { kind: 'exact', value: 1 },
                        },
                        destinationPlayer: 'selectedCardOwner',
                        destinationZone: 'trash',
                      },
                    ],
                  },
                ],
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-034 Hyouzou (Character, Green)
    // [Activate:Main][Once Per Turn] Rest up to 1 of your opponent's Characters with a cost of 4 or less and this Character gains +1000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP06-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hyouzou-activate-main-rest-char-plus-1000-life-to-hand',
            text: "[Activate:Main][Once Per Turn] Rest up to 1 of your opponent's Characters with a cost of 4 or less and this Character gains +1000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Hyouzou'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-035 Hody Jones (Character, Green)
    // [Rush] [On Play] Rest up to a total of 2 of your opponent's Characters or DON!! cards. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP06-035',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'hody-jones-035-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Hody Jones 035'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hody-jones-035-on-play-rest-up-to-2-char-or-don',
            text: "[On Play] Rest up to a total of 2 of your opponent's Characters or DON!! cards. Then, add 1 card from the top of your Life cards to your hand.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 2 },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 2 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-036 Ryuma (Character, Green)
    // [On Play] / [On K.O.] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.
    {
      cardId: 'OP06-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ryuma-on-play-ko-rested-cost-4-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ryuma-on-ko-ko-rested-cost-4-or-less',
            text: "[On K.O.] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-038 The Billion-fold World Trichiliocosm (Event, Green)
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 8 or more rested cards, that card gains an additional +2000 power during this battle.
    // [Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.
    {
      cardId: 'OP06-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trichiliocosm-counter-plus-2000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'trichiliocosm-counter-additional-2000-if-8-rested',
            text: 'Then, if you have 8 or more rested cards, that card gains an additional +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['cost', 'characters', 'leader', 'stage'],
                  filter: { rested: true },
                },
                value: 8,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'trichiliocosm-trigger-ko-rested-cost-3-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
            trigger: { type: 'trigger' },
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
        },
      ],
    },
    // OP06-039 You Ain't Even Worth Killing Time!! (Event, Green)
    // [Main] Choose one: • Rest up to 1 of your opponent's Characters with a cost of 6 or less. • K.O. up to 1 of your opponent's rested Characters with a cost of 6 or less.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP06-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'you-aint-even-worth-killing-time-main-choose-rest-or-ko',
            text: "[Main] Choose one: • Rest up to 1 of your opponent's Characters with a cost of 6 or less. • K.O. up to 1 of your opponent's rested Characters with a cost of 6 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'op06-039-rest',
                    label:
                      "Rest up to 1 of your opponent's Characters with a cost of 6 or less",
                    actions: [
                      {
                        type: 'rest',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
                            cardCategory: ['Character'],
                            costMax: 6,
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                      },
                    ],
                  },
                  {
                    id: 'op06-039-ko',
                    label:
                      "K.O. up to 1 of your opponent's rested Characters with a cost of 6 or less",
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
                            cardCategory: ['Character'],
                            rested: true,
                            costMax: 6,
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'you-aint-even-worth-killing-time-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP06-039',
                effectId:
                  'you-aint-even-worth-killing-time-main-choose-rest-or-ko',
              },
            ],
          },
        },
      ],
    },
    // OP06-040 Shark Arrows (Event, Green)
    // [Main] K.O. up to 2 of your opponent's rested Characters with a cost of 3 or less.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP06-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shark-arrows-main-ko-rested-cost-3-or-less-up-to-2',
            text: "[Main] K.O. up to 2 of your opponent's rested Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain' },
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
                  count: { kind: 'upTo', value: 2 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shark-arrows-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP06-040',
                effectId: 'shark-arrows-main-ko-rested-cost-3-or-less-up-to-2',
              },
            ],
          },
        },
      ],
    },
    // OP06-041 The Ark Noah (Stage, Green)
    // [On Play] Rest all of your opponent's Characters.
    // [Trigger] Play this card.
    {
      cardId: 'OP06-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'the-ark-noah-on-play-rest-all-opponent-characters',
            text: "[On Play] Rest all of your opponent's Characters.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'the-ark-noah-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['The Ark Noah'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // OP06-042 Vinsmoke Reiju (Leader, Blue/Purple)
    // [Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, draw 1 card.
    {
      cardId: 'OP06-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-reiju-042-your-turn-on-don-returned-draw',
            text: '[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, draw 1 card.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP06-043 Aramaki (Character, Blue)
    // [Blocker] [Activate:Main] [Once Per Turn] You may trash 1 card from your hand and place 1 Character with a cost of 2 or less at the bottom of the owner's deck: This Character gains +3000 power during this turn.
    {
      cardId: 'OP06-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'aramaki-activate-main-trash-1-bottom-cost-2-plus-3000',
            text: "[Activate:Main] [Once Per Turn] You may trash 1 card from your hand and place 1 Character with a cost of 2 or less at the bottom of the owner's deck: This Character gains +3000 power during this turn.",
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
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
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Aramaki'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP06-044 Gion (Character, Blue)
    // [Your Turn][Once Per Turn] When your opponent activates an Event, your opponent must place 1 card from their hand at the bottom of their deck.
    {
      cardId: 'OP06-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gion-your-turn-on-event-opponent-bottom-deck-1',
            text: '[Your Turn][Once Per Turn] When your opponent activates an Event, your opponent must place 1 card from their hand at the bottom of their deck.',
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'opponent' },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                  chooser: 'opponent',
                },
                destinationPlayer: 'opponent',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-045 Kuzan (Character, Blue)
    // [On Play] Draw 2 cards and place 2 cards from your hand at the bottom of your deck in any order.
    {
      cardId: 'OP06-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-045-on-play-draw-2-then-bottom-2',
            text: '[On Play] Draw 2 cards and place 2 cards from your hand at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-046 Sakazuki (Character, Blue)
    // [On Play] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.
    {
      cardId: 'OP06-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-046-on-play-bottom-cost-2-or-less',
            text: "[On Play] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-047 Charlotte Pudding (Character, Blue)
    // [On Play] Your opponent returns all cards in their hand to their deck and shuffles their deck. Then, your opponent draws 5 cards.
    {
      cardId: 'OP06-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-on-play-opponent-hand-to-deck-shuffle-draw-5',
            text: '[On Play] Your opponent returns all cards in their hand to their deck and shuffles their deck. Then, your opponent draws 5 cards.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: { player: 'opponent', zones: ['hand'] },
                destinationPlayer: 'opponent',
                destinationZone: 'deck',
              },
              { type: 'shuffleDeck', player: 'opponent' },
              { type: 'draw', player: 'opponent', amount: 5 },
            ],
          },
        },
      ],
    },
    // OP06-048 Zeff (Character, Blue)
    // [Your Turn] When your opponent activates [Blocker] or an Event, if your Leader has the [East Blue] type, you may trash 4 cards from the top of your deck.
    {
      cardId: 'OP06-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zeff-your-turn-on-blocker-or-event-east-blue-trash-4-from-deck',
            text: '[Your Turn] When your opponent activates [Blocker] or an Event, if your Leader has the [East Blue] type, you may trash 4 cards from the top of your deck.',
            trigger: { type: 'onEventActivated', optional: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'opponent' },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 4 }],
          },
        },
      ],
    },
    // OP06-050 Tashigi (Character, Blue)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Navy" type card other than [Tashigi] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP06-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tashigi-050-on-play-search-navy',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Navy" type card other than [Tashigi] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Navy'], excludeName: ['Tashigi'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-051 Tsuru (Character, Blue)
    // [On Play] You may trash 2 cards from your hand: Your opponent returns 1 of their Characters to the owner's hand.
    {
      cardId: 'OP06-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tsuru-051-on-play-trash-2-opponent-bounce-1',
            text: "[On Play] You may trash 2 cards from your hand: Your opponent returns 1 of their Characters to the owner's hand.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                  chooser: 'opponent',
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-052 Tokikake (Character, Blue)
    // [DON!! x1] If you have 4 or less cards in your hand, this Character cannot be K.O.'d in battle.
    {
      cardId: 'OP06-052',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'tokikake-don-1-hand-4-or-less-cannot-be-koed-in-battle',
            text: "[DON!! x1] If you have 4 or less cards in your hand, this Character cannot be K.O.'d in battle.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 4,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Tokikake'] },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // OP06-053 Jaguar.D.Saul (Character, Blue)
    // [On K.O.] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.
    {
      cardId: 'OP06-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jaguar-d-saul-on-ko-bottom-cost-2-or-less',
            text: "[On K.O.] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-054 Borsalino (Character, Blue)
    // If you have 4 or less cards in your hand, this Character gains [Blocker].
    {
      cardId: 'OP06-054',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'borsalino-hand-4-or-less-blocker',
            text: 'If you have 4 or less cards in your hand, this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 4,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Borsalino'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP06-055 Monkey.D.Garp (Character, Blue)
    // [DON!! x2][When Attacking] If you have 4 or less cards in your hand, your opponent cannot activate [Blocker] during this battle.
    {
      cardId: 'OP06-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-when-attacking-don-2-hand-4-or-less-no-blocker',
            text: '[DON!! x2][When Attacking] If you have 4 or less cards in your hand, your opponent cannot activate [Blocker] during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 4,
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP06-056 Ama no Murakumo Sword (Event, Blue)
    // [Main] Place up to 1 of your opponent's Characters with a cost of 2 or less and up to 1 of your opponent's Characters with a cost of 1 or less at the bottom of the owner's deck in any order.
    {
      cardId: 'OP06-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ama-no-murakumo-sword-main-bottom-cost-2-and-1',
            text: "[Main] Place up to 1 of your opponent's Characters with a cost of 2 or less and up to 1 of your opponent's Characters with a cost of 1 or less at the bottom of the owner's deck in any order.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-057 But I Will Never Doubt a Woman's Tears!!!! (Event, Blue)
    // [Main] Up to 1 of your Leader or Character cards gains +1000 power during this turn. Then, reveal 1 card from the top of your deck, play up to 1 Character card with a cost of 2, and place the rest at the top or bottom of your deck.
    // [Trigger] Play up to 1 Character card with a cost of 2 from your hand.
    {
      cardId: 'OP06-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'never-doubt-womans-tears-main-plus-1000-reveal-play-cost-2',
            text: '[Main] Up to 1 of your Leader or Character cards gains +1000 power during this turn. Then, reveal 1 card from the top of your deck, play up to 1 Character card with a cost of 2, and place the rest at the top or bottom of your deck.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: { cardCategory: ['Character'], costMax: 2 },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'never-doubt-womans-tears-trigger-play-cost-2',
            text: '[Trigger] Play up to 1 Character card with a cost of 2 from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-058 Gravity Blade Raging Tiger (Event, Blue)
    // [Main] Place up to 2 Characters with a cost of 6 or less at the bottom of the owner's deck in any order.
    // [Trigger] Place up to 1 Character with a cost of 5 or less at the bottom of the owner's deck.
    {
      cardId: 'OP06-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gravity-blade-raging-tiger-main-bottom-cost-6-or-less-up-to-2',
            text: "[Main] Place up to 2 Characters with a cost of 6 or less at the bottom of the owner's deck in any order.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 2 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gravity-blade-raging-tiger-trigger-bottom-cost-5-or-less',
            text: "[Trigger] Place up to 1 Character with a cost of 5 or less at the bottom of the owner's deck.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-059 White Snake (Event, Blue)
    // [Counter] Up to 1 of your Leader or Character cards gains +1000 power during this turn, and draw 1 card.
    // [Trigger] Look at 5 cards from the top of your deck and place them at the top or bottom of your deck in any order.
    {
      cardId: 'OP06-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'white-snake-counter-plus-1000-draw-1',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +1000 power during this turn, and draw 1 card.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              { type: 'draw', player: 'self', amount: 1 },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'white-snake-trigger-arrange-top-5',
            text: '[Trigger] Look at 5 cards from the top of your deck and place them at the top or bottom of your deck in any order.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 5 }],
          },
        },
      ],
    },
    // OP06-060 Vinsmoke Ichiji (060) (Character, Purple)
    // [Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Ichiji] with a cost of 7 from your hand or trash.
    {
      cardId: 'OP06-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-ichiji-060-activate-main-don-1-trash-self-play-ichiji-7',
            text: '[Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Ichiji] with a cost of 7 from your hand or trash.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Vinsmoke Ichiji 060'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'GERMA 66',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: { name: ['Vinsmoke Ichiji'], costMax: 7 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-061 Vinsmoke Ichiji (061) (Character, Purple)
    // [On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, give up to 1 of your opponent's Characters -2000 power during this turn and this Character gains [Rush].
    {
      cardId: 'OP06-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-ichiji-061-on-play-don-less-or-equal-minus-2000-rush',
            text: "[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, give up to 1 of your opponent's Characters -2000 power during this turn and this Character gains [Rush].",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
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
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Vinsmoke Ichiji 061'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'permanent' },
              },
            ],
          },
        },
      ],
    },
    // OP06-062 Vinsmoke Judge (Character, Purple)
    // [On Play] DON!! -1 You may trash 2 cards from your hand: Play up to 4 "GERMA 66" type Character cards with different card names and 4000 power or less from your trash.
    // [Activate:Main] [Once Per Turn] DON!! -1: Rest up to 1 of your opponent's DON!! cards.
    {
      cardId: 'OP06-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-judge-on-play-don-1-trash-2-play-germa-distinct',
            text: '[On Play] DON!! -1 You may trash 2 cards from your hand: Play up to 4 "GERMA 66" type Character cards with different card names and 4000 power or less from your trash.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'GERMA 66',
              },
            ],
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    trait: ['GERMA 66'],
                    cardCategory: ['Character'],
                    powerMax: 4000,
                  },
                  count: { kind: 'upTo', value: 4 },
                  distinctBy: 'name',
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-judge-activate-main-don-1-rest-opponent-don',
            text: "[Activate:Main] [Once Per Turn] DON!! -1: Rest up to 1 of your opponent's DON!! cards.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP06-063 Vinsmoke Sora (Character, Purple)
    // [On Play] You may trash 1 card from your hand: If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 [The Vinsmoke Family] type Character card with 4000 power or less from your trash to your hand.
    {
      cardId: 'OP06-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-sora-on-play-trash-1-search-vinsmoke-family',
            text: "[On Play] You may trash 1 card from your hand: If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 [The Vinsmoke Family] type Character card with 4000 power or less from your trash to your hand.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['The Vinsmoke Family'],
                  powerMax: 4000,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-064 Vinsmoke Niji (064) (Character, Purple)
    // [Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Niji] with a cost of 5 from your hand or trash.
    {
      cardId: 'OP06-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-niji-064-activate-main-don-1-trash-self-play-niji-5',
            text: '[Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Niji] with a cost of 5 from your hand or trash.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Vinsmoke Niji 064'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'GERMA 66',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: { name: ['Vinsmoke Niji'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-065 Vinsmoke Niji (065) (Character, Purple)
    // [On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, choose one:
    // • K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    // • Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand.
    {
      cardId: 'OP06-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-niji-065-on-play-choose-ko-or-bounce',
            text: "[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, choose one: \u2022 K.O. up to 1 of your opponent's Characters with a cost of 2 or less. \u2022 Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'ko-cost-2-or-less',
                    label:
                      "K.O. up to 1 of your opponent's Characters with a cost of 2 or less",
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 2 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        upTo: true,
                        reason: 'effect',
                      },
                    ],
                  },
                  {
                    id: 'bounce-cost-4-or-less',
                    label:
                      "Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand",
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 4 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'selectedCardOwner',
                        destinationZone: 'hand',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP06-066 Vinsmoke Yonji (066) (Character, Purple)
    // [Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Yonji] with a cost of 4 from your hand or trash.
    {
      cardId: 'OP06-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-yonji-066-activate-main-don-1-trash-self-play-yonji-4',
            text: '[Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Yonji] with a cost of 4 from your hand or trash.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Vinsmoke Yonji 066'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'GERMA 66',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: { name: ['Vinsmoke Yonji'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-067 Vinsmoke Yonji (067) (Character, Purple)
    // If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, this Character gains +1000 power.
    {
      cardId: 'OP06-067',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'vinsmoke-yonji-067-don-less-equal-plus-1000',
            text: "If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, this Character gains +1000 power.",
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Vinsmoke Yonji 067'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // OP06-068 Vinsmoke Reiju (068) (Character, Purple)
    // [Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Reiju] with a cost of 4 from your hand or trash.
    {
      cardId: 'OP06-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-reiju-068-activate-main-don-1-trash-self-play-reiju-4',
            text: '[Activate:Main] DON!! -1 You may trash this Character: If your Leader has the [GERMA 66] type, play up to 1 [Vinsmoke Reiju] with a cost of 4 from your hand or trash.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Vinsmoke Reiju 068'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'GERMA 66',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: { name: ['Vinsmoke Reiju'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-069 Vinsmoke Reiju (069) (Character, Purple)
    // [On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field and you have 5 or less cards in your hand, draw 2 cards.
    {
      cardId: 'OP06-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-reiju-069-on-play-draw-2-if-don-less-or-equal-and-hand-5',
            text: "[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field and you have 5 or less cards in your hand, draw 2 cards.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 5,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP06-071 Gild Tesoro (Character, Purple)
    // [On Play] DON!! -1: If your Leader has the [FILM] type, add up to 2 [FILM] type Character cards with a cost of 4 or less from your trash to your hand.
    {
      cardId: 'OP06-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gild-tesoro-on-play-don-1-search-film-trash',
            text: '[On Play] DON!! -1: If your Leader has the [FILM] type, add up to 2 [FILM] type Character cards with a cost of 4 or less from your trash to your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'FILM' },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['FILM'],
                  costMax: 4,
                },
                count: { kind: 'upTo', value: 2 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-072 Cosette (Character, Purple)
    // If your Leader has the [GERMA 66] type and the number of DON!! cards on your field is at least 2 less than the number on your opponent's field, this Character gains [Blocker].
    {
      cardId: 'OP06-072',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'shiki-blocker-when-opponent-has-2-more-don',
            text: "If your Leader has the [GERMA 66] type and the number of DON!! cards on your field is at least 2 less than the number on your opponent's field, this Character gains [Blocker].",
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'GERMA 66',
              },
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Shiki'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP06-073 Shiki (Character, Purple)
    // [Blocker] [On Play] If you have 8 or more DON!! cards on your field, draw 1 card and trash 1 card from your hand.
    {
      cardId: 'OP06-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shiki-073-on-play-don-8-plus-draw-1-trash-1',
            text: '[On Play] If you have 8 or more DON!! cards on your field, draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
    // OP06-074 Zephyr (Navy) (Character, Purple)
    // [On Play] DON!! -1: Negate the effect of up to 1 of your opponent's Characters during this turn. Then, if that Character has 5000 power or less, K.O. it.
    {
      cardId: 'OP06-074',
      effects: [{ kind: 'special-ref', specialHandlerId: 'op06-074-special' }],
    },
    // OP06-075 Count Battler (Character, Purple)
    // [On Play] DON!! -1: Rest up to 2 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'OP06-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'count-battler-on-play-don-1-rest-cost-2-or-less-up-to-2',
            text: "[On Play] DON!! -1: Rest up to 2 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP06-076 Hitokiri Kamazo (Character, Purple)
    // [Your Turn][Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'OP06-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hitokiri-kamazo-your-turn-on-don-returned-ko-cost-2-or-less',
            text: "[Your Turn][Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-077 Black Bug (Event, Purple)
    // [Main] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, place up to 1 of your opponent's Characters with a cost of 5 or less at the bottom of the owner's deck.
    // [Trigger] Place up to 1 of your opponent's Characters with a cost of 4 or less at the bottom of the owner's deck.
    {
      cardId: 'OP06-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'black-bug-main-bottom-cost-5-or-less',
            text: "[Main] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, place up to 1 of your opponent's Characters with a cost of 5 or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'black-bug-trigger-bottom-cost-4-or-less',
            text: "[Trigger] Place up to 1 of your opponent's Characters with a cost of 4 or less at the bottom of the owner's deck.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-078 GERMA 66 (Event, Purple)
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" other than [GERMA 66] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP06-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'germa-66-main-search-germa',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" other than [GERMA 66] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['GERMA'], excludeName: ['GERMA 66'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'germa-66-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP06-079 Kingdom of GERMA (Stage, Purple)
    // [Activate:Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP06-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kingdom-of-germa-activate-main-trash-1-rest-search-germa',
            text: '[Activate:Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain', optional: true },
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
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Kingdom of GERMA'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['GERMA'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-080 Gecko Moria (080) (Leader, Black)
    // [DON!! x1] [When Attacking] (2) You may trash 1 card from your hand: Trash 2 cards from the top of your deck and play up to 1 "Thriller Bark Pirates" type Character card with a cost of 4 or less from your trash.
    {
      cardId: 'OP06-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gecko-moria-080-when-attacking-don-1-cost-2-trash-1-deck-2-play-thriller',
            text: '[DON!! x1] [When Attacking] (2) You may trash 1 card from your hand: Trash 2 cards from the top of your deck and play up to 1 "Thriller Bark Pirates" type Character card with a cost of 4 or less from your trash.',
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              { type: 'removeDon', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              { type: 'trashFromDeck', player: 'self', amount: 2 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
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
    // OP06-081 Absalom (Character, Black)
    // [On Play] You may return 2 cards from your trash to the bottom of your deck in any order: K.O. up to 1 Character with a cost of 2 or less.
    {
      cardId: 'OP06-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'absalom-on-play-return-2-from-trash-ko-cost-2-or-less',
            text: '[On Play] You may return 2 cards from your trash to the bottom of your deck in any order: K.O. up to 1 Character with a cost of 2 or less.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-082 Inuppe (Character, Black)
    // [On Play] / [On K.O.] If your Leader has the [Thriller Bark Pirates] type, draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP06-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inuppe-on-play-draw-2-trash-2',
            text: '[On Play] If your Leader has the [Thriller Bark Pirates] type, draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Thriller Bark Pirates',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
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
        {
          kind: 'standard',
          effect: {
            id: 'inuppe-on-ko-draw-2-trash-2',
            text: '[On K.O.] If your Leader has the [Thriller Bark Pirates] type, draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Thriller Bark Pirates',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
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
    // OP06-083 Oars (Character, Black)
    // This Character cannot attack.
    // [Activate:Main] You may K.O. 1 of your [Thriller Bark Pirates] type Characters: This Character's effect is negated during this turn.
    {
      cardId: 'OP06-083',
      effects: [{ kind: 'special-ref', specialHandlerId: 'op06-083-special' }],
    },
    // OP06-084 Jigoro of the Wind (Character, Black)
    // [On K.O.] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP06-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jigoro-of-the-wind-on-ko-plus-1000',
            text: '[On K.O.] Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP06-085 Kumacy (Character, Black)
    // [DON!! x2][Your Turn] This Character gains +1000 power for every 5 cards in your trash.
    {
      cardId: 'OP06-085',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kumacy-don-2-your-turn-power-per-5-trash',
            text: '[DON!! x2][Your Turn] This Character gains +1000 power for every 5 cards in your trash.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Kumacy'] },
              },
              powerPerCount: {
                selector: { player: 'self', zones: ['trash'] },
                amount: 1000,
                divisor: 5,
              },
            },
          },
        },
      ],
    },
    // OP06-086 Gecko Moria (086) (Character, Black)
    // [On Play] Choose up to 1 Character card with a cost of 4 or less and up to 1 Character card with a cost of 2 or less from your trash. Play 1 card and play the other card rested.
    {
      cardId: 'OP06-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gecko-moria-on-play-play-cost-4-and-cost-2-rested',
            text: '[On Play] Choose up to 1 Character card with a cost of 4 or less and up to 1 Character card with a cost of 2 or less from your trash. Play 1 card and play the other card rested.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-088 Sai (Character, Black)
    // If your Leader has the [Dressrosa] type and is active, this Character gains +2000 power.
    {
      cardId: 'OP06-088',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sai-dressrosa-leader-plus-2000',
            text: 'If your Leader has the [Dressrosa] type, this Character gains +2000 power.',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Dressrosa',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Sai'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // OP06-089 Taralan (Character, Black)
    // [On Play] / [On K.O.] Trash 3 cards from the top of your deck.
    {
      cardId: 'OP06-089',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'taralan-on-play-trash-3',
            text: '[On Play] Trash 3 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'taralan-on-ko-trash-3',
            text: '[On K.O.] Trash 3 cards from the top of your deck.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
      ],
    },
    // OP06-090 Dr. Hogback (Character, Black)
    // [On Play] You may return 2 cards from your trash to the bottom of your deck in any order: Add up to 1 "Thriller Bark Pirates" type card other than [Dr. Hogback] from your trash to your hand.
    {
      cardId: 'OP06-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dr-hogback-on-play-return-2-from-trash-search-thriller',
            text: '[On Play] You may return 2 cards from your trash to the bottom of your deck in any order: Add up to 1 "Thriller Bark Pirates" type card other than [Dr. Hogback] from your trash to your hand.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  trait: ['Thriller Bark Pirates'],
                  excludeName: ['Dr. Hogback'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP06-091 Victoria Cindry (Character, Black)
    // [On Play] If your Leader has the [Thriller Bark Pirates] type, trash 5 cards from the top of your deck.
    {
      cardId: 'OP06-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'victoria-cindry-on-play-trash-5',
            text: '[On Play] If your Leader has the [Thriller Bark Pirates] type, trash 5 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Thriller Bark Pirates',
              },
            ],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 5 }],
          },
        },
      ],
    },
    // OP06-092 Brook (Character, Black)
    // [On Play] Choose one:
    // • Trash up to 1 of your opponent's Characters with a cost of 4 or less.
    // • Your opponent places 3 cards from their trash at bottom of their deck in any order.
    {
      cardId: 'OP06-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-092-on-play-choose-trash-or-bottom-from-opponent-trash',
            text: "[On Play] Choose one: \u2022 Trash up to 1 of your opponent's Characters with a cost of 4 or less. \u2022 Your opponent places 3 cards from their trash at bottom of their deck in any order.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'ko-cost-4-or-less',
                    label:
                      "Trash up to 1 of your opponent's Characters with a cost of 4 or less",
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 4 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        upTo: true,
                        reason: 'effect',
                      },
                    ],
                  },
                  {
                    id: 'opponent-bottom-3-from-trash',
                    label:
                      'Your opponent places 3 cards from their trash at the bottom of their deck',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['trash'],
                          count: { kind: 'exact', value: 3 },
                          chooser: 'opponent',
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'deck',
                        toBottom: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP06-093 Perona (093) (Character, Black)
    // [On Play] If your opponent has 5 or more cards in their hand, choose one:
    // • Your opponent trashes 1 card from their hand.
    // • Give up to 1 of your opponent's Characters -3 cost during this turn.
    {
      cardId: 'OP06-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'perona-093-on-play-hand-5-or-more-choose',
            text: "[On Play] If your opponent has 5 or more cards in their hand, choose one: \u2022 Your opponent trashes 1 card from their hand. \u2022 Give up to 1 of your opponent's Characters -3 cost during this turn.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['hand'] },
                value: 5,
              },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'opponent-trash-1',
                    label: 'Your opponent trashes 1 card from their hand',
                    actions: [
                      {
                        type: 'trashFromHand',
                        selector: {
                          player: 'opponent',
                          zones: ['hand'],
                          count: { kind: 'exact', value: 1 },
                          chooser: 'opponent',
                        },
                      },
                    ],
                  },
                  {
                    id: 'cost-minus-3',
                    label:
                      "Give up to 1 of your opponent's Characters -3 cost during this turn",
                    actions: [
                      {
                        type: 'modifyCost',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'] },
                          count: { kind: 'upTo', value: 1 },
                        },
                        amount: -3,
                        duration: { type: 'untilEndOfTurn' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP06-095 Shadows Asgard (Event, Black)
    // [Main] / [Counter] Your Leader gains +1000 power during this turn. Then, you may K.O. any number of your [Thriller Bark Pirates] type Characters with a cost of 2 or less. Your Leader gains an additional +1000 power during this turn for every Character K.O.'d.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP06-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shadows-asgard-main-plus-1000-ko-any-thriller-for-more',
            text: "[Main] Your Leader gains +1000 power during this turn. Then, you may K.O. any number of your [Thriller Bark Pirates] type Characters with a cost of 2 or less. Your Leader gains an additional +1000 power during this turn for every Character K.O.'d.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'storeSelectedCards',
                key: 'shadows-asgard-ko',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 2,
                  },
                  count: { kind: 'any' },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'shadows-asgard-ko',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              {
                type: 'modifyPowerByStoredCount',
                key: 'shadows-asgard-ko',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amountPerCard: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shadows-asgard-counter-plus-1000-ko-any-thriller-for-more',
            text: "[Counter] Your Leader gains +1000 power during this turn. Then, you may K.O. any number of your [Thriller Bark Pirates] type Characters with a cost of 2 or less. Your Leader gains an additional +1000 power during this turn for every Character K.O.'d.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'storeSelectedCards',
                key: 'shadows-asgard-ko',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 2,
                  },
                  count: { kind: 'any' },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'shadows-asgard-ko',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              {
                type: 'modifyPowerByStoredCount',
                key: 'shadows-asgard-ko',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amountPerCard: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shadows-asgard-trigger-draw-2-trash-1',
            text: '[Trigger] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
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
    // OP06-096 ...Nothing...at All!!! (Event, Black)
    // [Counter] You may add 1 card from the top of your Life cards to your hand: Your Characters with a cost of 7 or less cannot be K.O.'d in battle during this turn.
    // [Trigger] Activate this card's [Counter] effect.
    {
      cardId: 'OP06-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nothing-at-all-counter-life-to-hand-unkoable-cost-7-or-less',
            text: "[Counter] You may add 1 card from the top of your Life cards to your hand: Your Characters with a cost of 7 or less cannot be K.O.'d in battle during this turn.",
            trigger: { type: 'activateCounter', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
                },
                keywords: ['cannotBeKoedInBattle'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nothing-at-all-trigger-activate-counter',
            text: "[Trigger] Activate this card's [Counter] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP06-096',
                effectId:
                  'nothing-at-all-counter-life-to-hand-unkoable-cost-7-or-less',
              },
            ],
          },
        },
      ],
    },
    // OP06-097 Negative Hollow (Event, Black)
    // [Main] Trash 1 card from your opponent's hand.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP06-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'negative-hollow-main-trash-opponent-hand-1',
            text: "[Main] Trash 1 card from your opponent's hand.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                  chooser: 'opponent',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'negative-hollow-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP06-097',
                effectId: 'negative-hollow-main-trash-opponent-hand-1',
              },
            ],
          },
        },
      ],
    },
    // OP06-098 Thriller Bark (Stage, Black)
    // [Activate:Main] (1) You may rest this Stage: If your Leader has the [Thriller Bark Pirates] type, play up to 1 [Thriller Bark Pirates] type Character card with a cost of 2 or less from your trash rested.
    {
      cardId: 'OP06-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thriller-bark-stage-activate-main-don-1-rest-play-thriller-rested',
            text: '[Activate:Main] (1) You may rest this Stage: If your Leader has the [Thriller Bark Pirates] type, play up to 1 [Thriller Bark Pirates] type Character card with a cost of 2 or less from your trash rested.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Thriller Bark'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Thriller Bark Pirates',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 2,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-099 Aisa (Character, Yellow)
    // [On Play] Look at up to 1 card from the top of your or your opponent's Life cards and place it at the top or bottom of the Life cards.
    {
      cardId: 'OP06-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'aisa-on-play-look-at-own-or-opponent-life',
            text: "[On Play] Look at up to 1 card from the top of your or your opponent's Life cards and place it at the top or bottom of the Life cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Which Life cards to look at?',
                choices: [
                  {
                    id: 'self',
                    label: 'Look at your own Life cards',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['life'],
                          filter: { zonePosition: 'topOrBottom' },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'self',
                        destinationZone: 'life',
                        faceDown: false,
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                  {
                    id: 'opponent',
                    label: "Look at your opponent's Life cards",
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['life'],
                          filter: { zonePosition: 'top' },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'life',
                        faceDown: false,
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP06-100 Inuarashi (Character, Yellow)
    // [DON!! x2][When Attacking] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.
    // [Trigger] If your opponent has 3 or less Life cards, play this card.
    {
      cardId: 'OP06-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inuarashi-100-when-attacking-don-2-trash-1-ko-cost-less-than-life',
            text: "[DON!! x2][When Attacking] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMaxFromLifeOf: 'opponent',
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'inuarashi-100-trigger-play-if-3-or-less-life',
            text: '[Trigger] If your opponent has 3 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Inuarashi'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-101 O-Nami (SP) (Character, Yellow)
    // [On Play] Up to 1 of your Leader or Character cards gains [Banish] during this turn.
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP06-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'o-nami-on-play-banish',
            text: '[On Play] Up to 1 of your Leader or Character cards gains [Banish] during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'o-nami-trigger-ko-cost-5-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-102 Kamakiri (Character, Yellow)
    // [Activate:Main][Once Per Turn] You may place 1 Stage with a cost of 1 at the bottom of the owner's deck: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'OP06-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kamakiri-activate-main-place-stage-1-ko-cost-2-or-less',
            text: "[Activate:Main][Once Per Turn] You may place 1 Stage with a cost of 1 at the bottom of the owner's deck: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['stage'],
                  filter: { cardCategory: ['Stage'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-103 Kawamatsu (Character, Yellow)
    // [When Attacking] You may trash 2 cards from your hand: Add up to 1 of your Characters with 0 power to the top or bottom of the owner's Life cards face-up.
    {
      cardId: 'OP06-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kawamatsu-when-attacking-trash-2-add-0-power-to-life',
            text: "[When Attacking] You may trash 2 cards from your hand: Add up to 1 of your Characters with 0 power to the top or bottom of the owner's Life cards face-up.",
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 0 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                faceDown: false,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-104 Kikunojo (Character, Yellow)
    // [On K.O.] If your opponent has 3 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.
    // [Trigger] If your opponent has 3 or less Life cards, play this card.
    {
      cardId: 'OP06-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kikunojo-on-ko-add-to-life-if-3-or-less',
            text: '[On K.O.] If your opponent has 3 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'addToLife',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kikunojo-trigger-play-if-3-or-less-life',
            text: '[Trigger] If your opponent has 3 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Kikunojo'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-106 Kouzuki Hiyori (Character, Yellow)
    // [On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.
    {
      cardId: 'OP06-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-on-play-life-to-hand-then-hand-to-life',
            text: '[On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: true,
                toBottom: false,
              },
            ],
          },
        },
      ],
    },
    // OP06-107 Kouzuki Momonosuke (Character, Yellow)
    // [Blocker] [On Play] Add up to 1 of your "Land of Wano" type Characters other than [Kouzuki Momonosuke] to the top or bottom of the owner's Life cards face-up.
    {
      cardId: 'OP06-107',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-momonosuke-on-play-add-wano-character-to-life',
            text: '[On Play] Add up to 1 of your "Land of Wano" type Characters other than [Kouzuki Momonosuke] to the top or bottom of the owner\'s Life cards face-up.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Land of Wano'],
                    excludeName: ['Kouzuki Momonosuke'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                faceDown: false,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-108 Tenguyama Hitetsu (Character, Yellow)
    // [Trigger] Up to 1 of your [Land of Wano] type Leader or Character cards gains +2000 power during this turn.
    {
      cardId: 'OP06-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tenguyama-hitetsu-trigger-land-of-wano-plus-2000',
            text: '[Trigger] Up to 1 of your [Land of Wano] type Leader or Character cards gains +2000 power during this turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP06-109 Denjiro (Character, Yellow)
    // [DON!! x2] If your opponent has 3 or less Life cards, this Character cannot be K.O.'d by effects.
    // [Trigger] If your opponent has 3 or less Life cards, play this card.
    {
      cardId: 'OP06-109',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'denjiro-don-2-opponent-3-or-less-life-unkoable-by-effects',
            text: "[DON!! x2] If your opponent has 3 or less Life cards, this Character cannot be K.O.'d by effects.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Denjiro'] },
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'denjiro-trigger-play-if-3-or-less-life',
            text: '[Trigger] If your opponent has 3 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Denjiro'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-110 Nekomamushi (Character, Yellow)
    // [DON!! x2] This Character can also attack your opponent's active Characters.
    // [Trigger] If your opponent has 3 or less Life cards, play this card.
    {
      cardId: 'OP06-110',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nekomamushi-don-2-can-attack-active',
            text: "[DON!! x2] This Character can also attack your opponent's active Characters.",
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Nekomamushi'] },
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nekomamushi-trigger-play-if-3-or-less-life',
            text: '[Trigger] If your opponent has 3 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Nekomamushi'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-111 Braham (Character, Yellow)
    // [Activate:Main][Once Per Turn] You may place 1 Stage with a cost of 1 at the bottom of the owner's deck: Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    // [Trigger] If you have 2 or less Life cards, play this card.
    {
      cardId: 'OP06-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'braham-activate-main-place-stage-1-rest-cost-4-or-less',
            text: "[Activate:Main][Once Per Turn] You may place 1 Stage with a cost of 1 at the bottom of the owner's deck: Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['stage'],
                  filter: { cardCategory: ['Stage'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'braham-trigger-play-if-2-or-less-life',
            text: '[Trigger] If you have 2 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Braham'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-112 Raizo (Character, Yellow)
    // [When Attacking] You may trash 1 card from your hand: Rest up to 1 of your opponent's DON!! cards.
    // [Trigger] If your opponent has 3 or less Life cards, play this card.
    {
      cardId: 'OP06-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'raizo-when-attacking-trash-1-rest-opponent-don',
            text: "[When Attacking] You may trash 1 card from your hand: Rest up to 1 of your opponent's DON!! cards.",
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'raizo-trigger-play-if-3-or-less-life',
            text: '[Trigger] If your opponent has 3 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Raizo'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP06-113 Raki (Character, Yellow)
    // If you have a [Shandian Warrior] type Character other than [Raki], this Character gains [Blocker].
    {
      cardId: 'OP06-113',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'raki-shandian-warrior-exists-blocker',
            text: 'If you have a [Shandian Warrior] type Character other than [Raki], this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Shandian Warrior'],
                    excludeName: ['Raki'],
                  },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Raki'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP06-114 Wyper (Character, Yellow)
    // [On Play] You may place 1 Stage with a cost of 1 at the bottom of the owner's deck: Look at 5 cards from the top of your deck; reveal up to 1 [Upper Yard] or [Shandian Warrior] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP06-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'wyper-on-play-place-stage-1-search-upper-yard',
            text: "[On Play] You may place 1 Stage with a cost of 1 at the bottom of the owner's deck: Look at 5 cards from the top of your deck; reveal up to 1 [Upper Yard] or [Shandian Warrior] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['stage'],
                  filter: { cardCategory: ['Stage'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Upper Yard', 'Shandian Warrior'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP06-115 You're the One Who Should Disappear (Event, Yellow)
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.
    // [Trigger] If you have 0 Life cards, you may add up to 1 card from the top of your deck to the top of your Life cards. Then, trash 1 card from your hand.
    {
      cardId: 'OP06-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'disappear-counter-trash-1-plus-3000',
            text: '[Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.',
            trigger: { type: 'activateCounter', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'disappear-trigger-0-life-add-to-life-then-trash',
            text: '[Trigger] If you have 0 Life cards, you may add up to 1 card from the top of your deck to the top of your Life cards. Then, trash 1 card from your hand.',
            trigger: { type: 'trigger', optional: true },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 0 },
            ],
            actions: [
              {
                type: 'addToLife',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
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
    // OP06-116 Reject (Event, Yellow)
    // [Main] Choose one: • K.O. up to 1 of your opponent's Characters with a cost of 5 or less. • If your opponent has 1 Life card, deal 1 damage to your opponent. Then, add 1 card from the top of your Life cards to your hand.
    // [Trigger] Draw 1 cards.
    {
      cardId: 'OP06-116',
      effects: [
        { kind: 'special-ref', specialHandlerId: 'op06-116-special' },
        {
          kind: 'standard',
          effect: {
            id: 'reject-trigger-draw-1',
            text: '[Trigger] Draw 1 cards.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP06-117 The Ark Maxim (Stage, Yellow)
    // [Activate:Main][Once Per Turn] You may rest this card and 1 of your [Enel] cards: K.O. all of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'OP06-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'the-ark-maxim-activate-main-rest-self-and-enel-ko-all-cost-2',
            text: "[Activate:Main][Once Per Turn] You may rest this card and 1 of your [Enel] cards: K.O. all of your opponent's Characters with a cost of 2 or less.",
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Enel'], rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'koAllCharacters',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP06-118 Roronoa Zoro (Character, Green)
    // [When Attacking][Once Per Turn](1): Set this Character as active.
    // [Activate:Main][Once Per Turn](2): Set this Character as active.
    {
      cardId: 'OP06-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-118-when-attacking-rest-1-don-unrest',
            text: '[When Attacking][Once Per Turn](1): Set this Character as active.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-118-activate-main-rest-2-don-unrest',
            text: '[Activate:Main][Once Per Turn](2): Set this Character as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP06-119 Sanji (Character, Blue)
    // [On Play] Reveal 1 card from the top of your deck and play up to 1 Character with a cost of 9 or less other than [Sanji]. Then, place the rest at the bottom of your deck.
    {
      cardId: 'OP06-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-119-on-play-reveal-play-cost-9-or-less',
            text: '[On Play] Reveal 1 card from the top of your deck and play up to 1 Character with a cost of 9 or less other than [Sanji]. Then, place the rest at the bottom of your deck.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: {
                  cardCategory: ['Character'],
                  costMax: 9,
                  excludeName: ['Sanji'],
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
  ],
};
