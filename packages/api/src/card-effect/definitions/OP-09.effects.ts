import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op09EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-09',
  cards: [
    {
      cardId: 'OP09-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shanks-001-on-opponent-attack-minus-1000',
            text: '[Once Per Turn] This effect can be activated when your opponent attacks. Give up to 1 of your opponent’s Leader or Character cards 1000 power during this turn.',
            trigger: {
              type: 'onAttacked',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uta-on-play-search-red-haired-pirates',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 “Red-Haired Pirates” type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Red-Haired Pirates'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shachi-and-penguin-when-attacking-minus-2000',
            text: '[When Attacking] Give up to 1 of your opponent’s Characters 2000 power during this turn.',
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'shanks-004-all-opponent-characters-minus-1000',
            text: 'Give all of your opponent’s Characters 1000 power.',
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                },
              },
              power: -1000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP09-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'silvers-rayleigh-on-play-draw-2-trash-1',
            text: '[On Play] If your opponent has 2 or more Characters with a base power of 5000 or more, draw 2 cards and trash 1 card from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMin: 5000,
                  },
                },
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-006',
      effects: [],
    },
    {
      cardId: 'OP09-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'heat-on-play-leader-plus-1000',
            text: '[On Play] Up to 1 of your Leader with 4000 power or less gains +1000 power during this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    powerMax: 4000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'building-snake-activate-main-bottom-deck-minus-3000',
            text: '[Activate: Main] You may place this Character at the bottom of the owner’s deck: Give up to 1 of your opponent’s Characters 3000 power during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -3000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
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
    {
      cardId: 'OP09-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'benn-beckman-on-play-trash-6000-or-less',
            text: '[On Play] Trash up to 1 of your opponent’s Characters with 6000 power or less.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bonk-punch-on-play-play-monster',
            text: '[On Play] Play up to 1 [Monster] from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Monster'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'bonk-punch-don-1-when-attacking-plus-2000',
            text: '[DON!! x1] [When Attacking] This Character gains +2000 power during this turn.',
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hongo-activate-main-rest-minus-2000',
            text: '[Activate: Main] You may rest this Character: If your Leader has the “Red-Haired Pirates” type, give up to 1 of your opponent’s Characters 2000 power during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Red-Haired Pirates',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-012',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'monster-trash-instead-of-bonk-punch-ko',
            text: 'If your Character [Bonk Punch] would be K.O.’d by an effect, you may trash this Character instead.',
            event: 'wouldKoCharacter',
            replacement: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'eventReasonIs',
                value: 'effect',
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    name: ['Bonk Punch'],
                  },
                },
              },
            ],
            optional: true,
          },
        },
      ],
    },
    {
      cardId: 'OP09-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yasopp-on-play-leader-plus-1000',
            text: '[On Play] Up to 1 of your Leader gains +1000 power until the end of your opponent’s next turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1000,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'yasopp-don-1-when-attacking-minus-1000',
            text: '[DON!! x1] [When Attacking] Give up to 1 of your opponent’s Characters 1000 power during this turn.',
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'limejuice-on-play-blocker-block-4000-or-less',
            text: '[On Play] Your opponent cannot activate up to 1 [Blocker] Character that has 4000 power or less during this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 4000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                keywords: ['cannotBlock'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lucky-roux-on-ko-ko-base-6000-or-less',
            text: '[On K.O.] If your Leader has the “Red-Haired Pirates” type, K.O. up to 1 of your opponent’s Characters with a base power of 6000 or less.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 6000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Red-Haired Pirates',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-016',
      effects: [],
    },
    {
      cardId: 'OP09-017',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'wire-don-1-rush-if-leader-7000-kid-pirates',
            text: '[DON!! x1] If your Leader has 7000 power or more and the “Kid Pirates” type, this Character gains [Rush].',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['rush'],
            },
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 1,
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    cardCategory: ['Leader'],
                    trait: ['Kid Pirates'],
                    powerMin: 7000,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-018',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-018-special',
        },
      ],
    },
    {
      cardId: 'OP09-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nobody-hurts-a-friend-main-minus-3000',
            text: '[Main] If your Leader has the “Red-Haired Pirates” type, give up to 1 of your opponent’s Characters -3000 power during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -3000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Red-Haired Pirates',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nobody-hurts-a-friend-main-draw-if-opponent-5000',
            text: 'Then, if your opponent has a Character with 5000 or more power, draw 1 card.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMin: 5000,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nobody-hurts-a-friend-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'come-on-well-fight-you-main-search-red-haired-pirates',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 “Red-Haired Pirates” type card other than [Come On!! We’ll Fight You!!] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Red-Haired Pirates'],
                  excludeName: ['Come On!! We’ll Fight You!!'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
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
            id: 'come-on-well-fight-you-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'red-force-activate-main-rest-minus-1000',
            text: '[Activate: Main] You may rest this Stage: If your Leader has the “Red-Haired Pirates” type, give up to 1 of your opponent’s Characters 1000 power during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Red-Haired Pirates',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-022',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-022-special',
        },
      ],
    },
    {
      cardId: 'OP09-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'adio-on-play-unrest-3-don',
            text: '[On Play] If your Leader has the “ODYSSEY” type, set up to 3 of your DON!! cards as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: {
                    kind: 'upTo',
                    value: 3,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'ODYSSEY',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'adio-on-opponent-attack-rest-don-plus-2000',
            text: '[On Your Opponent’s Attack] [Once Per Turn] You may rest 1 of your DON!! cards: Up to 1 of your Leader or Character cards gains +2000 power during this battle.',
            trigger: {
              type: 'onAttacked',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopp-024-on-play-draw-2-trash-2',
            text: '[On Play] If you have 2 or more rested Characters, draw 2 cards and trash 2 cards from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-025',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'crocodile-025-cannot-be-koed-in-battle-by-leaders',
            text: 'If your Leader has the “ODYSSEY” type, this Character cannot be K.O.’d in battle by Leaders.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedInBattle'],
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'ODYSSEY',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-on-play-ko-cost-5-or-less',
            text: '[On Play] If you have 2 or more rested Characters, K.O. up to 1 of your opponent’s Characters with a cost of 5 or less.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sabo-027-when-attacking-draw-1',
            text: '[When Attacking] [Once Per Turn] If you have 3 or more rested Characters, draw 1 card.',
            trigger: {
              type: 'whenAttacking',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 3,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-028-on-ko-life-to-hand-play-from-trash',
            text: '[On K.O.] You may add 1 card from the top or bottom of your Life cards to your hand: Play up to 1 “ODYSSEY” or “Straw Hat Crew” type Character card with a cost of 4 or less from your trash rested.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['ODYSSEY', 'Straw Hat Crew'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: {
                    zonePosition: 'topOrBottom',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-029-end-of-turn-unrest-odyssey',
            text: '[End of Your Turn] Set up to 1 of your “ODYSSEY” type Characters with a cost of 4 or less as active.',
            trigger: {
              type: 'onTurnEnd',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['ODYSSEY'],
                    costMax: 4,
                    rested: true,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-030-on-play-return-character-play-odyssey',
            text: '[On Play] You may return 1 of your Characters to the owner’s hand: Play up to 1 “ODYSSEY” type Character card with a cost of 3 or less other than [Trafalgar Law] from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['ODYSSEY'],
                    costMax: 3,
                    excludeName: ['Trafalgar Law'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-031-end-of-turn-unrest',
            text: '[End of Your Turn] If you have 2 or more rested Characters, set this Character as active.',
            trigger: {
              type: 'onTurnEnd',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-rosinante-032-on-attack-unrest',
            text: '[On Your Opponent’s Attack] [Once Per Turn] Set this Character as active.',
            trigger: {
              type: 'onAttacked',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-033-on-play-protect-odyssey-straw-hat',
            text: '[On Play] If you have 2 or more rested Characters, none of your “ODYSSEY” or “Straw Hat Crew” type Characters can be K.O.’d by effects until the end of your opponent’s next turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['ODYSSEY', 'Straw Hat Crew'],
                  },
                },
                keywords: ['cannotBeKoedByEffects'],
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'perona-on-play-search-mihawk-or-thriller-bark',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Dracule Mihawk] or “Thriller Bark Pirates” type card and add it to your hand. Then, place the rest at the bottom of your deck in any order and trash 1 card from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Thriller Bark Pirates'],
                  name: ['Dracule Mihawk'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-on-play-rest-cost-5-or-less',
            text: '[On Play] If you have 2 or more rested Characters, rest up to 1 of your opponent’s Characters with a cost of 5 or less.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-036-on-play-rest-don-or-character',
            text: '[On Play] If you have 2 or more rested Characters, rest up to 1 of your opponent’s DON!! cards or Characters with a cost of 6 or less.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost', 'characters'],
                  filter: {
                    costMax: 6,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lim-037-on-play-search-odyssey',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 “ODYSSEY” type card other than [Lim] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['ODYSSEY'],
                  excludeName: ['Lim'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
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
            id: 'lim-037-end-of-turn-unrest',
            text: '[End of Your Turn] If you have 3 or more rested Characters, set this Character as active.',
            trigger: {
              type: 'onTurnEnd',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 3,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-038',
      effects: [],
    },
    {
      cardId: 'OP09-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-cuatro-jet-counter-plus-2000',
            text: '[Counter] If your Leader has the “ODYSSEY” type and you have 2 or more rested Characters, up to 1 of your Leader or Character cards gains +2000 power during this turn.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'ODYSSEY',
              },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-cuatro-jet-trigger-ko-rested',
            text: '[Trigger] K.O. up to 1 of your opponent’s rested Characters with a cost of 4 or less.',
            trigger: {
              type: 'trigger',
            },
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
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thunder-lance-main-ko-cost-4-or-less',
            text: '[Main] If you have 2 or more rested Characters, K.O. up to 1 of your opponent’s Characters with a cost of 4 or less.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'thunder-lance-trigger-rest-cost-4-or-less',
            text: '[Trigger] Rest up to 1 of your opponent’s Characters with a cost of 4 or less.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'soul-franky-counter-plus-2000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'soul-franky-counter-unrest-2',
            text: 'Then, if your Leader has the “ODYSSEY” type and you have 2 or more rested Characters, set up to 2 of your Characters as active.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                  count: {
                    kind: 'upTo',
                    value: 2,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'ODYSSEY',
              },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                  },
                },
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'soul-franky-trigger-rest-cost-4-or-less',
            text: '[Trigger] Rest up to 1 of your opponent’s Characters with a cost of 4 or less.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buggy-042-activate-main-rest-5-don-trash-1-play-cross-guild',
            text: '[Activate: Main] You may rest 5 of your DON!! cards and trash 1 card from your hand: Play up to 1 “Cross Guild” type Character card from your hand.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Cross Guild'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 5,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'alvida-on-ko-play-character',
            text: '[On K.O.] If your Leader has the “Cross Guild” type, play up to 1 Character card with a cost of 5 or less other than [Alvida] from your hand.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                    excludeName: ['Alvida'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Cross Guild',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'izo-when-attacking-search-wano-or-whitebeard',
            text: '[When Attacking] Look at 5 cards from the top of your deck; reveal up to 1 “Land of Wano” type card or card with a type including “Whitebeard Pirates” and add it to your hand. Then, place the rest at the bottom of your deck in any order and trash 1 card from your hand.',
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Land of Wano', 'Whitebeard Pirates'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-045',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'cabaji-cannot-be-koed-in-battle',
            text: 'If you have a [Buggy] or [Mohji] Character, this Character cannot be K.O.’d in battle.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedInBattle'],
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    name: ['Buggy', 'Mohji'],
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-046-on-play-cross-guild-or-baroque-works',
            text: '[On Play] Play up to 1 “Cross Guild” type Character card or Character card with a type including “Baroque Works” with a cost of 5 or less from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Cross Guild', 'Baroque Works'],
                    costMax: 5,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-oden-on-ko-draw-2-trash-1',
            text: '[On K.O.] Draw 2 cards and trash 1 card from your hand.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dracule-mihawk-048-on-play-draw-2-trash-1',
            text: '[On Play] Draw 2 cards and trash 1 card from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-049',
      effects: [],
    },
    {
      cardId: 'OP09-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-050-when-attacking-search-blue-event',
            text: '[When Attacking] Look at 5 cards from the top of your deck; reveal up to 1 blue Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Event'],
                  color: ['Blue'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buggy-051-on-play-bottom-deck-opponent-character',
            text: '[On Play] Place up to 1 of your opponent’s Characters at the bottom of the owner’s deck.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
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
            id: 'buggy-051-on-play-self-bottom-deck-if-not-5-cost-5',
            text: 'Then, if you do not have 5 Characters with a cost of 5 or more, place this Character at the bottom of the owner’s deck.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 5,
                  },
                },
                value: 4,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-052',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-052-special',
        },
      ],
    },
    {
      cardId: 'OP09-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mohji-on-play-search-and-play-richie',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Richie] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Richie] from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  name: ['Richie'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Richie'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-054',
      effects: [],
    },
    {
      cardId: 'OP09-055',
      effects: [],
    },
    {
      cardId: 'OP09-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-3-on-play-search-cross-guild-or-baroque-works',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 “Cross Guild” type card or card with a type including “Baroque Works” other than [Mr.3(Galdino)] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Cross Guild', 'Baroque Works'],
                  excludeName: ['Mr.3(Galdino)'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cross-guild-main-search',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 “Cross Guild” type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Cross Guild'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
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
            id: 'cross-guild-trigger-activate-main',
            text: '[Trigger] Activate this card’s [Main] effect.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP09-057',
                effectId: 'cross-guild-main-search',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-058',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-058-special',
        },
      ],
    },
    {
      cardId: 'OP09-059',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-059-special',
        },
      ],
    },
    {
      cardId: 'OP09-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emptee-bluffs-island-activate-main-draw-2',
            text: '[Activate: Main] You may place 2 cards from your hand at the bottom of your deck in any order and rest this Stage: If your Leader has the “Cross Guild” type, draw 2 cards.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Cross Guild',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-061',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'monkey-d-luffy-061-don-1-all-characters-plus-1-cost',
            text: '[DON!! x1] All of your Characters gain +1 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                },
              },
              cost: 1,
            },
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-061-on-don-returned-add-don',
            text: '[Your Turn] [Once Per Turn] When 2 or more DON!! cards on your field are returned to your DON!! deck, add up to 1 DON!! card from your DON!! deck and set it as active, and add up to 1 additional DON!! card and rest it.',
            trigger: {
              type: 'onDonReturned',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-062-when-attacking-trash-trigger-add-rested-don',
            text: '[When Attacking] You may trash 1 card with a [Trigger] from your hand: Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: {
              type: 'whenAttacking',
              optional: true,
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    hasTrigger: true,
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-063',
      effects: [],
    },
    {
      cardId: 'OP09-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'killer-on-play-don-1-unrest-kid-pirates-leader',
            text: '[On Play] DON!! 1: Set up to 1 of your “Kid Pirates” type Leader as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    trait: ['Kid Pirates'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-065-on-play-rush-and-rest',
            text: '[On Play] You may return 1 or more DON!! cards from your field to your DON!! deck: This Character gains [Rush] during this turn. Then, rest up to 1 of your opponent’s Characters with a cost of 6 or less.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                keywords: ['rush'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 6,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jean-bart-on-play-ko-if-opponent-has-more-don',
            text: '[On Play] If your opponent has more DON!! cards on their field than you, K.O. up to 1 of your opponent’s Characters with a cost of 3 or less.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-067',
      effects: [],
    },
    {
      cardId: 'OP09-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-068-end-of-turn-unrest-and-blocker',
            text: '[End of Your Turn] You may return 1 or more DON!! cards from your field to your DON!! deck: Set this Character as active. Then, this Character gains [Blocker] until the end of your opponent’s next turn.',
            trigger: {
              type: 'onTurnEnd',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                keywords: ['mustBeAttackTarget'],
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-069-on-play-search-straw-hat-or-heart',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 “Straw Hat Crew” or “Heart Pirates” type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Straw Hat Crew', 'Heart Pirates'],
                  costMin: 2,
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-070-on-play-attach-rested-don',
            text: '[On Play] You may return 1 or more DON!! cards from your field to your DON!! deck: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
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
    {
      cardId: 'OP09-071',
      effects: [],
    },
    {
      cardId: 'OP09-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'franky-on-play-don-2-trash-1-draw-2',
            text: '[On Play] DON!! 2, You may trash 1 card from your hand: Draw 2 cards.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-073-when-attacking-minus-2000-to-up-to-2',
            text: '[When Attacking] You may return 1 or more DON!! cards from your field to your DON!! deck: Give up to 2 of your opponent’s Characters 2000 power during this turn.',
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 2,
                  },
                },
                amount: -2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bepo-on-don-returned-plus-1000',
            text: '[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: {
              type: 'onDonReturned',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'eventPlayerIs',
                player: 'self',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eustass-captain-kid-on-play-life-to-hand-add-don',
            text: '[On Play] You may add 1 card from the top of your Life cards to your hand: If your Leader has the “Kid Pirates” type, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kid Pirates',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-076-on-play-return-don-add-active-don',
            text: '[On Play] You may return 1 or more DON!! cards from your field to your DON!! deck: Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-lightning-main-ko-6000-or-less',
            text: '[Main] DON!! 2: K.O. up to 1 of your opponent’s Characters with 6000 power or less.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-lightning-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-giant-counter-plus-4000-draw-2',
            text: '[Counter] DON!! 2, You may trash 1 card from your hand: If your Leader has the “Straw Hat Crew” type, up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, draw 2 cards.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 4000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-jump-rope-main-rest-and-draw',
            text: '[Main] DON!! 2: Rest up to 1 of your opponent’s Characters with a cost of 5 or less. Then, draw 1 card.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-jump-rope-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-080',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-080-special',
        },
      ],
    },
    {
      cardId: 'OP09-081',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-081-special',
        },
      ],
    },
    {
      cardId: 'OP09-082',
      effects: [],
    },
    {
      cardId: 'OP09-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'van-augur-activate-main-plus-3-cost',
            text: '[Activate: Main] You may rest this Character: If your Leader has the “Blackbeard Pirates” type, give up to 1 of your opponent’s Characters 3 cost during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 3,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'van-augur-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'catarina-devon-activate-main-choose-keyword',
            text: '[Activate: Main] [Once Per Turn] If your Leader has the “Blackbeard Pirates” type, this Character gains [Double Attack], [Banish] or [Blocker] until the end of your opponent’s next turn.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'double-attack',
                    label: 'Double Attack',
                    actions: [
                      {
                        type: 'grantKeywords',
                        selector: {
                          player: 'self',
                          source: 'effectSource',
                          zones: ['characters'],
                          count: {
                            kind: 'exact',
                            value: 1,
                          },
                        },
                        keywords: ['doubleAttack'],
                        duration: {
                          type: 'untilStartOfYourNextTurn',
                        },
                      },
                    ],
                  },
                  {
                    id: 'banish',
                    label: 'Banish',
                    actions: [
                      {
                        type: 'grantKeywords',
                        selector: {
                          player: 'self',
                          source: 'effectSource',
                          zones: ['characters'],
                          count: {
                            kind: 'exact',
                            value: 1,
                          },
                        },
                        keywords: ['banish'],
                        duration: {
                          type: 'untilStartOfYourNextTurn',
                        },
                      },
                    ],
                  },
                  {
                    id: 'blocker',
                    label: 'Blocker',
                    actions: [
                      {
                        type: 'grantKeywords',
                        selector: {
                          player: 'self',
                          source: 'effectSource',
                          zones: ['characters'],
                          count: {
                            kind: 'exact',
                            value: 1,
                          },
                        },
                        keywords: ['mustBeAttackTarget'],
                        duration: {
                          type: 'untilStartOfYourNextTurn',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gecko-moria-on-play-from-trash',
            text: '[On Play] Play up to 1 “Thriller Bark Pirates” type Character card with a cost of 2 or less from your trash rested.',
            trigger: {
              type: 'onPlay',
            },
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
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-086',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'jesus-burgess-cannot-be-koed-by-effects',
            text: 'This Character cannot be K.O.’d by your opponent’s effects.',
            event: 'wouldKoCharacter',
            replacement: [],
            conditions: [
              {
                type: 'eventReasonIs',
                value: 'effect',
              },
              {
                type: 'eventPlayerIs',
                player: 'opponent',
              },
            ],
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'jesus-burgess-power-per-trash',
            text: 'If your Leader has the “Blackbeard Pirates” type, this Character gains +1000 power for every 4 cards in your trash.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              powerPerCount: {
                selector: {
                  player: 'self',
                  zones: ['trash'],
                },
                amount: 1000,
                divisor: 4,
              },
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-087',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-on-play-opponent-trash',
            text: '[On Play] If your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                },
                value: 5,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shiryu-when-attacking-trash-2-draw-2',
            text: '[DON!! x1] [When Attacking] You may trash 2 cards from your hand: Draw 2 cards.',
            trigger: {
              type: 'whenAttacking',
              optional: true,
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 1,
              },
            ],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-089',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'stronger-activate-main-draw-and-minus-cost',
            text: '[Activate: Main] You may trash 1 card from your hand and trash this Character: If your Leader has the “Blackbeard Pirates” type, draw 1 card. Then, give up to 1 of your opponent’s Characters –2 cost during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -2,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'doc-q-activate-main-ko-cost-1-or-less',
            text: '[Activate: Main] You may rest this Character: If your Leader has the “Blackbeard Pirates” type, K.O. up to 1 of your opponent’s Characters with a cost of 1 or less.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 1,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'doc-q-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-091',
      effects: [],
    },
    {
      cardId: 'OP09-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marshall-d-teach-092-activate-main-draw-if-hand-difference',
            text: '[Activate: Main] You may rest this Character: If the number of cards in your hand is at least 3 less than the number in your opponent’s hand, draw 2 cards and trash 1 card from your hand.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 3,
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-093',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-093-special',
        },
      ],
    },
    {
      cardId: 'OP09-094',
      effects: [],
    },
    {
      cardId: 'OP09-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'laffitte-activate-main-search-blackbeard-pirates',
            text: '[Activate: Main] You may rest 1 of your DON!! cards and this Character: Look at 5 cards from the top of your deck; reveal up to 1 “Blackbeard Pirates” type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Blackbeard Pirates'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'my-era-begins-main-search',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 “Blackbeard Pirates” type card other than [My Era...Begins!!] and add it to your hand. Then, trash the rest.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Blackbeard Pirates'],
                  excludeName: ['My Era...Begins!!'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'my-era-begins-trigger-activate-main',
            text: '[Trigger] Activate this card’s [Main] effect.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP09-096',
                effectId: 'my-era-begins-main-search',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'black-vortex-counter-negate-and-plus-4000',
            text: '[Counter] Negate the effect of up to 1 of your opponent’s Leader or Character cards and give that card 4000 power during this turn.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 4000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                keywords: ['cannotAttack'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'black-vortex-trigger-negate',
            text: '[Trigger] Negate the effect of up to 1 of your opponent’s Leader or Character cards during this turn.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                keywords: ['cannotAttack'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-098',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-098-special',
        },
        {
          kind: 'standard',
          effect: {
            id: 'black-hole-trigger-negate',
            text: "[Trigger] Negate the effect of up to 1 of your opponent's Leader or Character cards during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fullalead-activate-main-search-blackbeard-pirates',
            text: '[Activate: Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 “Blackbeard Pirates” type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Blackbeard Pirates'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'karasu-trigger-play',
            text: '[Trigger] If your Leader has the “Revolutionary Army” type and you and your opponent have a total of 5 or less Life cards, play this card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Karasu'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-101',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-101-special',
        },
      ],
    },
    {
      cardId: 'OP09-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'professor-clover-on-play-search-trigger',
            text: '[On Play] If your Leader is [Nico Robin], look at 3 cards from the top of your deck; reveal up to 1 card with a [Trigger] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  hasTrigger: true,
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nico Robin',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'professor-clover-trigger-activate-on-play',
            text: '[Trigger] Activate this card’s [On Play] effect.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP09-102',
                effectId: 'professor-clover-on-play-search-trigger',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-on-play-life-to-hand-play-revolutionary-army',
            text: '[On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Play up to 1 “Revolutionary Army” type Character card with a cost of 4 or less from your hand. If you do, draw 1 card.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: {
                    zonePosition: 'topOrBottom',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sabo-104-on-play-hand-to-life',
            text: '[On Play] Add up to 1 “Revolutionary Army” type Character card from your hand to the top of your Life cards face-up.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                player: 'self',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sabo-104-on-play-life-to-hand',
            text: 'Then, if you have 2 or more Life cards, add 1 card from the top or bottom of your Life cards to your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: {
                    zonePosition: 'topOrBottom',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sabo-104-trigger-draw-2',
            text: '[Trigger] If your Leader is multicolored, draw 2 cards.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-105-trigger-deck-to-life-trash-2',
            text: '[Trigger] If your Leader has the “Egghead” type, add up to 1 card from the top of your deck to the top of your Life cards. Then, trash 2 cards from your hand.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Egghead',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-olvia-on-play-leader-plus-3000',
            text: '[On Play] Up to 1 of your [Nico Robin] Leader gains +3000 power during this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    name: ['Nico Robin'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nico-olvia-trigger-draw-3-trash-2',
            text: '[Trigger] If your Leader is [Nico Robin], draw 3 cards and trash 2 cards from your hand.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 3,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nico Robin',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-107',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-107-on-play-trash-opponent-life',
            text: "[On Play] If your opponent has 3 or more Life cards, trash up to 1 card from the top of your opponent's Life cards.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['life'] },
                value: 3,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-107-trigger-play-yellow',
            text: '[Trigger] Play up to 1 yellow Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Yellow'],
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
    {
      cardId: 'OP09-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-trigger-play',
            text: '[Trigger] If your Leader has the “Revolutionary Army” type and you and your opponent have a total of 5 or less Life cards, play this card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Bartholomew Kuma'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jaguar-d-saul-trigger-play',
            text: '[Trigger] If your Leader is [Nico Robin], play this card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Jaguar.D.Saul'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nico Robin',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pierre-on-play-draw-2-trash-2',
            text: '[On Play] Draw 2 cards and trash 2 cards from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'pierre-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Pierre'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-111-trigger-opponent-trash-2',
            text: '[Trigger] If your Leader has the “Egghead” type and your opponent has 6 or more cards in their hand, your opponent trashes 2 cards from their hand.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Egghead',
              },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                },
                value: 6,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'belo-betty-on-play-draw-if-life-2-or-less',
            text: '[On Play] If you have 2 or less Life cards, draw 1 card.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'belo-betty-trigger-play',
            text: '[Trigger] If your Leader has the “Revolutionary Army” type and you and your opponent have a total of 5 or less Life cards, play this card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Belo Betty'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-113',
      effects: [],
    },
    {
      cardId: 'OP09-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lindbergh-on-play-ko-2000-or-less',
            text: '[On Play] If you and your opponent have a total of 5 or less Life cards, K.O. up to 1 of your opponent’s Characters with 2000 power or less.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 2000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 5,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'lindbergh-trigger-play',
            text: '[Trigger] If you and your opponent have a total of 5 or less Life cards, play this card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Lindbergh'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 5,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ice-block-partisan-main-ko-trigger',
            text: '[Main] K.O. up to 1 of your opponent’s Characters with a cost of 3 or less and a [Trigger].',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                    hasTrigger: true,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ice-block-partisan-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'never-underestimate-counter-plus-2000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'never-underestimate-trigger-play-revolutionary-army',
            text: '[Trigger] Play up to 1 “Revolutionary Army” type Character card with a cost of 4 or less from your hand.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dereshi-main-search-trigger-cards',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 2 cards with a [Trigger] other than [Dereshi!] and add them to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  hasTrigger: true,
                  excludeName: ['Dereshi!'],
                },
                count: {
                  kind: 'upTo',
                  value: 2,
                },
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
            id: 'dereshi-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP09-118',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op09-118-special',
        },
      ],
    },
    {
      cardId: 'OP09-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-119-on-play-draw-and-rush',
            text: '[On Play] You may return 1 or more DON!! cards from your field to your DON!! deck: Draw 1 card and this Character gains [Rush] during this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                keywords: ['rush'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
  ],
};
