import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const op08EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-08',
  cards: [
    {
      cardId: 'OP08-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-067',
            text: '[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mont-blanc-noland-on-play-shandian-and-kalgara-add-life',
            text: '[On Play] If your Leader has the [Shandian Warrior] type and you have a [Kalgara] Character, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Shandian Warrior',
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kalgara'], cardCategory: ['Character'] },
                },
              },
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
      ],
    },
    {
      cardId: 'OP08-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-katakuri-063-on-play-life-face-down-add-active-don',
            text: '[On Play] You may turn 1 card from the top of your Life cards face-down: Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay', optional: true },
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
                destinationZone: 'life',
                faceDown: true,
              },
            ],
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP08-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pedro-on-ko-choose-rest-don-or-ko-rested-char',
            text: "[On K.O.] Choose one: \u2022 Rest up to 1 of your opponent's DON!! cards. \u2022 K.O. up to 1 of your opponent's rested Characters with a cost of 6 or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'op08-rest-don',
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
                    id: 'ko-rested',
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
      ],
    },
    {
      cardId: 'OP08-043',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-043-special',
        },
      ],
    },
    {
      cardId: 'OP08-118',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-118-special',
        },
      ],
    },
    {
      cardId: 'OP08-119',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-119-special',
        },
      ],
    },
    {
      cardId: 'OP08-046',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-046-special',
        },
      ],
    },
    {
      cardId: 'OP08-062',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-062-special',
        },
      ],
    },
    {
      cardId: 'OP08-098',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-098-special',
        },
      ],
    },
    {
      cardId: 'OP08-079',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-079-special',
        },
      ],
    },
    {
      cardId: 'OP08-069',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-069-special',
        },
      ],
    },
    {
      cardId: 'OP08-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'black-maria-074-activate-main-add-don-and-schedule-return',
            text: '[Activate:Main] [Once Per Turn] If you have no other [Black Maria] Characters, add up to 5 DON!! cards from your DON!! deck and rest them. Then, at the end of this turn, return DON!! cards from your field to your DON!! deck until you have the same number of DON!! cards on your field as your opponent.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Black Maria'] },
                  count: { kind: 'exact', value: 1 },
                },
                value: 1,
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 5,
                rested: true,
              },
              {
                type: 'scheduleActionsAtTurnEnd',
                actions: [
                  {
                    type: 'returnDonToDonDeckMatchingOpponentCount',
                    player: 'self',
                    referencePlayer: 'opponent',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-angel-101-activate-main-trash-life-and-schedule',
            text: '[Activate:Main] [Once Per Turn] You may trash 1 card from the top of your Life cards: If your Leader has the [Big Mom Pirates] type, add 1 card from the top of your deck to the top of your Life cards at the end of this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Big Mom Pirates',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'scheduleActionsAtTurnEnd',
                actions: [
                  {
                    type: 'addToLife',
                    player: 'self',
                    selector: {
                      player: 'self',
                      zones: ['deck'],
                      filter: { zonePosition: 'top' },
                      count: { kind: 'exact', value: 1 },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-096',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op08-096-special',
        },
      ],
    },
    {
      cardId: 'OP08-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'conquest-of-the-sea-main-don-2-ko-cost-6-or-less',
            text: "[Main] DON!! 2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the [Animal Kingdom Pirates] or [Big Mom Pirates] type, K.O. up to 2 of your opponent's Characters with a cost of 6 or less.",
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 2 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hiking-bear-activate-main-animal-other-plus-1000',
            text: '[DON!! x1] [Activate: Main] [Once Per Turn] Up to 1 of your [Animal] type Characters other than this Character gains +1000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Animal'],
                    excludeName: ['Hiking Bear'],
                  },
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
    {
      cardId: 'OP08-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'queen-080-on-play-search-animal-kingdom-pirates',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Animal Kingdom Pirates} type card other than [Queen] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Animal Kingdom Pirates'],
                  excludeName: ['Queen'],
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
    {
      cardId: 'OP08-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'wanda-on-play-search-minks',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Minks] type card other than [Wanda] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Minks'], excludeName: ['Wanda'] },
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
    {
      cardId: 'OP08-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sasaki-activate-main-rest-don-optional-rest-self-give-cost-2',
            text: "[Activate:Main] Rest 1 of your DON!! cards and you may rest this Character: Give up to 1 of your opponent's Characters 2 cost during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Sasaki'], rested: false },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-on-play-reveal-play-whitebeard-pirates',
            text: '[On Play] Reveal 1 card from the top of your deck and play up to 1 Character card with a type including "Whitebeard Pirates" and a cost of 4 or less. Then, place the rest at the top or bottom of your deck.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Whitebeard Pirates'],
                  costMax: 4,
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'king-060-on-play-don-1-opponent-5-don-rush',
            text: '[On Play] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your opponent has 5 or more DON!! cards on their field, this Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'opponent',
                value: 5,
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-114',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 's-hawk-don-1-less-life-than-opponent',
            text: "[DON!! x1] If you have less Life cards than your opponent, this Character cannot be K.O.'d in battle by attribute cards and gains +2000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['S-Hawk'] },
              },
              keywords: ['cannotBeKoedInBattle'],
              power: 2000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 's-hawk-trigger-trash-1-play-if-2-or-less-life',
            text: '[Trigger] You may trash 1 card from your hand: If you have 2 or less Life cards, play this card.',
            trigger: { type: 'trigger', optional: true },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['S-Hawk'] },
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
    {
      cardId: 'OP08-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jozu-on-play-bounce-self-char-bounce-opponent',
            text: "[On Play] You may return 1 of your Characters other than this Character to the owner's hand: Return up to 1 Character with a cost of 6 or less to the owner's hand.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    excludeName: ['Jozu'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
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
      cardId: 'OP08-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thank-you-for-loving-me-main',
            text: '[Main] If your Leader\'s type includes "Whitebeard Piratess", look at 3 cards from the top of your deck; reveal up to 1 card with a type including "Whitebeard Piratess" or [Monkey.D.Luffy] and add it to your hand. Then, place the rest at the top or bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Piratess',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Whitebeard Piratess', 'Monkey.D.Luffy'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'thank-you-for-loving-me-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP08-072',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'biscuit-warrior-blocker',
            text: '[Blocker]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Biscuit Warrior'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-013',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'robson-don-2-rush',
            text: '[DON!! x2] This Character gains [Rush].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Robson'] },
              },
              keywords: ['rush'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dr-hiriluk-activate-main-rest-self-chopper-all-plus-2000',
            text: '[Activate:Main] You may rest this Character: If your Leader is [Tony Tony.Chopper], all of your [Tony Tony.Chopper] Characters gain +2000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Tony Tony.Chopper',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Dr.Hiriluk'], rested: false },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Tony Tony.Chopper'] },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cloven-rose-main',
            text: "[Main] Up to 3 of your Characters gain +1000 power during this turn. Then, give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 3 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'cloven-rose-trigger',
            text: "[Trigger] Give up to 1 of your opponent's Leader or Character cards 3000 power during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
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
    {
      cardId: 'OP08-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'milky-activate-main-rest-self-restand-don',
            text: '[Activate:Main] You may rest this Character: If your Leader has the [Minks] type, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Minks' },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Milky'], rested: false },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
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
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'wapol-when-attacking',
            text: "[DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters 2000 power during this turn. Then, this Character gains +2000 power until the end of your opponent's next turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
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
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inuarashi-on-play',
            text: "[On Play] If your Leader has the {Minks} type, up to 2 of your opponent's rested Characters with a cost of 5 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Minks' },
            ],
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 2 },
                },
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nekomamushi-028-on-play',
            text: '[On Play] If your opponent has 7 or more rested cards, this Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['cost', 'characters', 'leader', 'stage'],
                  filter: { rested: true },
                },
                value: 7,
              },
            ],
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
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'alber-activate-main-trash-self-play-king',
            text: '[Activate:Main] You may trash this Character: If your Leader has the [Animal Kingdom Pirates] type and you have 10 DON!! cards on your field, play up to 1 [King] with a cost of 7 or less from your hand.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 10 },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
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
                  zones: ['hand'],
                  filter: { name: ['King'], costMax: 7 },
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
      cardId: 'OP08-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'imperial-flame-main',
            text: "[Main] You may place 3 cards from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 3 },
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
        {
          kind: 'standard',
          effect: {
            id: 'imperial-flame-counter',
            text: "[Counter] You may place 3 cards from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateCounter', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 3 },
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
        {
          kind: 'standard',
          effect: {
            id: 'imperial-flame-trigger',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP08-094',
                effectId: 'imperial-flame-main',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kingdew-activate-main',
            text: '[Activate:Main] [Once Per Turn] You may reveal 2 cards with a type including "Whitebeard Piratess" from your hand: This Character gains +2000 power during this turn.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Whitebeard Piratess'] },
                },
                value: 2,
              },
            ],
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 2,
                storeAs: 'kingdew-reveal',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 's-shark-when-attacking',
            text: '[DON!! x1] [When Attacking] Your opponent cannot activate [Blocker] during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
        {
          kind: 'standard',
          effect: {
            id: 's-shark-trigger',
            text: '[Trigger] You may trash 1 card from your hand: If you have 2 or less Life cards, play this card.',
            trigger: { type: 'trigger', optional: true },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['S-Shark'] },
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
    {
      cardId: 'OP08-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'page-one-on-play-play-ulti-from-trash',
            text: '[On Play] Play up to 1 [Ulti] with a cost of 4 or less from your trash.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Ulti'], costMax: 4 },
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
      cardId: 'OP08-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'its-to-die-for-main',
            text: '[Main] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'activateMain' },
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'its-to-die-for-main-conditional',
            text: 'Then, if your opponent has a Character with 6000 power or more, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 6000 },
                },
              },
            ],
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP08-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dalton-on-play',
            text: "[On Play] Give up to 1 of your opponent's Characters 1000 power during this turn.",
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
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'dalton-activate-main',
            text: '[DON!! x1] [Activate: Main] [Once Per Turn] You may add 1 card from the top of your Life cards to your hand: This Character gains [Rush] during this turn.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'garchu-main',
            text: "[Main] You may rest 1 of your {Minks} type Characters: Rest up to 1 of your opponent's Characters.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Minks'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'garchu-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP08-087',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'scratchmen-apoo-blocker',
            text: '[Blocker]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Scratchmen Apoo'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'scratchmen-apoo-activate-main',
            text: "[Activate:Main] [Once Per Turn] Give up to 1 of your opponent's Characters 1 cost during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-066',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'charlotte-brulee-blocker',
            text: '[Blocker]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Charlotte Brulee'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-brulee-on-ko',
            text: '[On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-050',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'namule-blocker',
            text: '[Blocker]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Namule'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'namule-on-play',
            text: '[On Play] Draw 2 cards and place 2 cards from your hand at the top or bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                  chooser: 'self',
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'concelot-when-attacking',
            text: "[When Attacking] Up to 1 of your opponent's rested Characters with a cost of 4 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
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
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lapins-when-attacking',
            text: "[DON!! x2] [When Attacking] If your Leader has the [Drum Kingdom] type, K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Drum Kingdom',
              },
            ],
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
    {
      cardId: 'OP08-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'atmos-on-play',
            text: '[On Play] You may reveal 2 cards with a type including "Whitebeard Piratess" from your hand: If your Leader\'s type includes "Whitebeard Piratess", return up to 1 of your opponent\'s Characters with a cost of 4 or less to the owner\'s hand.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Whitebeard Piratess'] },
                },
                value: 2,
              },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Piratess',
              },
            ],
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 2,
                storeAs: 'atmos-reveal',
              },
            ],
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
        },
      ],
    },
    {
      cardId: 'OP08-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-when-attacking',
            text: "[DON!! x1] [When Attacking] If you have a Character with a cost of 8 or more, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMin: 8 },
                },
              },
            ],
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
        },
      ],
    },
    {
      cardId: 'OP08-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-001',
            text: '[Activate: Main] [Once Per Turn] Give up to 3 of your "Animal" or "Drum Kingdom" type Characters up to 1 rested DON!! card each.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Animal', 'Drum Kingdom'],
                  },
                  count: { kind: 'upTo', value: 3 },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dr-kureha-on-play',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 [Tony Tony.Chopper] or [Drum Kingdom] type card other than [Dr.Kureha] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Tony Tony.Chopper', 'Drum Kingdom'],
                  excludeName: ['Dr.Kureha'],
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
    {
      cardId: 'OP08-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-007-on-play',
            text: '[Your Turn] [On Play] Look at 5 cards from the top of your deck and play up to 1 [Animal] type Character card with 4000 power or less rested. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Animal'],
                  powerMax: 4000,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-007-when-attacking',
            text: '[Your Turn] [When Attacking] Look at 5 cards from the top of your deck and play up to 1 [Animal] type Character card with 4000 power or less rested. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Animal'],
                  powerMax: 4000,
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
    {
      cardId: 'OP08-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carrot-023-on-play',
            text: "[On Play] Up to 1 of your opponent's rested Characters with a cost of 7 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 7,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'carrot-023-when-attacking',
            text: "[When Attacking] Up to 1 of your opponent's rested Characters with a cost of 7 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 7,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'wyper-on-play',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Upper Yard] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Upper Yard] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { name: ['Upper Yard'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Upper Yard'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-045',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'thatch-replacement',
            text: "If this Character would be removed from the field by your opponent's effect or K.O.'d, trash this Character and draw 1 card instead.",
            event: 'wouldKoCharacter',
            conditions: [{ type: 'eventPlayerIs', player: 'opponent' }],
            replacement: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              { type: 'draw', player: 'self', amount: 1 },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-058-when-attacking',
            text: '[When Attacking] You may turn 2 cards from the top of your Life cards face-up: Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 2 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: false,
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-weevil-when-attacking',
            text: "[DON!! x1] [When Attacking] Return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
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
      cardId: 'OP08-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-perospero-on-ko',
            text: '[On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-perospero-trigger',
            text: '[Trigger] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.',
            trigger: { type: 'trigger', optional: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Charlotte Perospero'] },
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
    {
      cardId: 'OP08-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'south-bird-on-play',
            text: '[On Play] Look at 7 cards from the top of your deck and play up to 1 [Upper Yard]. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 7,
                filter: { name: ['Upper Yard'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Upper Yard'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'we-would-never-sell-a-comrade-main',
            text: "[Main] You may rest 2 of your Characters: None of your Characters can be K.O.'d by your opponent's effects until the end of your opponent's next turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: false },
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                keywords: ['cannotBeKoedByEffects'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'we-would-never-sell-a-comrade-trigger',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'trigger' },
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
    {
      cardId: 'OP08-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shishilian-on-play',
            text: "[On Play] Up to 1 of your opponent's rested Characters with a cost of 3 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
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
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-106-on-play',
            text: "[On Play] You may trash 1 card with a [Trigger] from your hand: K.O. up to 1 of your opponent's Characters with a cost of 5 or less. Then, if you have 3 or less cards in your hand, draw 1 card.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { hasTrigger: true },
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
                  filter: { cardCategory: ['Character'], costMax: 5 },
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
            id: 'nami-106-conditional-draw',
            text: 'Then, if you have 3 or less cards in your hand, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 3,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nami-106-trigger',
            text: "[Trigger] Activate this card's [On Play] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP08-106',
                effectId: 'nami-106-on-play',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 's-snake-on-play',
            text: "[On Play] Up to 1 of your opponent's Characters with a cost of 6 or less other than [Monkey.D.Luffy] cannot attack until the end of your opponent's next turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 6,
                    excludeName: ['Monkey.D.Luffy'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotAttack'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 's-snake-trigger',
            text: "[Trigger] Activate this card's [On Play] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP08-112',
                effectId: 's-snake-on-play',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-083',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sheepshead-don-1-your-turn',
            text: "[DON!! x1] [Your Turn] Give all of your opponent's Characters 1 cost.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              cost: 1,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'burn-blade-main',
            text: "[Main] You may trash 1 card from the top of your Life cards: K.O. up to 1 of your opponent's Characters with a cost of 7 or less.",
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
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
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
            id: 'burn-blade-trigger',
            text: '[Trigger] You may add 1 card from the top of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.',
            trigger: { type: 'trigger', optional: true },
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
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marco-002',
            text: "[DON!! x1] [Activate: Main] [Once Per Turn] Draw 1 card and place 1 card from your hand at the top or bottom of your deck. Then, give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                chooseDestinationPosition: true,
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
    {
      cardId: 'OP08-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 's-bear-trigger',
            text: "[Trigger] You may trash 1 card from your hand: If you have 2 or less Life cards, play this card and K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'trigger', optional: true },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['S-Bear'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
    {
      cardId: 'OP08-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carrot-021',
            text: '[Activate: Main] [Once Per Turn] If you have a "Minks" type Character, rest up to 1 of your opponent\'s Characters with a cost of 5 or less.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Minks'] },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'count-niwatori-on-ko',
            text: "[Opponent's Turn] [On K.O.] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [Baron Tamago] with a cost of 4 or less from your deck. Then, shuffle your deck.",
            trigger: { type: 'onKo', optional: true },
            conditions: [{ type: 'controllerTurn', value: false }],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { name: ['Baron Tamago'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              { type: 'shuffleDeck', player: 'self' },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'king-057',
            text: "[Activate: Main] [Once Per Turn] DON!! 2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Choose one:\u2022 If you have 5 or less cards in your hand, draw 1 card.\u2022 Give up to 1 of your opponent's Characters 2 cost during this turn.",
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'draw-if-hand-5-or-less',
                    label:
                      'If you have 5 or less cards in your hand, draw 1 card',
                    actions: [{ type: 'draw', player: 'self', amount: 1 }],
                  },
                  {
                    id: 'give-cost-2',
                    label:
                      "Give up to 1 of your opponent's Characters 2 cost during this turn",
                    actions: [
                      {
                        type: 'modifyCost',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'] },
                          count: { kind: 'upTo', value: 1 },
                        },
                        amount: 2,
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
    {
      cardId: 'OP08-070',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'baron-tamago-blocker',
            text: '[Blocker]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Baron Tamago'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'baron-tamago-on-ko',
            text: '[On K.O.] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [Viscount Hiyoko] with a cost of 5 or less from your hand.',
            trigger: { type: 'onKo', optional: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Viscount Hiyoko'], costMax: 5 },
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
      cardId: 'OP08-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'aphelandra-activate-main',
            text: "[Activate:Main] You may return this Character to the owner's hand: If your Leader has the {Kuja Pirates} type, place up to 1 of your opponent's Characters with a cost of 1 or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kuja Pirates',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
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
    {
      cardId: 'OP08-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'speed-jil-on-play',
            text: '[On Play] Reveal 1 card from the top of your deck and place it at the top or bottom of your deck. If the revealed card\'s type includes "Whitebeard Piratess", this Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: { trait: ['Whitebeard Piratess'] },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-cracker',
            text: '[Activate:Main] [Once Per Turn] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [Biscuit Warrior] from your hand.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Biscuit Warrior'] },
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
      cardId: 'OP08-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'viscount-hiyoko-on-ko',
            text: "[Opponent's Turn] [On K.O.] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [Count Niwatori] with a cost of 6 or less from your deck. Then, shuffle your deck.",
            trigger: { type: 'onKo', optional: true },
            conditions: [{ type: 'controllerTurn', value: false }],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { name: ['Count Niwatori'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              { type: 'shuffleDeck', player: 'self' },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'munch-munch-mutation-main',
            text: "[Main] Give up to 1 of your opponent's Characters 3000 power during this turn. Then, up to 1 of your Characters gains +3000 power during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
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
            id: 'munch-munch-mutation-counter',
            text: "[Counter] Give up to 1 of your opponent's Characters 3000 power during this turn. Then, up to 1 of your Characters gains +3000 power during this turn.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
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
            id: 'munch-munch-mutation-trigger',
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
    {
      cardId: 'OP08-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'burn-bazooka-counter',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'burn-bazooka-swap',
            text: 'Then, you may add 1 card from the top or bottom of your Life cards to your hand. If you do, add up to 1 [Shandian Warrior] type card from your hand to the top of your Life cards face-up.',
            trigger: { type: 'activateCounter', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'topOrBottom' },
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
                  filter: { trait: ['Shandian Warrior'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: false,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'iron-body-fang-flash-main',
            text: "[Main] If you have 10 or more cards in your trash, up to 1 of your Characters gains +2000 power until the end of your opponent's next turn.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'iron-body-fang-flash-trigger',
            text: '[Trigger] Up to 1 of your Leader or Character cards gains +2000 power during this turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
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
    {
      cardId: 'OP08-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'id-never-shoot-you-counter',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'id-never-shoot-you-give-opponent',
            text: "Then, give up to 1 of your opponent's Leader or Character cards 1000 power during this turn.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
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
            id: 'id-never-shoot-you-trigger',
            text: '[Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'trigger' },
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
    {
      cardId: 'OP08-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'phoenix-brand-main',
            text: '[Main] You may reveal 2 cards with a type including "Whitebeard Piratess" from your hand: Place up to 1 Character with a cost of 6 or less at the bottom of the owner\'s deck.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Whitebeard Piratess'] },
                },
                value: 2,
              },
            ],
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 2,
                storeAs: 'phoenix-reveal',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
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
    {
      cardId: 'OP08-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-on-life-removed',
            text: "[DON!! x1] [Your Turn] [Once Per Turn] When a card is removed from your opponent's Life cards, draw 2 cards and trash 1 card from your hand.",
            trigger: { type: 'onLifeDamageDealt', oncePerTurn: true },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
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
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-trigger',
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
    {
      cardId: 'OP08-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-custard',
            text: "[Activate:Main] [Once Per Turn] You may add 1 card from the top of your Life cards to your hand: Up to 1 of your Characters gains +1000 power until the end of your opponent's next turn.",
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
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-oven-when-attacking',
            text: "[When Attacking] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'whenAttacking', optional: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
    {
      cardId: 'OP08-029',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'pekoms-active-minks',
            text: "If this Character is active, your {Minks} type Characters with a cost of 3 or less other than [Pekoms] cannot be K.O.'d by effects.",
            conditions: [{ type: 'sourceIsRested', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Minks'],
                  costMax: 3,
                  excludeName: ['Pekoms'],
                },
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ginrummy-on-play',
            text: '[On Play] If your opponent has a Character with a cost of 0, draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
                },
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
    {
      cardId: 'OP08-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'you-cant-take-our-king-counter',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, reveal 1 card from the top of your deck and play up to 1 Character card with a type including "Whitebeard Piratess" and a cost of 3 or less. Then, place the rest at the top or bottom of your deck.',
            trigger: { type: 'activateCounter' },
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
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Whitebeard Piratess'],
                  costMax: 3,
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-poire-trigger',
            text: '[Trigger] You may trash 1 card from your hand: Play this card. Then, draw 1 card.',
            trigger: { type: 'trigger', optional: true },
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Charlotte Poire'] },
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
              { type: 'draw', player: 'self', amount: 1 },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-093',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'x-drake-don-1',
            text: '[DON!! x1] This Character gains +2 cost.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['X.Drake'] },
              },
              cost: 2,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'giovanni-when-attacking',
            text: "[DON!! x1] [When Attacking] Up to 1 of your opponent's rested Characters with a cost of 1 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 1,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'candy-maiden-main',
            text: "[Main] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Rest up to 1 of your opponent's Characters with a cost of 2 or less. Then, turn all of your Life cards face-down.",
            trigger: { type: 'activateMain', optional: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miyagi-on-play',
            text: '[On Play] Set up to 1 of your [Minks] type Characters with a cost of 2 or less as active.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Minks'],
                    costMax: 2,
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
    {
      cardId: 'OP08-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-opera-on-play',
            text: "[On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost equal to or less than your number of Life cards.",
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
    {
      cardId: 'OP08-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'duval-on-play',
            text: "[On Play] Up to 1 of your Characters gains +1 cost until the end of your opponent's next turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-006',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'chessmarimo',
            text: '[Your Turn] If you have [Kuromarimo] and [Chess] in your trash, this Character gains +2000 power.',
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Kuromarimo'] },
                },
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Chess'] },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Chessmarimo'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'heliceratops-main',
            text: "[Main] If your Leader has the [Animal Kingdom Pirates] type, give up to 1 of your opponent's Characters 2 cost during this turn. Then, K.O. up to 1 of your opponent's Characters with a cost of 0.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
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
            id: 'heliceratops-trigger',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
    {
      cardId: 'OP08-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'twenty-doctors-blocker',
            text: '[Blocker]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Twenty Doctors'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roddy-on-play',
            text: "[On Play] If your Leader has the [Minks] type and your opponent has 7 or more rested cards, K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Minks' },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['cost', 'characters', 'leader', 'stage'],
                  filter: { rested: true },
                },
                value: 7,
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
                    rested: true,
                    costMax: 2,
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
    {
      cardId: 'OP08-107',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nitro-activate-main',
            text: '[Activate: Main] You may rest this Character: Up to 1 of your [Charlotte Pudding] cards gains +2000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Nitro'], rested: false },
                  source: 'effectSource',
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
                  filter: { name: ['Charlotte Pudding'] },
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
    {
      cardId: 'OP08-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'guernica-when-attacking',
            text: '[When Attacking] You may place 3 cards with a type including "CP" from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent\'s Characters with a cost of 0.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['CP'] },
                  count: { kind: 'exact', value: 3 },
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
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
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
    {
      cardId: 'OP08-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuromarimo-on-play',
            text: "[On Play] If you have [Chess], K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Chess'] },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 3000 },
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
    {
      cardId: 'OP08-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chess-on-play',
            text: "[On Play] Give up to 1 of your opponent's Characters 2000 power during this turn. Then, if you don't have [Kuromarimo], play up to 1 [Kuromarimo] from your hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kuromarimo'] },
                },
                value: 0,
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
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Kuromarimo'] },
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
      cardId: 'OP08-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buckin-on-play',
            text: '[Your Turn] [On Play] Up to 1 of your [Edward Weevil] cards gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Edward Weevil'] },
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
    {
      cardId: 'OP08-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hamlet-on-play',
            text: '[On Play] Play up to 1 [SMILE] type Character card with a cost of 2 or less from your trash.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['SMILE'],
                    costMax: 2,
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
      cardId: 'OP08-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zou-activate-main',
            text: '[Activate:Main] You may rest this Stage: If your Leader has the [Minks] type, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Minks' },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  count: { kind: 'exact', value: 1 },
                },
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'zou-end-of-turn',
            text: '[End of Your Turn] Set up to 1 of your [Minks] type Characters as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Minks'],
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
    {
      cardId: 'OP08-020',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'drum-kingdom',
            text: "[Opponent's Turn] All of your [Drum Kingdom] type Characters gain +1000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Drum Kingdom'],
                },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP08-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'moby-dick-on-remove',
            text: '[Your Turn] [Once Per Turn] When your Character with a type including "Whitebeard Piratess" is removed from the field by an effect, draw 1 card. Then, place 1 card from your hand at the top or bottom of your deck.',
            trigger: { type: 'onKo', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                chooseDestinationPosition: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'moby-dick-trigger',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Moby Dick'] },
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
    {
      cardId: 'OP08-084',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'jack-parallel-cost',
            text: 'This Character gains +4 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Jack 084'] },
              },
              cost: 4,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'jack-parallel-main',
            text: "[Activate: Main] You may rest this Character: Draw 1 card and trash 1 card from your hand. Then, K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
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
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
    {
      cardId: 'OP08-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'whos-who-on-play',
            text: "[On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
            id: 'whos-who-trigger',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
    {
      cardId: 'OP08-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'electrical-luna-main',
            text: "[Main] All of your opponent's rested Characters with a cost of 7 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 7,
                  },
                },
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'electrical-luna-trigger',
            text: "[Trigger] Rest up to 1 of your opponent's Characters.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP08-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'the-earth-will-not-lose-counter',
            text: '[Counter] If your Leader has the {Shandian Warrior} type, up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, play up to 1 [Upper Yard] from your hand.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Shandian Warrior',
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
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Upper Yard'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'the-earth-will-not-lose-trigger',
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
  ],
};
