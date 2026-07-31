import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const eb04EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'EB-04',
  cards: [
    // EB04-001 Jewelry Bonney (EB04-001)
    // [Opponent's Turn] If you have 1 or less Life cards, this Leader gains +2000 power. [Activate: Main] [Once Per Turn] Give up to 1 of your opponent's Characters -1000 power during this turn. Then, if you have 2 or more Life cards, you may add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'EB04-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-001-opponent-turn-leader-plus-2000-if-life-le-1',
            text: "[Opponent's Turn] If you have 1 or less Life cards, this Leader gains +2000 power.",
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader'],
                filter: { name: ['Jewelry Bonney'] },
              },
              power: 2000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-001-activate-main-minus-1000-then-life-to-hand',
            text: "[Activate: Main] [Once Per Turn] Give up to 1 of your opponent's Characters -1000 power during this turn. Then, if you have 2 or more Life cards, you may add 1 card from the top of your Life cards to your hand.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // EB04-002 Jewelry Bonney (EB04-002)
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 {Egghead} or {Straw Hat Crew} type card other than [Jewelry Bonney] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB04-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-002-on-play-search-egghead-or-straw-hat',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 {Egghead} or {Straw Hat Crew} type card other than [Jewelry Bonney] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Egghead', 'Straw Hat Crew'],
                  excludeName: ['Jewelry Bonney'],
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
    // EB04-003 Smoker & Tashigi
    // [Rush] (This card can attack on the turn in which it is played.)
    // [Opponent's Turn] Your {Navy} type Leader's base power becomes 7000.
    {
      cardId: 'EB04-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-003-has-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Smoker & Tashigi'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-003-opponent-turn-navy-leader-base-power-7000',
            text: "[Opponent's Turn] Your {Navy} type Leader's base power becomes 7000.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader'],
                filter: { trait: ['Navy'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // EB04-004 Zeff
    // [When Attacking] Your Leader's base power becomes 7000 until the end of your opponent's next End Phase.
    {
      cardId: 'EB04-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-004-when-attacking-leader-base-power-7000',
            text: "[When Attacking] Your Leader's base power becomes 7000 until the end of your opponent's next End Phase.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // EB04-005 Trafalgar Law
    // This Character cannot attack unless your opponent has 2 or more Characters with a base power of 5000 or more.
    {
      cardId: 'EB04-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-005-cannot-attack-unless-opponent-has-2-plus-5000-power',
            text: 'This Character cannot attack unless your opponent has 2 or more Characters with a base power of 5000 or more.',
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMin: 5000 },
                },
                value: 1,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Trafalgar Law'] },
              },
              keywords: ['cannotAttack'],
            },
          },
        },
      ],
    },
    // EB04-006 Moda
    // [On Play] Look at 7 cards from the top of your deck; reveal up to 1 [Lulucia Kingdom] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB04-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-006-on-play-search-lulucia-kingdom',
            text: '[On Play] Look at 7 cards from the top of your deck; reveal up to 1 [Lulucia Kingdom] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 7,
                filter: { name: ['Lulucia Kingdom'] },
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
    // EB04-007 Roronoa Zoro (EB04-007)
    // [On Play] Your Leader gains +2000 power until the end of your opponent's next End Phase.[Activate: Main] [Once Per Turn] If your opponent has a Character with 8000 power or more, this Character gains [Rush: Character] during this turn.
    {
      cardId: 'EB04-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-007-on-play-leader-plus-2000',
            text: "[On Play] Your Leader gains +2000 power until the end of your opponent's next End Phase.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
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
            id: 'eb04-007-activate-main-rush-if-opponent-has-8000-power',
            text: '[Activate: Main] [Once Per Turn] If your opponent has a Character with 8000 power or more, this Character gains [Rush: Character] during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 8000 },
                },
                value: 1,
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Roronoa Zoro'] },
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
    // EB04-008 Distorted Future
    // [Main] If you have 2 or less Life cards, give up to 1 of your opponent's Characters -3000 power during this turn.[Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'EB04-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-008-main-minus-3000-if-life-le-2',
            text: "[Main] If you have 2 or less Life cards, give up to 1 of your opponent's Characters -3000 power during this turn.",
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
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
        {
          kind: 'standard',
          effect: {
            id: 'eb04-008-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB04-009 It's My Student's Farewell. I Want It to Be Proper.
    // [Main] You may give 1 active DON!! card to 1 of your [Silvers Rayleigh]: Give up to 1 of your opponent's Characters -2000 power during this turn.[Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle.
    {
      cardId: 'EB04-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-009-main-attach-don-to-rayleigh-minus-2000',
            text: "[Main] You may give 1 active DON!! card to 1 of your [Silvers Rayleigh]: Give up to 1 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Silvers Rayleigh'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
                rested: false,
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-009-counter-rayleigh-plus-2000',
            text: '[Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Silvers Rayleigh'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB04-010 Lulucia Kingdom
    // [Opponent's Turn] All of your Characters with a base cost of 1 gain +5000 power.[On Play] Set the power of up to 1 of your opponent's Characters to 0 during this turn.
    {
      cardId: 'EB04-010',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-010-opponent-turn-base-cost-1-characters-plus-5000',
            text: "[Opponent's Turn] All of your Characters with a base cost of 1 gain +5000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  baseCostMax: 1,
                  baseCostMin: 1,
                },
              },
              power: 5000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-010-on-play-set-power-to-0',
            text: "[On Play] Set the power of up to 1 of your opponent's Characters to 0 during this turn.",
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
                amount: -30000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB04-011 Scaled Neptunian
    // [Rush: Character] (This card can attack Characters on the turn in which it is played.)
    // [On Play] Draw a card for each of your {Neptunian} type Characters. Then, trash the same number of cards from your hand.
    {
      cardId: 'EB04-011',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-011-has-rush-character',
            text: '[Rush: Character]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Scaled Neptunian'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-011-on-play-draw-per-neptunian-trash-equal',
            text: '[On Play] Draw a card for each of your {Neptunian} type Characters. Then, trash the same number of cards from your hand.',
            trigger: { type: 'onPlay' },
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
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-012 Kikunojo - EB04-012 (Alternate Art)
    // [Activate:Main] [Once Per Turn] If this Character has played on this turn, set your {Land of Wano} type Leader as active.
    {
      cardId: 'EB04-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-012-activate-main-unrest-land-of-wano-leader',
            text: '[Activate:Main] [Once Per Turn] If this Character has played on this turn, set your {Land of Wano} type Leader as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'eventSourceHasNoBaseEffect' }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { trait: ['Land of Wano'], rested: true },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-013 Carrot
    // [On Play] If your Leader has the {Minks} type, set up to 2 of your {Minks} type Characters and your Leader as active.
    {
      cardId: 'EB04-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-013-on-play-unrest-minks-characters-and-leader',
            text: '[On Play] If your Leader has the {Minks} type, set up to 2 of your {Minks} type Characters and your Leader as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Minks' },
            ],
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
                  count: { kind: 'upTo', value: 2 },
                },
              },
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: true },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-014 Kouzuki Sukiyaki
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to your {Land of Wano} type Leader.
    {
      cardId: 'EB04-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-014-activate-main-give-rested-don-to-land-of-wano-leader',
            text: '[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to your {Land of Wano} type Leader.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // EB04-015 Jinbe - EB04-015
    // [Blocker]
    // [On K.O.] You may rest 1 of your cards: If your Leader has the {Fish-Man} or {Merfolk} type, play up to 1 green Character card with a cost of 6 or less from your hand.
    {
      cardId: 'EB04-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-015-on-ko-rest-1-play-green-fish-man',
            text: '[On K.O.] You may rest 1 of your cards: If your Leader has the {Fish-Man} or {Merfolk} type, play up to 1 green Character card with a cost of 6 or less from your hand.',
            trigger: { type: 'onKo', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'leader'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'ifAnyConditionGroupMatches',
                conditionGroups: [
                  [
                    {
                      type: 'playerHasLeaderTrait',
                      player: 'self',
                      value: 'Fish-Man',
                    },
                  ],
                  [
                    {
                      type: 'playerHasLeaderTrait',
                      player: 'self',
                      value: 'Merfolk',
                    },
                  ],
                ],
                actions: [
                  {
                    type: 'play',
                    selector: {
                      player: 'self',
                      zones: ['hand'],
                      filter: {
                        cardCategory: ['Character'],
                        color: ['Green'],
                        costMax: 6,
                      },
                      count: { kind: 'upTo', value: 1 },
                    },
                    destination: 'characters',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // EB04-016 Bird Neptunian
    // [Activate: Main] Set up to 1 of your DON!! cards as active. Then, you cannot set DON!! cards as active using Character effects during this turn.
    // [When Attacking] If you have 3 or more {Neptunian} type Characters, rest up to 1 of your opponent's Characters with a cost of 8 or less.
    {
      cardId: 'EB04-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-016-activate-main-unrest-1-don',
            text: '[Activate: Main] Set up to 1 of your DON!! cards as active. Then, you cannot set DON!! cards as active using Character effects during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'unrest',
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
            id: 'eb04-016-when-attacking-rest-cost-8-or-less-if-3-neptunian',
            text: "[When Attacking] If you have 3 or more {Neptunian} type Characters, rest up to 1 of your opponent's Characters with a cost of 8 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Neptunian'] },
                },
                value: 3,
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 8,
                    rested: false,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-017 Mystoms
    // [Your Turn] If you have 3 or more {Minks} type Characters, give all of your opponent's Characters 1 cost.
    // [On Play] If your Leader has the {Minks} type, play up to 1 {Minks} type Character card with a cost of 5 or less from your hand.
    {
      cardId: 'EB04-017',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-017-your-turn-opponent-characters-cost-1',
            text: "[Your Turn] If you have 3 or more {Minks} type Characters, give all of your opponent's Characters 1 cost.",
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Minks'] },
                },
                value: 3,
              },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              cost: -10,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-017-on-play-play-minks-cost-5-or-less',
            text: '[On Play] If your Leader has the {Minks} type, play up to 1 {Minks} type Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Minks' },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Minks'],
                    costMax: 5,
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
    // EB04-018 Megalo
    // [On Play] You may rest this Character: K.O. up to 1 of your opponent's rested Characters with 8000 power or less.
    {
      cardId: 'EB04-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-018-on-play-rest-self-ko-rested-8000-or-less',
            text: "[On Play] You may rest this Character: K.O. up to 1 of your opponent's rested Characters with 8000 power or less.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Megalo'], rested: false },
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
                    rested: true,
                    powerMax: 8000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // EB04-019 Eleclaw
    // [Main] You may rest 1 of your cards: If your Leader has the {Minks} type, give up to 1 of your opponent's Characters -3 cost during this turn.
    // [Counter] Up to 1 of your {Minks} type Leader or Character cards gains +3000 power during this battle.
    {
      cardId: 'EB04-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-019-main-rest-1-minus-3-cost-if-minks-leader',
            text: "[Main] You may rest 1 of your cards: If your Leader has the {Minks} type, give up to 1 of your opponent's Characters -3 cost during this turn.",
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Minks' },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'leader'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
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
                amount: -3,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-019-counter-minks-plus-3000',
            text: '[Counter] Up to 1 of your {Minks} type Leader or Character cards gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Minks'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB04-020 Shark Brick Fist
    // [Counter] Up to 1 of your {Fish-Man} type Leader or Character cards gains +3000 power during this battle. Then, set up to 1 of your {Fish-Man} type Characters as active.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'EB04-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-020-counter-fish-man-plus-3000-then-unrest',
            text: '[Counter] Up to 1 of your {Fish-Man} type Leader or Character cards gains +3000 power during this battle. Then, set up to 1 of your {Fish-Man} type Characters as active.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Fish-Man'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Fish-Man'],
                    rested: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-020-trigger-rest-cost-4-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    rested: false,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-021 Igaram
    // [On Play] If your Leader is [Nefeltari Vivi], draw 2 cards and trash 1 card from your hand.
    // [Activate: Main] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'EB04-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-021-on-play-draw-2-trash-1-if-vivi-leader',
            text: '[On Play] If your Leader is [Nefeltari Vivi], draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nefeltari Vivi',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'self',
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
            id: 'eb04-021-activate-main-trash-1-give-rested-don',
            text: '[Activate: Main] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
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
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // EB04-022 Issho - EB04-022
    // [On Play] You may trash 2 cards from your hand: If your opponent has 6 or more cards in their hand, your opponent places 2 cards from their hand at the bottom of their deck in any order.
    // [DON!! x1] [When Attacking] You may trash 1 card from your hand: Give up to 1 of your opponent's Characters 2000 power during this turn.
    {
      cardId: 'EB04-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-022-on-play-trash-2-opponent-bottom-2-if-6-hand',
            text: '[On Play] You may trash 2 cards from your hand: If your opponent has 6 or more cards in their hand, your opponent places 2 cards from their hand at the bottom of their deck in any order.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['hand'] },
                value: 6,
              },
            ],
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
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
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
            id: 'eb04-022-when-attacking-trash-1-opponent-character-plus-2000',
            text: "[DON!! x1] [When Attacking] You may trash 1 card from your hand: Give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // EB04-023 Chaka & Pell - EB04-023
    // [Double Attack] (This card deals 2 damage.)
    // [On Play] You may give your active Leader -5000 power during this turn: Draw 2 cards.
    {
      cardId: 'EB04-023',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-023-has-double-attack',
            text: '[Double Attack]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Chaka & Pell'] },
              },
              keywords: ['doubleAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-023-on-play-leader-minus-5000-draw-2',
            text: '[On Play] You may give your active Leader -5000 power during this turn: Draw 2 cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
                amount: -5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB04-024 Terracotta
    // [Activate: Main] You may rest this Character and trash 1 card from your hand: Up to 1 of your {Alabasta} type Characters gains [Unblockable] during this turn.(This card cannot be blocked.)
    {
      cardId: 'EB04-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-024-activate-main-rest-trash-1-alabasta-unblockable',
            text: '[Activate: Main] You may rest this Character and trash 1 card from your hand: Up to 1 of your {Alabasta} type Characters gains [Unblockable] during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Terracotta'], rested: false },
                  count: { kind: 'exact', value: 1 },
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
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Alabasta'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB04-025 Nefeltari Vivi
    // [On Play] Play up to 1 {Alabasta} type Character card with a cost of 8 or less other than [Nefeltari Vivi] from your hand. Then, your opponent places 1 card from your hand at the bottom of their deck.
    {
      cardId: 'EB04-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-025-on-play-alabasta-then-opponent-bottoms-your-hand-card',
            text: '[On Play] Play up to 1 {Alabasta} type Character card with a cost of 8 or less other than [Nefeltari Vivi] from your hand. Then, your opponent places 1 card from your hand at the bottom of their deck.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Alabasta'],
                    costMax: 8,
                    excludeName: ['Nefeltari Vivi'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
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
    // EB04-026 Bluegrass
    // [On Play] Place up to 1 of your opponent's Characters with a cost of 1 or less at the bottom of the owner's deck.
    // [When Attacking] Draw 1 card and trash 1 card from your hand.
    {
      cardId: 'EB04-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-026-on-play-bottom-deck-cost-1-or-less',
            text: "[On Play] Place up to 1 of your opponent's Characters with a cost of 1 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'eb04-026-when-attacking-draw-1-trash-1',
            text: '[When Attacking] Draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'whenAttacking' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-027 Boa Hancock - EB04-027
    // [On Play] Draw 2 cards and trash 1 card from your hand.
    // [Trigger] Play up to 1 Character card with 5000 power or less and a [Trigger] from your hand.
    {
      cardId: 'EB04-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-027-on-play-draw-2-trash-1',
            text: '[On Play] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'self',
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
            id: 'eb04-027-trigger-play-character-5000-or-less-with-trigger',
            text: '[Trigger] Play up to 1 Character card with 5000 power or less and a [Trigger] from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 5000,
                    hasTrigger: true,
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
    // EB04-028 Ice Time
    // [Main] You may trash 1 card from your hand: If your Leader has the {Navy} type, up to 2 of your opponent's Characters with 10000 power or less cannot attack until the end of your opponent's next End Phase.
    {
      cardId: 'EB04-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-028-main-trash-1-navy-char-cannot-attack',
            text: "[Main] You may trash 1 card from your hand: If your Leader has the {Navy} type, up to 2 of your opponent's Characters with 10000 power or less cannot attack until the end of your opponent's next End Phase.",
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
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
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 10000 },
                  count: { kind: 'upTo', value: 2 },
                },
                keywords: ['cannotAttack'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB04-029 I Heard the Sound...of a Lady's Teardrops Falling
    // [Main] If your Leader is [Sanji], look at 3 cards from the top of your deck; reveal up to 1 [Sanji] or Event card and add it to your hand. Then, trash the rest.
    // [Counter] You may trash 1 card from your hand: Up to 1 of your [Sanji] cards gains +4000 power during this battle.
    {
      cardId: 'EB04-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-029-main-search-sanji-or-event',
            text: '[Main] If your Leader is [Sanji], look at 3 cards from the top of your deck; reveal up to 1 [Sanji] or Event card and add it to your hand. Then, trash the rest.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  name: ['Sanji'],
                  cardCategory: ['Event'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-029-counter-trash-1-sanji-plus-4000',
            text: '[Counter] You may trash 1 card from your hand: Up to 1 of your [Sanji] cards gains +4000 power during this battle.',
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
                  filter: { name: ['Sanji'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB04-030 Kaido
    // If this Character would be K.O.'d, you may return 1 DON!! card from your field to your DON!! deck instead. [On Play] DON!! -2: If your Leader has the {Animal Kingdom Pirates} type, this Character gains Rush during this turn. Then, rest up to 1 of your opponent's Characters with a cost of 7 or less.
    {
      cardId: 'EB04-030',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'eb04-030-replacement-ko-return-1-don-instead',
            text: "If this Character would be K.O.'d, you may return 1 DON!! card from your field to your DON!! deck instead.",
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              { type: 'eventTargetMatchesFilter', filter: { name: ['Kaido'] } },
            ],
            replacement: [{ type: 'removeDon', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-030-on-play-don-minus-2-rush-then-rest',
            text: "[On Play] DON!! -2: If your Leader has the {Animal Kingdom Pirates} type, this Character gains Rush during this turn. Then, rest up to 1 of your opponent's Characters with a cost of 7 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kaido'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 7,
                    rested: false,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-031 King (Alternate Art)
    // If this Character would be K.O.'d, you may return 1 DON!! card from your field to your DON!! deck instead.
    // [Activate: Main] [Once Per Turn] If your Leader has the {Animal Kingdom Pirates} type and you have no other [King] Characters, add up to 1 DON!! card from your, DON!! deck and set it as active, and add up to 1 additional DON!! card and rest it.
    {
      cardId: 'EB04-031',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'eb04-031-replacement-ko-return-1-don-instead',
            text: "If this Character would be K.O.'d, you may return 1 DON!! card from your field to your DON!! deck instead.",
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              { type: 'eventTargetMatchesFilter', filter: { name: ['King'] } },
            ],
            replacement: [{ type: 'removeDon', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-031-activate-main-add-active-and-rested-don',
            text: '[Activate: Main] [Once Per Turn] If your Leader has the {Animal Kingdom Pirates} type and you have no other [King] Characters, add up to 1 DON!! card from your, DON!! deck and set it as active, and add up to 1 additional DON!! card and rest it.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['King'] },
                },
                value: 1,
              },
            ],
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
          },
        },
      ],
    },
    // EB04-032 Queen
    // [On Play] You may trash 1 {Animal Kingdom Pirates} type card from your hand: Draw 2 cards. [Activate: Main] [Once Per Turn] You may rest 2 of your DON!! cards: If your Leader has the {Animal Kingdom Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'EB04-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-032-on-play-trash-animal-kingdom-draw-2',
            text: '[On Play] You may trash 1 {Animal Kingdom Pirates} type card from your hand: Draw 2 cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Animal Kingdom Pirates'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-032-activate-main-rest-2-don-add-1-rested',
            text: '[Activate: Main] [Once Per Turn] You may rest 2 of your DON!! cards: If your Leader has the {Animal Kingdom Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
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
    // EB04-033 Groggy Monsters
    // [On Play] DON!! 1: If you have 3 or more {Foxy Pirates} type Characters, K.O. up to 1 of your opponent's Characters with 6000 base power or less.
    {
      cardId: 'EB04-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-033-on-play-don-1-ko-6000-base-if-3-foxy',
            text: "[On Play] DON!! 1: If you have 3 or more {Foxy Pirates} type Characters, K.O. up to 1 of your opponent's Characters with 6000 base power or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Foxy Pirates'],
                  },
                },
                value: 3,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMax: 6000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // EB04-034 Charlotte Pudding
    // [Blocker]
    // [On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: If you have 4 or more Events in your trash, up to 1 of your Leader or Character cards gains +2000 power during this battle.
    {
      cardId: 'EB04-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-034-on-opponent-attack-trash-1-events-4-plus-2000',
            text: "[On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: If you have 4 or more Events in your trash, up to 1 of your Leader or Character cards gains +2000 power during this battle.",
            trigger: { type: 'onAttacked', oncePerTurn: true, optional: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { cardCategory: ['Event'] },
                },
                value: 4,
              },
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
      ],
    },
    // EB04-035 Hitokiri Kamazo
    // [Blocker]
    // [Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, if your Leader has the {Kid Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'EB04-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-035-on-don-returned-add-rested-don',
            text: '[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, if your Leader has the {Kid Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kid Pirates',
              },
            ],
            actions: [
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
    // EB04-036 Foxy
    // [On Play] DON!! -1: If your Leader has the {Foxy Pirates} type, draw 2 cards and trash 1 card from your hand. Then, rest up to 1 of your opponent's Characters with a cost of 9 or less.
    // [Activate: Main] [Once Per Turn] Add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'EB04-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-036-on-play-don-minus-1-draw-2-trash-1-rest-cost-9',
            text: "[On Play] DON!! -1: If your Leader has the {Foxy Pirates} type, draw 2 cards and trash 1 card from your hand. Then, rest up to 1 of your opponent's Characters with a cost of 9 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Foxy Pirates',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 9,
                    rested: false,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-036-activate-main-add-rested-don',
            text: '[Activate: Main] [Once Per Turn] Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
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
    // EB04-037 Porche
    // [On Play] If your Leader has the {Foxy Pirates} type, look at 5 cards from the top of your deck; reveal up to 1 {Foxy Pirates} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB04-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-037-on-play-search-foxy-pirates',
            text: '[On Play] If your Leader has the {Foxy Pirates} type, look at 5 cards from the top of your deck; reveal up to 1 {Foxy Pirates} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Foxy Pirates',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Foxy Pirates'] },
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
    // EB04-038 Rosinante & Law (Alternate Art)
    // Under the rules of this game, also treat this card's name as [Trafalgar Law] and [Donquixote Rosinante].
    // [Blocker]
    // [On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card. Then, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'EB04-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-038-on-play-draw-1-and-add-active-don-if-don-le',
            text: "[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card. Then, add up to 1 DON!! card from your DON!! deck and set it as active.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 0,
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
    // EB04-039 Eustass"Captain"Kid - EB04-039
    // [On Play] Add up to 1 DON!! card from your DON!! deck and set it as active.
    // [Activate: Main] You may trash this Character: Play up to 1 {Kid Pirates} type Character card with a cost of 5 or less from your hand.
    {
      cardId: 'EB04-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-039-on-play-add-active-don',
            text: '[On Play] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'eb04-039-activate-main-trash-self-play-kid-pirates',
            text: '[Activate: Main] You may trash this Character: Play up to 1 {Kid Pirates} type Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Eustass"Captain"Kid'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
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
                    trait: ['Kid Pirates'],
                    costMax: 5,
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
    // EB04-040 Flame Dragon Torch
    // [Main] You may rest 6 of your DON!! cards: Up to 1 of your [Kaido] cards gains +3000 power during this turn. Then, rest up to 1 of your opponent's Characters.
    // [Counter] DON!! 1: Your Leader gains +4000 power during this battle.
    {
      cardId: 'EB04-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-040-main-rest-6-don-kaido-plus-3000-rest-opp-char',
            text: "[Main] You may rest 6 of your DON!! cards: Up to 1 of your [Kaido] cards gains +3000 power during this turn. Then, rest up to 1 of your opponent's Characters.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 6 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Kaido'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: false },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-040-counter-don-1-leader-plus-4000',
            text: '[Counter] DON!! 1: Your Leader gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB04-041 Stealth Black
    // [Main] If your Leader is [Sanji] and you have 4 or more DON!! cards on your field, play up to 1 [Sanji] with 6000 power or less from your hand or trash.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'EB04-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-041-main-play-sanji-from-hand-or-trash',
            text: '[Main] If your Leader is [Sanji] and you have 4 or more DON!! cards on your field, play up to 1 [Sanji] with 6000 power or less from your hand or trash.',
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Sanji' },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 4 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: { name: ['Sanji'], powerMax: 6000 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-041-trigger-draw-2-trash-1',
            text: '[Trigger] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-042 Alpha
    // [On Play] You may trash 3 cards from the top of your deck: Give up to 1 of your opponent's Characters +1 cost during this turn.
    {
      cardId: 'EB04-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-042-on-play-trash-3-deck-opp-char-plus-1-cost',
            text: "[On Play] You may trash 3 cards from the top of your deck: Give up to 1 of your opponent's Characters +1 cost during this turn.",
            trigger: { type: 'onPlay', optional: true },
            costs: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
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
    // EB04-043 Kaku
    // [Once Per Turn] If your black Character with a base cost of 5 or less would be K.O.'d by your opponent's effect, you may place 3 cards from your trash at the bottom of your deck in any order instead.
    // [On Play] Trash 2 cards from the top of your deck.
    {
      cardId: 'EB04-043',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'eb04-043-replacement-black-char-protection-ko',
            text: "[Once Per Turn] If your black Character with a base cost of 5 or less would be K.O.'d by your opponent's effect, you may place 3 cards from your trash at the bottom of your deck in any order instead.",
            event: 'wouldKoCharacter',
            oncePerTurn: true,
            optional: true,
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'eventTargetMatchesFilter',
                filter: {
                  cardCategory: ['Character'],
                  color: ['Black'],
                  baseCostMax: 5,
                },
              },
            ],
            replacement: [
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
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-043-on-play-trash-2-from-deck',
            text: '[On Play] Trash 2 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB04-044 Koby (EB04-044)
    // [Once Per Turn] If your Leader has the "Navy" type and this Character would be removed from the field, you can discard 1 card from your hand instead.
    // [Your Turn] [Once Per Turn] When one of your opponent's Characters is KO'd, draw 1 card.
    {
      cardId: 'EB04-044',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'eb04-044-replacement-prevent-removal-discard-hand',
            text: '[Once Per Turn] If your Leader has the "Navy" type and this Character would be removed from the field, you can discard 1 card from your hand instead.',
            event: 'wouldMoveCard',
            oncePerTurn: true,
            optional: true,
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
              {
                type: 'eventTargetMatchesFilter',
                filter: { name: ['Koby'] },
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
        {
          kind: 'standard',
          effect: {
            id: 'eb04-044-your-turn-on-opponent-ko-draw-1',
            text: "[Your Turn] [Once Per Turn] When one of your opponent's Characters is KO'd, draw 1 card.",
            trigger: { type: 'onKo', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'opponent' },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB04-045 Ginny
    // [Activate: Main] You may rest this Character: If there are 2 or more Characters with a cost of 8 or more, up to 1 of your {Revolutionary Army} type Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'EB04-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-045-activate-main-rest-self-revolutionary-plus-1000',
            text: '[Activate: Main] You may rest this Character: If there are 2 or more Characters with a cost of 8 or more, up to 1 of your {Revolutionary Army} type Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
                value: 2,
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Ginny'], rested: false },
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
                  filter: { trait: ['Revolutionary Army'] },
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
    // EB04-046 Doll
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Opponent's Turn] All of your {Navy} type Characters gain +2 cost.
    {
      cardId: 'EB04-046',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-046-opponent-turn-navy-characters-plus-2-cost',
            text: "[Opponent's Turn] All of your {Navy} type Characters gain +2 cost.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { cardCategory: ['Character'], trait: ['Navy'] },
              },
              cost: 2,
            },
          },
        },
      ],
    },
    // EB04-047 Helmeppo
    // [Activate: Main] You may trash this Character: Play up to 1 {SWORD} type Character card with a cost of 3 or less other than [Helmeppo] from your hand or trash.
    {
      cardId: 'EB04-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-047-activate-main-trash-self-play-sword',
            text: '[Activate: Main] You may trash this Character: Play up to 1 {SWORD} type Character card with a cost of 3 or less other than [Helmeppo] from your hand or trash.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Helmeppo'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['SWORD'],
                    costMax: 3,
                    excludeName: ['Helmeppo'],
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
    // EB04-048 Rob Lucci
    // If your Leader's type includes "CP", this Character gains +1000 power and -2 cost for every 5 cards in your trash.
    // [On Play] You may trash 1 of your Characters: Draw 1 card.
    {
      cardId: 'EB04-048',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-048-continuous-power-per-trash',
            text: 'If your Leader\'s type includes "CP", this Character gains +1000 power for every 5 cards in your trash.',
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'CP' },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Rob Lucci'] },
              },
              powerPerCount: {
                selector: { player: 'self', zones: ['trash'] },
                amount: 1000,
                divisor: 5,
              },
              cost: -10,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-048-on-play-trash-1-character-draw-1',
            text: '[On Play] You may trash 1 of your Characters: Draw 1 card.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB04-049 Finger Pistol Yellow Lotus
    // [Main] You may trash 2 cards from the top of your deck: K.O. up to 1 of your opponent's Characters with a base cost of 5 or less.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB04-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-049-main-trash-2-ko-base-cost-5-or-less',
            text: "[Main] You may trash 2 cards from the top of your deck: K.O. up to 1 of your opponent's Characters with a base cost of 5 or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [{ type: 'trashFromDeck', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-049-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB04-049',
                effectId: 'eb04-049-main-trash-2-ko-base-cost-5-or-less',
              },
            ],
          },
        },
      ],
    },
    // EB04-050 I'll Whip You Into Shape.
    // [Main] Up to 1 of your {SWORD} type Leader or Character cards can also attack active Characters during this turn.[Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'EB04-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-050-main-sword-can-attack-active-characters',
            text: '[Main] Up to 1 of your {SWORD} type Leader or Character cards can also attack active Characters during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['SWORD'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-050-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB04-051 Emet
    // This Character cannot attack unless there is a Character with 12000 base power or more.
    // [Trigger] Give all of your opponent's Characters -3000 power during this turn. Then, if you have 0 Life cards, play this card.
    {
      cardId: 'EB04-051',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-051-cannot-attack-unless-12000-base-power-exists',
            text: 'This Character cannot attack unless there is a Character with 12000 base power or more.',
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMin: 12000 },
                },
                value: 0,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Emet'] },
              },
              keywords: ['cannotAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-051-trigger-minus-3000-all-then-play-if-0-life',
            text: "[Trigger] Give all of your opponent's Characters -3000 power during this turn. Then, if you have 0 Life cards, play this card.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  { type: 'playerHasLifeAtMost', player: 'self', value: 0 },
                ],
                actions: [
                  {
                    type: 'play',
                    selector: {
                      player: 'self',
                      zones: ['trash'],
                      filter: { name: ['Emet'] },
                      count: { kind: 'exact', value: 1 },
                    },
                    destination: 'characters',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // EB04-052 Sanji (EB04-052) (Alternate Art)
    // [When Attacking] This Character's base power becomes the same as your opponent's Leader during this turn.[On K.O.] If you have 2 or less Life cards, play up to 1 yellow Character card with 6000 power or less from your hand.
    {
      cardId: 'EB04-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-052-when-attacking-copy-leader-power',
            text: "[When Attacking] This Character's base power becomes the same as your opponent's Leader during this turn.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Sanji'] },
                  count: { kind: 'exact', value: 1 },
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
            id: 'eb04-052-on-ko-play-yellow-6000-or-less',
            text: '[On K.O.] If you have 2 or less Life cards, play up to 1 yellow Character card with 6000 power or less from your hand.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Yellow'],
                    powerMax: 6000,
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
    // EB04-053 Sentomaru
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Block] If you have 2 or less Life cards, draw 1 card.
    {
      cardId: 'EB04-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-053-on-block-draw-1-if-life-le-2',
            text: '[On Block] If you have 2 or less Life cards, draw 1 card.',
            trigger: { type: 'onBlock' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB04-054 Bartholomew Kuma (EB04-054)
    // [On Play] If you have 2 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.
    // [On K.O.] Add up to 1 card from the top of your opponent's Life cards to the owner's hand.
    {
      cardId: 'EB04-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-054-on-play-deck-to-life-if-life-le-2',
            text: '[On Play] If you have 2 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-054-on-ko-opponent-life-to-hand',
            text: "[On K.O.] Add up to 1 card from the top of your opponent's Life cards to the owner's hand.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
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
    // EB04-055 Bartholomew Kuma (EB04-055)
    // [On K.O.] Play up to 1 {Revolutionary Army} type Character card with a cost of 4 or less from your hand.
    // [Trigger] If your Leader has the {Revolutionary Army} type and you and your opponent have a total of 5 or less Life cards, play this card.
    {
      cardId: 'EB04-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-055-on-ko-play-revolutionary-army',
            text: '[On K.O.] Play up to 1 {Revolutionary Army} type Character card with a cost of 4 or less from your hand.',
            trigger: { type: 'onKo' },
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
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-055-trigger-play-if-revolutionary-total-life-5-or-less',
            text: '[Trigger] If your Leader has the {Revolutionary Army} type and you and your opponent have a total of 5 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
              { type: 'playersHaveTotalLifeAtMost', value: 5 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Bartholomew Kuma'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB04-056 Pacifista
    // If you have [Jewelry Bonney] and you have 0 Life cards, this Character gains [Blocker].
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'EB04-056',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-056-conditional-blocker',
            text: 'If you have [Jewelry Bonney] and you have 0 Life cards, this Character gains [Blocker].',
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 0 },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters', 'leader'],
                  filter: { name: ['Jewelry Bonney'] },
                },
                value: 1,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Pacifista'] },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // EB04-057 Vegapunk
    // If you have 2 or less Life cards, all of your yellow {Scientist} type Characters cannot be removed from the field by your opponent's effects.
    // [DON!! x1] This Character gains [Blocker].
    {
      cardId: 'EB04-057',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-057-life-le-2-scientist-cannot-be-removed',
            text: "If you have 2 or less Life cards, all of your yellow {Scientist} type Characters cannot be removed from the field by your opponent's effects.",
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  color: ['Yellow'],
                  trait: ['Scientist'],
                },
              },
              keywords: ['cannotBeRemovedByOpponentEffects'],
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-057-don-x1-gains-blocker',
            text: '[DON!! x1] This Character gains [Blocker].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Vegapunk'] },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // EB04-058 Borsalino
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If you have 2 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'EB04-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-058-on-play-deck-to-life-if-life-le-2',
            text: '[On Play] If you have 2 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
      ],
    },
    // EB04-059 Black Rope Dragon Twiste
    // [Main] You may turn 1 card from the top of your Life cards face-up: If you have less Characters than your opponent, K.O. up to 1 of your opponent's Characters with a cost of 6 or less and up to 1 of your opponent's Characters with a cost of 5 or less. [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'EB04-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-059-main-reveal-life-ko-cost-6-and-cost-5',
            text: "[Main] You may turn 1 card from the top of your Life cards face-up: If you have less Characters than your opponent, K.O. up to 1 of your opponent's Characters with a cost of 6 or less and up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'life',
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-059-trigger-draw-2-trash-1',
            text: '[Trigger] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-060 Gum-Gum Hawk Gatling
    // [Main] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 {Egghead} type Character card from your hand to the top of your Life cards face-up. Then, give up to 1 of your opponent's Characters -1000 power during this turn.[Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'EB04-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eb04-060-main-life-to-hand-egghead-to-life-minus-1000',
            text: "[Main] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 {Egghead} type Character card from your hand to the top of your Life cards face-up. Then, give up to 1 of your opponent's Characters -1000 power during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Egghead'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-060-trigger-draw-2-trash-1',
            text: '[Trigger] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB04-061 Monkey.D.Luffy (EB04-061)
    // If you have 1 or less Life cards, give this card in your hand -1 cost.
    // [On Play] You may trash 1 card from your hand: Your Leader gains +2000 power until the end of your opponent's next End Phase. Then, this Character gains [Blocker] until the end of your opponent's next End Phase.
    {
      cardId: 'EB04-061',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eb04-061-hand-cost-minus-1-if-life-le-1',
            text: 'If you have 1 or less Life cards, give this card in your hand -1 cost.',
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['hand'],
                filter: { name: ['Monkey.D.Luffy'] },
              },
              cost: -1,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eb04-061-on-play-leader-plus-2000-and-blocker',
            text: "[On Play] You may trash 1 card from your hand: Your Leader gains +2000 power until the end of your opponent's next End Phase. Then, this Character gains [Blocker] until the end of your opponent's next End Phase.",
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
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['cannotBeKoedInBattle'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
  ],
};
