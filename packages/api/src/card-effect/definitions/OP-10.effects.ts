import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op10EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-10',
  cards: [
    // OP10-001 Smoker (001)
    // [Opponent's Turn] All of your {Navy} or {Punk Hazard} type Characters gain +1000 power.[Activate: Main] [Once Per Turn] If you have a Character with 7000 power or more, set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP10-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'smoker-001-opponent-turn-navy-punk-hazard-plus-1000',
            text: "[Opponent's Turn] All of your {Navy} or {Punk Hazard} type Characters gain +1000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { trait: ['Navy', 'Punk Hazard'] },
              },
              power: 1000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'smoker-001-activate-main-unrest-2-don',
            text: '[Activate: Main] [Once Per Turn] If you have a Character with 7000 power or more, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { powerMin: 7000 },
                },
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-002 Caesar Clown (002) (Parallel)
    // [DON!! x2] [When Attacking] You may return 1 of your {Punk Hazard} type Characters with a cost of 2 or more to the owner's hand: K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'OP10-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'caesar-clown-002-when-attacking-bounce-punk-hazard-ko-4000',
            text: "[DON!! x2] [When Attacking] You may return 1 of your {Punk Hazard} type Characters with a cost of 2 or more to the owner's hand: K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Punk Hazard'], costMin: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { powerMax: 4000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP10-003 Sugar (003) (Parallel)
    // [End of Your Turn] If you have a {Donquixote Pirates} type Character with 6000 power or more, set up to 1 of your DON!! cards as active.[Opponent's Turn] [Once Per Turn] When you activate an Event, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP10-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sugar-003-end-of-turn-unrest-1-don',
            text: '[End of Your Turn] If you have a {Donquixote Pirates} type Character with 6000 power or more, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Donquixote Pirates'], powerMin: 6000 },
                },
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
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
            id: 'sugar-003-opponent-turn-event-add-don',
            text: "[Opponent's Turn] [Once Per Turn] When you activate an Event, add up to 1 DON!! card from your DON!! deck and set it as active.",
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: false }],
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
    // OP10-004 Vergo
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Punk Hazard} type card other than [Vergo] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vergo-on-play-search-punk-hazard',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Punk Hazard} type card other than [Vergo] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Punk Hazard'],
                  excludeName: ['Vergo'],
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
    // OP10-005 Sanji
    // [Your Turn] This Character gains +3000 power.
    // [On K.O.] Draw 1 card.
    {
      cardId: 'OP10-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sanji-005-your-turn-plus-3000',
            text: '[Your Turn] This Character gains +3000 power.',
            conditions: [{ type: 'controllerTurn', value: true }],
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
            id: 'sanji-005-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP10-006 Caesar Clown (006)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Smiley] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Smiley] from your hand.
    {
      cardId: 'OP10-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'caesar-clown-006-on-play-search-smiley',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Smiley] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Smiley] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { name: ['Smiley'] },
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
                  filter: { name: ['Smiley'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP10-007 Ceaser Soldier
    // [On Play] Play up to 1 "Punk Hazard" type Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP10-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ceaser-soldier-on-play-punk-hazard-cost-2-or-less',
            text: '[On Play] Play up to 1 "Punk Hazard" type Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Punk Hazard'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP10-008 Scotch
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If you don't have [Rock], play up to 1 [Rock] from your hand.
    {
      cardId: 'OP10-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'scotch-on-play-play-rock',
            text: "[On Play] If you don't have [Rock], play up to 1 [Rock] from your hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Rock'] },
                },
                value: 0,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Rock'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP10-009 Smiley
    // [On Play] If your Leader has the "Punk Hazard" type, give up to 1 of your opponent's Characters 3000 power during this turn.
    {
      cardId: 'OP10-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'smiley-on-play-minus-3000-opponent-char',
            text: '[On Play] If your Leader has the "Punk Hazard" type, give up to 1 of your opponent\'s Characters 3000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Punk Hazard',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
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
    // OP10-010 Chadros.Higelyges (Brownbeard)
    // [When Attacking] If you have 1 or less Characters with 6000 power or more, this Character gains +1000 power during this turn.
    {
      cardId: 'OP10-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chadros-higelyges-when-attacking-plus-1000',
            text: '[When Attacking] If you have 1 or less Characters with 6000 power or more, this Character gains +1000 power during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { powerMin: 6000 },
                },
                value: 1,
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
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-011 Tony Tony.Chopper (011)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Opponent's Turn] This Character gains +2000 power.
    {
      cardId: 'OP10-011',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'tony-tony-chopper-011-opponent-turn-plus-2000',
            text: "[Opponent's Turn] This Character gains +2000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // OP10-012 Dragon Number Thirteen
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP10-012',
      effects: [],
    },
    // OP10-013 Nami (013)
    {
      cardId: 'OP10-013',
      effects: [],
    },
    // OP10-014 Franky (014)
    {
      cardId: 'OP10-014',
      effects: [],
    },
    // OP10-015 Mocha
    // [On Play] Give up to 1 of your opponent's Characters 1000 power during this turn.
    {
      cardId: 'OP10-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mocha-on-play-minus-1000-opponent-char',
            text: "[On Play] Give up to 1 of your opponent's Characters 1000 power during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-016 Monet
    // [Activate: Main] You may rest this Character: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters. Then, give up to 1 of your opponent's Characters 1000 power during this turn.
    {
      cardId: 'OP10-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monet-activate-main-attach-rested-don-minus-1000',
            text: "[Activate: Main] You may rest this Character: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters. Then, give up to 1 of your opponent's Characters 1000 power during this turn.",
            trigger: { type: 'activateMain' },
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
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
                amount: 2,
                rested: true,
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-017 Rock
    // [On Play] If you don't have [Scotch], play up to 1 [Scotch] from your hand.
    {
      cardId: 'OP10-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rock-on-play-play-scotch',
            text: "[On Play] If you don't have [Scotch], play up to 1 [Scotch] from your hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Scotch'] },
                },
                value: 0,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Scotch'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP10-018 Ten-Layer Igloo
    // [Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, give up to 1 of your opponent's Leader or Character cards 2000 power during this turn.
    // [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP10-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ten-layer-igloo-counter-plus-3000-self-minus-2000-opponent',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, give up to 1 of your opponent's Leader or Character cards 2000 power during this turn.",
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
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
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
            id: 'ten-layer-igloo-trigger-plus-1000-self',
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
    // OP10-019 Divine Departure
    // [Main] You may rest 5 of your DON!! cards: K.O. up to 1 of your opponent's Characters with 8000 power or less.
    // [Counter] Up to 1 of your Leader gains +3000 power during this battle.
    {
      cardId: 'OP10-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'divine-departure-main-ko-8000-or-less',
            text: "[Main] You may rest 5 of your DON!! cards: K.O. up to 1 of your opponent's Characters with 8000 power or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 5 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { powerMax: 8000 },
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
            id: 'divine-departure-counter-plus-3000-leader',
            text: '[Counter] Up to 1 of your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP10-020 Gum-Gum UFO
    // [Main] Give up to 1 of your opponent's Characters 4000 power during this turn. Then, if you have 2 or less Life cards, up to 1 of your Leader or Character cards gains +1000 power during this turn.
    // [Trigger] K.O. up to 1 of your opponent's Characters with 3000 power or less.
    {
      cardId: 'OP10-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-ufo-main-minus-4000',
            text: "[Main] Give up to 1 of your opponent's Characters 4000 power during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -4000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-ufo-main-plus-1000-if-life-2-or-less',
            text: 'Then, if you have 2 or less Life cards, up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
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
            id: 'gum-gum-ufo-trigger-ko-3000-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { powerMax: 3000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP10-021 Punk Hazard
    // [Activate: Main] You may rest this Stage: If your Leader is [Caesar Clown], give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP10-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'punk-hazard-activate-main-attach-rested-don',
            text: '[Activate: Main] You may rest this Stage: If your Leader is [Caesar Clown], give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Caesar Clown',
              },
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
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP10-022 Trafalgar Law (022)
    // [DON!! x1] [Activate: Main] [Once Per Turn] If the total cost of your Characters is 5 or more, you may return 1 of your Characters to the owner's hand: Reveal 1 card from the top of your Life cards. If that card is a "Supernovas" type Character card with a cost of 5 or less, you may play that card.
    {
      cardId: 'OP10-022',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-022-special',
        },
      ],
    },
    // OP10-023 Issho
    // [On Play] If your Leader has the "Navy" type, rest up to 2 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP10-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'issho-on-play-rest-opponent-cost-5-or-less',
            text: '[On Play] If your Leader has the "Navy" type, rest up to 2 of your opponent\'s Characters with a cost of 5 or less.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Navy',
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5 },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-024 Edward.Newgate
    // [On Play] If you have 2 or more rested Characters, rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.
    {
      cardId: 'OP10-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-newgate-on-play-rest-ko',
            text: "[On Play] If you have 2 or more rested Characters, rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { rested: true },
                },
                value: 2,
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 3, rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP10-025 Enel
    // [On Play] If you have 2 or more rested Characters, draw 3 cards and trash 2 cards from your hand.
    {
      cardId: 'OP10-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'enel-on-play-draw-3-trash-2',
            text: '[On Play] If you have 2 or more rested Characters, draw 3 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { rested: true },
                },
                value: 2,
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
    // OP10-026 Kin'emon (026)
    // [Activate: Main] You may place this Character and 1 [Kin'emon] with 0 power from your trash at the bottom of your deck in any order: Play up to 1 [Kin'emon] with a cost of 6 from your hand.
    {
      cardId: 'OP10-026',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-026-special',
        },
      ],
    },
    // OP10-027 Kin'emon (027)
    // [Activate: Main] You may place this Character and 1 [Kin'emon] with 1000 power from your trash at the bottom of your deck in any order: Play up to 1 [Kin'emon] with a cost of 6 from your hand.
    {
      cardId: 'OP10-027',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-027-special',
        },
      ],
    },
    // OP10-028 Kouzuki Momonosuke (028)
    // [Activate: Main] You may rest 2 of your DON!! cards and trash this Character: Look at 5 cards from the top of your deck; reveal up to 2 "The Akazaya Nine" type cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-momonosuke-028-activate-main-search-akazaya-nine',
            text: '[Activate: Main] You may rest 2 of your DON!! cards and trash this Character: Look at 5 cards from the top of your deck; reveal up to 2 "The Akazaya Nine" type cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 2 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['The Akazaya Nine'] },
                count: { kind: 'upTo', value: 2 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP10-029 Dracule Mihawk
    // [On Play] If you have 2 or more rested Characters, set up to 1 of your rested "ODYSSEY" type Characters with a cost of 5 or less as active.
    {
      cardId: 'OP10-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dracule-mihawk-on-play-restand-odyssey',
            text: '[On Play] If you have 2 or more rested Characters, set up to 1 of your rested "ODYSSEY" type Characters with a cost of 5 or less as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { rested: true },
                },
                value: 2,
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['ODYSSEY'], costMax: 5, rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-030 Smoker (030)
    // [Banish] (When this card deals damage, the target card is trashed without activating its Trigger.)
    // [Activate: Main] Set up to 1 of your DON!! cards as active. Then, you cannot set DON!! cards as active using Character effects during this turn.
    {
      cardId: 'OP10-030',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-030-special',
        },
      ],
    },
    // OP10-031 Sengoku
    {
      cardId: 'OP10-031',
      effects: [],
    },
    // OP10-032 Tashigi
    // If you have a green Character other than [Tashigi] that would be removed from the field by your opponent's effect, you may rest this Character instead.
    {
      cardId: 'OP10-032',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-032-special',
        },
      ],
    },
    // OP10-033 Nami (033)
    // [On Play] If you have 2 or more rested "ODYSSEY" type Characters, up to 1 of your opponent's rested DON!! cards will not become active in your opponent's next Refresh Phase.
    {
      cardId: 'OP10-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-033-on-play-skip-refresh-opponent-don',
            text: '[On Play] If you have 2 or more rested "ODYSSEY" type Characters, up to 1 of your opponent\'s rested DON!! cards will not become active in your opponent\'s next Refresh Phase.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['ODYSSEY'], rested: true },
                },
                value: 2,
              },
            ],
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP10-034 Franky (034)
    // [Once Per Turn] If this Character would be K.O.'d in battle, you may add 1 card from the top of your Life cards to your hand instead.
    {
      cardId: 'OP10-034',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-034-special',
        },
      ],
    },
    // OP10-035 Brook (035)
    // [On K.O.] Rest up to 1 of your opponent's Leader or Character cards with a cost of 5 or less.
    {
      cardId: 'OP10-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-035-on-ko-rest-opponent-cost-5-or-less',
            text: "[On K.O.] Rest up to 1 of your opponent's Leader or Character cards with a cost of 5 or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-036 Perona (036)
    // [Your Turn] [Once Per Turn] If a Character is rested by your effect, set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP10-036',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-036-special',
        },
      ],
    },
    // OP10-037 Lim
    // [Once Per Turn] If this Character would be removed from the field by your opponent's effect, you may rest 1 of your "ODYSSEY" type Characters instead.[End of Your Turn] Set up to 1 of your "ODYSSEY" type Characters as active.
    {
      cardId: 'OP10-037',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'lim-once-per-turn-protection-rest-odyssey',
            text: '[Once Per Turn] If this Character would be removed from the field by your opponent\'s effect, you may rest 1 of your "ODYSSEY" type Characters instead.',
            event: 'wouldKoCharacter',
            oncePerTurn: true,
            optional: true,
            conditions: [{ type: 'eventPlayerIs', player: 'opponent' }],
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['ODYSSEY'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'lim-end-of-turn-restand-odyssey',
            text: '[End of Your Turn] Set up to 1 of your "ODYSSEY" type Characters as active.',
            trigger: { type: 'onTurnEnd' },
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['ODYSSEY'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-038 Roronoa Zoro (038)
    // [Opponent's Turn] If you have 2 or more rested Characters, this Character gains +2000 power.
    {
      cardId: 'OP10-038',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'roronoa-zoro-038-opponent-turn-plus-2000',
            text: "[Opponent's Turn] If you have 2 or more rested Characters, this Character gains +2000 power.",
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { rested: true },
                },
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // OP10-039 Gum-Gum Dragon Fire Pistol Twister Star
    // [Main] If your Leader has the "ODYSSEY" type, look at 5 cards from the top of your deck; reveal up to 2 "ODYSSEY" type Character cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP10-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-dragon-fire-pistol-twister-star-main-search-odyssey',
            text: '[Main] If your Leader has the "ODYSSEY" type, look at 5 cards from the top of your deck; reveal up to 2 "ODYSSEY" type Character cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'ODYSSEY',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['ODYSSEY'], cardCategory: ['Character'] },
                count: { kind: 'upTo', value: 2 },
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
            id: 'gum-gum-dragon-fire-pistol-twister-star-trigger-rest',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-040 The Weak Do Not Have the Right to Choose How They Die
    // [Main]/[Counter] K.O. up to 1 of your opponent's rested Characters with a cost of 7 or less.
    {
      cardId: 'OP10-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'the-weak-do-not-have-the-right-main-ko-rested-cost-7-or-less',
            text: "[Main] K.O. up to 1 of your opponent's rested Characters with a cost of 7 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 7, rested: true },
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
            id: 'the-weak-do-not-have-the-right-counter-ko-rested-cost-7-or-less',
            text: "[Counter] K.O. up to 1 of your opponent's rested Characters with a cost of 7 or less.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 7, rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP10-041 Radio Knife
    // [Main] Rest up to 1 of your opponent's Characters with a cost of 6 or less. Then, K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP10-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'radio-knife-main-rest-then-ko',
            text: "[Main] Rest up to 1 of your opponent's Characters with a cost of 6 or less. Then, K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5, rested: true },
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
            id: 'radio-knife-trigger-rest-cost-4-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-042 Usopp (042)
    // All of your "Dressrosa" type Characters with a cost of 2 or more gain +1 cost.[Opponent's Turn] [Once Per Turn] This effect can be activated when your "Dressrosa" type Character is removed from the field by your opponent's effect or K.O.'d. If you have 5 or less cards in your hand, draw 1 card.
    {
      cardId: 'OP10-042',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'usopp-042-dressrosa-cost-plus-1',
            text: 'All of your "Dressrosa" type Characters with a cost of 2 or more gain +1 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { trait: ['Dressrosa'], costMin: 2 },
              },
              cost: 1,
            },
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-042-special',
        },
      ],
    },
    // OP10-043 Moocy
    // [On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: Up to 1 of your [Monkey.D.Luffy] Characters gains [Banish] during this turn.
    {
      cardId: 'OP10-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'moocy-on-play-grant-banish-to-luffy',
            text: '[On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: Up to 1 of your [Monkey.D.Luffy] Characters gains [Banish] during this turn.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-044 Cub
    // [On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: Return up to 1 of your opponent's Characters with a cost of 1 or less to the owner's hand.
    {
      cardId: 'OP10-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cub-on-play-rest-dressrosa-bounce-cost-1-or-less',
            text: '[On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: Return up to 1 of your opponent\'s Characters with a cost of 1 or less to the owner\'s hand.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 1 },
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
    // OP10-045 Cavendish (045)
    // [When Attacking] [Once Per Turn] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP10-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cavendish-045-when-attacking-draw-2-trash-1',
            text: '[When Attacking] [Once Per Turn] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
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
    // OP10-046 Kyros
    // [On Play] Return up to 1 Character with a cost of 5 or less to the owner's hand.
    {
      cardId: 'OP10-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kyros-on-play-bounce-cost-5-or-less',
            text: "[On Play] Return up to 1 Character with a cost of 5 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5 },
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
    // OP10-047 Koala
    // [When Attacking] You may return 1 of your "Revolutionary Army" type Characters with a cost of 3 or more to the owner's hand: This Character gains +3000 power during this turn.
    {
      cardId: 'OP10-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-when-attacking-bounce-revolutionary-plus-3000',
            text: '[When Attacking] You may return 1 of your "Revolutionary Army" type Characters with a cost of 3 or more to the owner\'s hand: This Character gains +3000 power during this turn.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Revolutionary Army'], costMin: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
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
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-048 Sai
    // [On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: Return up to 1 of your opponent's Characters with a cost of 1 or less to the owner's hand.
    {
      cardId: 'OP10-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sai-on-play-rest-dressrosa-bounce-cost-1-or-less',
            text: '[On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: Return up to 1 of your opponent\'s Characters with a cost of 1 or less to the owner\'s hand.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 1 },
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
    // OP10-049 Sabo
    // If your Character with a base cost of 7 or less other than [Sabo] would be removed from the field by your opponent's effect, you may return this Character to the owner's hand instead.
    {
      cardId: 'OP10-049',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'sabo-protection-return-to-hand',
            text: "If your Character with a base cost of 7 or less other than [Sabo] would be removed from the field by your opponent's effect, you may return this Character to the owner's hand instead.",
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { baseCostMax: 7, excludeName: ['Sabo'] },
                },
              },
            ],
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP10-050 Hajrudin
    {
      cardId: 'OP10-050',
      effects: [],
    },
    // OP10-051 Hack
    // [DON!! x1] [When Attacking] Look at 3 cards from the top of your deck; reveal up to 1 "Revolutionary Army" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hack-when-attacking-search-revolutionary',
            text: '[DON!! x1] [When Attacking] Look at 3 cards from the top of your deck; reveal up to 1 "Revolutionary Army" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Revolutionary Army'],
                  cardCategory: ['Character'],
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
    // OP10-052 Bartolomeo
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Place up to 1 Character with a cost of 1 or less at the bottom of the owner's deck.
    {
      cardId: 'OP10-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartolomeo-on-play-bottom-deck-cost-1-or-less',
            text: "[On Play] Place up to 1 Character with a cost of 1 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 1 },
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
    // OP10-053 Bian
    // If you have a "The Tontattas" type Character other than [Bian], this Character gains [Blocker].
    {
      cardId: 'OP10-053',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'bian-gains-blocker-if-tontattas-exists',
            text: 'If you have a "The Tontattas" type Character other than [Bian], this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['The Tontattas'], excludeName: ['Bian'] },
                },
              },
            ],
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
      ],
    },
    // OP10-054 Blue Gilly
    {
      cardId: 'OP10-054',
      effects: [],
    },
    // OP10-055 Marco
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On K.O.] Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand.
    {
      cardId: 'OP10-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marco-on-ko-bounce-cost-4-or-less',
            text: "[On K.O.] Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 4 },
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
    // OP10-056 Mansherry
    // [On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards, and return 1 of your "Dressrosa" type Characters with a cost of 4 or more to the owner's hand: Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand.
    {
      cardId: 'OP10-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mansherry-on-play-bounce-opponent-cost-4-or-less',
            text: '[On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards, and return 1 of your "Dressrosa" type Characters with a cost of 4 or more to the owner\'s hand: Return up to 1 of your opponent\'s Characters with a cost of 4 or less to the owner\'s hand.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Dressrosa'], costMin: 4 },
                  count: { kind: 'upTo', value: 1 },
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
                  filter: { costMax: 4 },
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
    // OP10-057 Leo
    // [On Play] You may rest your Leader or 1 of your Stage cards: If your Leader is [Usopp], look at 5 cards from the top of your deck; reveal up to 2 "Dressrosa" type cards other than [Leo] and add them to your hand. Then, place the rest at the bottom of your deck in any order, and trash 1 card from your hand.
    {
      cardId: 'OP10-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'leo-on-play-search-dressrosa',
            text: '[On Play] You may rest your Leader or 1 of your Stage cards: If your Leader is [Usopp], look at 5 cards from the top of your deck; reveal up to 2 "Dressrosa" type cards other than [Leo] and add them to your hand. Then, place the rest at the bottom of your deck in any order, and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Usopp',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Dressrosa'], excludeName: ['Leo'] },
                count: { kind: 'upTo', value: 2 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
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
    // OP10-058 Rebecca
    // [On Play] If there is a Character with a cost of 8 or more, draw 1 card. Then, reveal up to 2 "Dressrosa" type Character cards with a cost of 7 or less other than [Rebecca] from your hand. Play 1 of the revealed cards and play the other card rested if it has a cost of 4 or less.
    {
      cardId: 'OP10-058',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-058-special',
        },
      ],
    },
    // OP10-059 Fo...llow...Me...and...I...Will...Gui...de...You
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 "Dressrosa" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP10-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'follow-me-main-search-dressrosa',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 "Dressrosa" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Dressrosa'], cardCategory: ['Character'] },
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
            id: 'follow-me-trigger-search-dressrosa',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Dressrosa'], cardCategory: ['Character'] },
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
    // OP10-060 Barrier-Barrier Pistol
    // [Main] Place up to 1 of your opponent's Characters with 6000 power or less at the bottom of the owner's deck.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP10-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'barrier-barrier-pistol-main-bottom-deck',
            text: "[Main] Place up to 1 of your opponent's Characters with 6000 power or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { powerMax: 6000 },
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
            id: 'barrier-barrier-pistol-trigger-bottom-deck',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { powerMax: 6000 },
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
    // OP10-061 Special Long-Range Attack!! Bagworm
    // [Main] Draw 1 card. Then, return up to 1 of your opponent's Characters with a cost of 2 or less to the owner's hand.
    // [Trigger] Return up to 1 Character with a cost of 2 or less to the owner's hand.
    {
      cardId: 'OP10-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'special-long-range-attack-main-draw-bounce',
            text: "[Main] Draw 1 card. Then, return up to 1 of your opponent's Characters with a cost of 2 or less to the owner's hand.",
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'special-long-range-attack-trigger-bounce',
            text: "[Trigger] Return up to 1 Character with a cost of 2 or less to the owner's hand.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 2 },
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
    // OP10-062 Violet
    // [Blocker]
    // [On K.O.] DON!! 1: If your Leader has the "Donquixote Pirates" type, add up to 1 purple Event from your trash to your hand.
    {
      cardId: 'OP10-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'violet-on-ko-don-1-recover-purple-event',
            text: '[On K.O.] DON!! 1: If your Leader has the "Donquixote Pirates" type, add up to 1 purple Event from your trash to your hand.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { cardCategory: ['Event'], color: ['Purple'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP10-063 Vinsmoke Sanji
    // [On Play] If your Leader's type includes "GERMA", look at 5 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-sanji-on-play-search-germa',
            text: '[On Play] If your Leader\'s type includes "GERMA", look at 5 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'GERMA',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
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
    // OP10-064 Clone Soldier
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP10-064',
      effects: [],
    },
    // OP10-065 Sugar (065)
    // [Activate: Main] You may rest 1 of your DON!! cards and this Character: Look at 5 cards from the top of your deck; reveal up to 1 "Donquixote Pirates" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sugar-065-activate-main-search-donquixote',
            text: '[Activate: Main] You may rest 1 of your DON!! cards and this Character: Look at 5 cards from the top of your deck; reveal up to 1 "Donquixote Pirates" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
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
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Donquixote Pirates'] },
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
    // OP10-066 Giolla
    // [On Your Opponent's Attack] [Once Per Turn] You may rest 2 of your DON!! cards: Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP10-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'giolla-on-opponent-attack-rest-don-rest-char',
            text: "[On Your Opponent's Attack] [Once Per Turn] You may rest 2 of your DON!! cards: Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-067 Senor Pink
    // [On Play] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Add up to 1 purple Event with a cost of 5 or less from your trash to your hand. Then, set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP10-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'senor-pink-on-play-don-1-recover-purple-event',
            text: '[On Play] DON!! 1: Add up to 1 purple Event with a cost of 5 or less from your trash to your hand. Then, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Event'],
                  color: ['Purple'],
                  costMax: 5,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-068 Diamante
    {
      cardId: 'OP10-068',
      effects: [],
    },
    // OP10-069 Fighting Fish
    // [DON!! x1] [When Attacking] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP10-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fighting-fish-when-attacking-don-1-ko-cost-1-or-less',
            text: "[DON!! x1] [When Attacking] DON!! 1: K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP10-070 Trebol
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] All of your Characters with 1000 base power or less cannot be K.O.'d by your opponent's effects until the end of your opponent's next turn.
    {
      cardId: 'OP10-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trebol-on-play-grant-cannot-be-koed-by-effects',
            text: "[On Play] All of your Characters with 1000 base power or less cannot be K.O.'d by your opponent's effects until the end of your opponent's next turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { basePowerMax: 1000 },
                },
                keywords: ['cannotBeKoedByEffects'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-071 Donquixote Doflamingo
    // [On Play] DON!! 1: Play up to 1 "Donquixote Pirates" type Character card with a cost of 5 or less from your hand.
    // [On Your Opponent's Attack] [Once Per Turn] You may rest 1 of your DON!! cards: Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP10-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-on-play-don-1-play',
            text: '[On Play] DON!! 1: Play up to 1 "Donquixote Pirates" type Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Donquixote Pirates'], costMax: 5 },
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
            id: 'donquixote-doflamingo-on-opponent-attack-add-don',
            text: "[On Your Opponent's Attack] [Once Per Turn] You may rest 1 of your DON!! cards: Add up to 1 DON!! card from your DON!! deck and set it as active.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
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
    // OP10-072 Donquixote Rosinante
    // [On Play] You may trash 1 Event from your hand: Draw 2 cards.
    // [End of Your Turn] If you have 7 or more DON!! cards on your field, set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP10-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-rosinante-on-play-trash-event-draw-2',
            text: '[On Play] You may trash 1 Event from your hand: Draw 2 cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Event'] },
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
            id: 'donquixote-rosinante-end-of-turn-unrest-2-don',
            text: '[End of Your Turn] If you have 7 or more DON!! cards on your field, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'self',
                value: 7,
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-073 Buffalo
    {
      cardId: 'OP10-073',
      effects: [],
    },
    // OP10-074 Pica
    // [Once Per Turn] If this Character would be K.O.'d by your opponent's effect, you may rest 2 of your active DON!! cards instead.
    {
      cardId: 'OP10-074',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'pica-once-per-turn-rest-don-instead-of-ko',
            text: "[Once Per Turn] If this Character would be K.O.'d by your opponent's effect, you may rest 2 of your active DON!! cards instead.",
            event: 'wouldKoCharacter',
            oncePerTurn: true,
            optional: true,
            conditions: [
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventReasonIs', value: 'effect' },
            ],
            replacement: [
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
          },
        },
      ],
    },
    // OP10-075 Foxy
    // [Activate: Main] You may trash this Character: If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card.
    {
      cardId: 'OP10-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'foxy-activate-main-trash-draw',
            text: "[Activate: Main] You may trash this Character: If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP10-076 Baby 5
    // [On Play] You may trash 1 card from your hand: If your Leader has the "Donquixote Pirates" type, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP10-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-on-play-trash-add-don',
            text: '[On Play] You may trash 1 card from your hand: If your Leader has the "Donquixote Pirates" type, add up to 1 DON!! card from your DON!! deck and set it as active.',
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
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
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
    // OP10-077 Bellamy
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Block] You may rest 2 of your DON!! cards: Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP10-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bellamy-on-block-rest-don-add-don',
            text: '[On Block] You may rest 2 of your DON!! cards: Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onBlock' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
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
    // OP10-078 I Do Not Forgive Those Who Laugh at My Family!!!
    // [Main]/[Counter] Look at 3 cards from the top of your deck; reveal up to 1 "Donquixote Pirates" type card other than [I Do Not Forgive Those Who Laugh at My Family!!!] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'i-do-not-forgive-main-search-donquixote',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 "Donquixote Pirates" type card other than [I Do Not Forgive Those Who Laugh at My Family!!!] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Donquixote Pirates'],
                  excludeName: [
                    'I Do Not Forgive Those Who Laugh at My Family!!!',
                  ],
                },
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
            id: 'i-do-not-forgive-counter-search-donquixote',
            text: '[Counter] Look at 3 cards from the top of your deck; reveal up to 1 "Donquixote Pirates" type card other than [I Do Not Forgive Those Who Laugh at My Family!!!] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Donquixote Pirates'],
                  excludeName: [
                    'I Do Not Forgive Those Who Laugh at My Family!!!',
                  ],
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
    // OP10-079 God Thread
    // [Main] K.O. up to 1 of your opponent's Characters with a cost 5 or less. Then, add up to 1 DON!! card from your DON!! deck and set it as active.
    // [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP10-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'god-thread-main-ko-add-don',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost 5 or less. Then, add up to 1 DON!! card from your DON!! deck and set it as active.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
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
            id: 'god-thread-trigger-add-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
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
    // OP10-080 Little Black Bears
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 7 or more DON!! cards on your field and 5 or less cards in your hand, draw 1 card.
    // [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP10-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'little-black-bears-counter-plus-4000',
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
            id: 'little-black-bears-counter-draw-if-don-7-and-hand-5-or-less',
            text: 'Then, if you have 7 or more DON!! cards on your field and 5 or less cards in your hand, draw 1 card.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'self',
                value: 7,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'little-black-bears-trigger-add-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
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
    // OP10-081 Usopp (081)
    // [On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: K.O. up to 1 of your opponent's Characters with a cost of 2 or less. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP10-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopp-081-on-play-ko-trash-from-deck',
            text: '[On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: K.O. up to 1 of your opponent\'s Characters with a cost of 2 or less. Then, trash 2 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              { type: 'trashFromDeck', player: 'self', amount: 2 },
            ],
          },
        },
      ],
    },
    // OP10-082 Kuzan
    // This Character cannot be removed from the field by your opponent's effects.
    // [Activate: Main] You may trash this Character: Draw 1 card. Then, play up to 1 "Blackbeard Pirates" type Character card with a cost of 5 or less other than [Kuzan] from your trash.
    {
      cardId: 'OP10-082',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kuzan-cannot-be-removed-by-opponent-effects',
            text: "This Character cannot be removed from the field by your opponent's effects.",
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeRemovedByOpponentEffects'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-activate-main-trash-draw-play-blackbeard',
            text: '[Activate: Main] You may trash this Character: Draw 1 card. Then, play up to 1 "Blackbeard Pirates" type Character card with a cost of 5 or less other than [Kuzan] from your trash.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    trait: ['Blackbeard Pirates'],
                    costMax: 5,
                    excludeName: ['Kuzan'],
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
    // OP10-083 Kouzuki Momonosuke (083)
    // [Activate: Main] You may rest this Character and 1 of your "Dressrosa" type Leader or Stage cards: Give up to 1 of your opponent's Characters -2 cost during this turn.
    {
      cardId: 'OP10-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-momonosuke-083-activate-main-minus-cost',
            text: '[Activate: Main] You may rest this Character and 1 of your "Dressrosa" type Leader or Stage cards: Give up to 1 of your opponent\'s Characters -2 cost during this turn.',
            trigger: { type: 'activateMain' },
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
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
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
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-084 Sanjuan.Wolf
    {
      cardId: 'OP10-084',
      effects: [],
    },
    // OP10-085 Jesus Burgess
    // [DON!! x1] If you have 8 or more cards in your trash, this Character gains [Rush].
    {
      cardId: 'OP10-085',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-085-special',
        },
      ],
    },
    // OP10-086 Shiryu
    // [Opponent's Turn] This Character gains +2000 power.
    // [Activate: Main] [Once Per Turn] If your Leader has the "Blackbeard Pirates" type, and this Character was played on this turn, K.O. up to 1 of your opponent's Characters with a base cost of 3 or less.
    {
      cardId: 'OP10-086',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'shiryu-opponent-turn-plus-2000',
            text: "[Opponent's Turn] This Character gains +2000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shiryu-activate-main-ko-base-cost-3-or-less',
            text: '[Activate: Main] [Once Per Turn] If your Leader has the "Blackbeard Pirates" type, and this Character was played on this turn, K.O. up to 1 of your opponent\'s Characters with a base cost of 3 or less.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { baseCostMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP10-087 Tony Tony.Chopper (087)
    // [Activate: Main] You may rest this Character and 1 of your "Dressrosa" type Leader or Stage cards: If your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP10-087',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-087-special',
        },
      ],
    },
    // OP10-088 Nami (088)
    // [Activate: Main] You may rest this Character and 1 of your "Dressrosa" type Leader or Stage cards: Draw 1 card. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP10-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-088-activate-main-draw-trash-from-deck',
            text: '[Activate: Main] You may rest this Character and 1 of your "Dressrosa" type Leader or Stage cards: Draw 1 card. Then, trash 2 cards from the top of your deck.',
            trigger: { type: 'activateMain' },
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
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              { type: 'trashFromDeck', player: 'self', amount: 2 },
            ],
          },
        },
      ],
    },
    // OP10-089 Nico Robin
    {
      cardId: 'OP10-089',
      effects: [],
    },
    // OP10-090 Franky (090)
    // [Blocker]
    // [On K.O.] Play up to 1 "Dressrosa" type Character card with a cost of 3 or less from your trash rested.
    {
      cardId: 'OP10-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'franky-090-on-ko-play-dressrosa-from-trash',
            text: '[On K.O.] Play up to 1 "Dressrosa" type Character card with a cost of 3 or less from your trash rested.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['Dressrosa'], costMax: 3 },
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
    // OP10-091 Brook (091)
    // [Activate: Main] You may rest this Character and 1 of your "Dressrosa" type Leader or Stage cards: K.O. up to 1 of your opponent's Characters with a cost of 1 or less. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP10-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-091-activate-main-ko-trash-from-deck',
            text: '[Activate: Main] You may rest this Character and 1 of your "Dressrosa" type Leader or Stage cards: K.O. up to 1 of your opponent\'s Characters with a cost of 1 or less. Then, trash 2 cards from the top of your deck.',
            trigger: { type: 'activateMain' },
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
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              { type: 'trashFromDeck', player: 'self', amount: 2 },
            ],
          },
        },
      ],
    },
    // OP10-092 Perona (092)
    // [Activate: Main] [Once Per Turn] You may place 2 "Thriller Bark Pirates" type cards from your trash at the bottom of your deck in any order: Up to 1 of your Characters other than [Perona] gains +2000 power during this turn.
    {
      cardId: 'OP10-092',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-092-special',
        },
      ],
    },
    // OP10-093 Saint Homing
    // [Activate: Main] You may trash this Character: Up to 1 of your black Characters gains +3 cost until the end of your opponent's next turn.
    {
      cardId: 'OP10-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'saint-homing-activate-main-plus-cost-black',
            text: "[Activate: Main] You may trash this Character: Up to 1 of your black Characters gains +3 cost until the end of your opponent's next turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { color: ['Black'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP10-094 Ryuma
    // [DON!! x1] This Character gains [Double Attack].
    {
      cardId: 'OP10-094',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'ryuma-don-1-double-attack',
            text: '[DON!! x1] This Character gains [Double Attack].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['doubleAttack'],
            },
          },
        },
      ],
    },
    // OP10-095 Roronoa Zoro (095)
    // [On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: K.O. up to 1 of your opponent's Characters with a cost of 4 or less. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP10-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-095-on-play-ko-trash-from-deck',
            text: '[On Play] You may rest 1 of your "Dressrosa" type Leader or Stage cards: K.O. up to 1 of your opponent\'s Characters with a cost of 4 or less. Then, trash 2 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'stage'],
                  filter: { trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              { type: 'trashFromDeck', player: 'self', amount: 2 },
            ],
          },
        },
      ],
    },
    // OP10-096 There's No Longer Any Need for the Seven Warlords of the Sea!!!
    // [Main] K.O. up to 1 of your opponent's "The Seven Warlords of the Sea" type Characters with a cost of 8 or less.
    // [Trigger] K.O. up to 1 of your opponent's "The Seven Warlords of the Sea" type Characters with a cost of 4 or less.
    {
      cardId: 'OP10-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'no-longer-need-seven-warlords-main-ko',
            text: '[Main] K.O. up to 1 of your opponent\'s "The Seven Warlords of the Sea" type Characters with a cost of 8 or less.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    trait: ['The Seven Warlords of the Sea'],
                    costMax: 8,
                  },
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
            id: 'no-longer-need-seven-warlords-trigger-ko',
            text: '[Trigger] K.O. up to 1 of your opponent\'s "The Seven Warlords of the Sea" type Characters with a cost of 4 or less.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    trait: ['The Seven Warlords of the Sea'],
                    costMax: 4,
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
    // OP10-097 Gum-Gum Rhino Schneider
    // [Main] Up to 1 of your "Dressrosa" type Characters gains +2000 power during this turn. Then, if you have 10 or more cards in your trash, that card gains [Banish] during this turn.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP10-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-rhino-schneider-main-plus-2000-dressrosa',
            text: '[Main] Up to 1 of your "Dressrosa" type Characters gains +2000 power during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Dressrosa'] },
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
            id: 'gum-gum-rhino-schneider-main-banish-if-trash-10',
            text: 'Then, if you have 10 or more cards in your trash, that card gains [Banish] during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Dressrosa'] },
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
            id: 'gum-gum-rhino-schneider-trigger-draw-2-trash-1',
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
    // OP10-098 Liberation
    // [Main] If the number of your Characters is at least 2 less than the number of your opponent's Characters, K.O. up to 1 of your opponent's Characters with a base cost of 6 or less and up to 1 of your opponent's Characters with a base cost of 4 or less.
    // [Trigger] Negate the effect of up to 1 of each of your opponent's Leader and Character cards during this turn.
    {
      cardId: 'OP10-098',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-098-special',
        },
      ],
    },
    // OP10-099 Eustass"Captain"Kid (099)
    // [End of Your Turn] You may turn 1 card from the top of your Life cards face-up: Set up to 1 of your "Supernovas" type Characters with a cost of 3 to 8 as active. That Character gains [Blocker] until the end of your opponent's next turn.
    {
      cardId: 'OP10-099',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-099-special',
        },
      ],
    },
    // OP10-100 Inazuma
    // [DON!! x1] [When Attacking] Rest up to 1 of your opponent's Characters with a cost equal to or less than the total of your and your opponent's Life cards.
    // [Trigger] If your Leader has the "Revolutionary Army" type and you and your opponent have a total of 5 or less Life cards, play this card.
    {
      cardId: 'OP10-100',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-100-special',
        },
      ],
    },
    // OP10-101 Urouge
    {
      cardId: 'OP10-101',
      effects: [],
    },
    // OP10-102 Emporio.Ivankov
    // [Activate: Main] [Once Per Turn] Up to 3 of your "Revolutionary Army" type Characters gain +1000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP10-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emporio-ivankov-activate-main-plus-1000-revolutionary',
            text: '[Activate: Main] [Once Per Turn] Up to 3 of your "Revolutionary Army" type Characters gain +1000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Revolutionary Army'] },
                  count: { kind: 'upTo', value: 3 },
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
            id: 'emporio-ivankov-activate-main-add-life-to-hand',
            text: 'Then, add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP10-103 Capone"Gang"Bege
    // [On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 "Supernovas" type Character card from your hand to the top of your Life cards face-up.
    {
      cardId: 'OP10-103',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-103-special',
        },
      ],
    },
    // OP10-104 Caribou
    // [DON!! x1] If your Leader has the "Supernovas" type and your opponent has 3 or more Life cards, this Character cannot be K.O.'d in battle.
    {
      cardId: 'OP10-104',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-104-special',
        },
      ],
    },
    // OP10-105 Cavendish (105)
    {
      cardId: 'OP10-105',
      effects: [],
    },
    // OP10-106 Killer
    // [On K.O.] If your Leader has the "Supernovas" type, look at 3 cards from the top of your deck; reveal up to 1 "Supernovas" or "Kid Pirates" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'killer-on-ko-search-supernovas',
            text: '[On K.O.] If your Leader has the "Supernovas" type, look at 3 cards from the top of your deck; reveal up to 1 "Supernovas" or "Kid Pirates" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Supernovas', 'Kid Pirates'] },
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
    // OP10-107 Jewelry Bonney
    // [Blocker]
    // [On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 "Supernovas" type Character card with a cost of 5 from your hand to the top of your Life cards face-up.
    {
      cardId: 'OP10-107',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-107-special',
        },
      ],
    },
    // OP10-108 Scratchmen Apoo
    // If you have a yellow "Supernovas" type Character other than [Scratchmen Apoo], this Character gains [Blocker].
    {
      cardId: 'OP10-108',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'scratchmen-apoo-gains-blocker-if-yellow-supernovas',
            text: 'If you have a yellow "Supernovas" type Character other than [Scratchmen Apoo], this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    color: ['Yellow'],
                    trait: ['Supernovas'],
                    excludeName: ['Scratchmen Apoo'],
                  },
                },
              },
            ],
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
      ],
    },
    // OP10-109 Basil Hawkins
    // [On K.O.] Trash up to 1 card from the top of your opponent's Life cards.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP10-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-on-ko-trash-opponent-life',
            text: "[On K.O.] Trash up to 1 card from the top of your opponent's Life cards.",
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
                destinationZone: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-trigger-draw-2-trash-1',
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
    // OP10-110 Heat & Wire
    // [On Play] Rest up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.
    // [Trigger] If you have 2 or less Life cards, play this card.
    {
      cardId: 'OP10-110',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-110-special',
        },
      ],
    },
    // OP10-111 Monkey.D.Luffy (111)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Supernovas" type card other than [Monkey.D.Luffy] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP10-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-111-on-play-search-supernovas',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Supernovas" type card other than [Monkey.D.Luffy] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Supernovas'],
                  excludeName: ['Monkey.D.Luffy'],
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
    // OP10-112 Eustass"Captain"Kid (112)
    // [On Play] You may rest this Character: Trash up to 1 card from the top of your opponent's Life cards.
    // [End of Your Turn] If your opponent has 2 or less Life cards, draw 1 card and trash 1 card from your hand.
    {
      cardId: 'OP10-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eustass-captain-kid-112-on-play-trash-opponent-life',
            text: "[On Play] You may rest this Character: Trash up to 1 card from the top of your opponent's Life cards.",
            trigger: { type: 'onPlay', optional: true },
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
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eustass-captain-kid-112-end-of-turn-draw-trash',
            text: '[End of Your Turn] If your opponent has 2 or less Life cards, draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'opponent',
                value: 2,
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
            ],
          },
        },
      ],
    },
    // OP10-113 Roronoa Zoro (113)
    // If you have less Life cards than your opponent, this Character gains [Rush].
    // [Trigger] You may trash 1 card from your hand: If your Leader has the "Supernovas" type, play this card.
    {
      cardId: 'OP10-113',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'roronoa-zoro-113-rush-if-less-life',
            text: 'If you have less Life cards than your opponent, this Character gains [Rush].',
            conditions: [
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-113-special',
        },
      ],
    },
    // OP10-114 X.Drake
    // [Activate: Main] You may rest this Character: If the number of your Life cards is equal to or less than the number of your opponent's Life cards, rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP10-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'x-drake-activate-main-rest-opponent',
            text: "[Activate: Main] You may rest this Character: If the number of your Life cards is equal to or less than the number of your opponent's Life cards, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
              },
            ],
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
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP10-115 Let's Meet Again in the New World
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 0 Life cards, draw 1 card.
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.
    {
      cardId: 'OP10-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lets-meet-again-counter-plus-4000',
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
            id: 'lets-meet-again-counter-draw-if-0-life',
            text: 'Then, if you have 0 Life cards, draw 1 card.',
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 0 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-115-special',
        },
      ],
    },
    // OP10-116 Damned Punk
    // [Main] Look at up to 1 card from the top of your or your opponent's Life cards and place it at the top or bottom of the Life cards. Then, K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP10-116',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-116-special',
        },
        {
          kind: 'standard',
          effect: {
            id: 'damned-punk-trigger-draw-2-trash-1',
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
    // OP10-117 ROOM
    // [Counter] If you have 1 or less Life cards, up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, set up to 1 of your Characters with a cost of 5 or less as active.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP10-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'room-counter-plus-3000-and-restand',
            text: '[Counter] If you have 1 or less Life cards, up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, set up to 1 of your Characters with a cost of 5 or less as active.',
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
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
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'room-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP10-118 Monkey.D.Luffy (118)
    // Once per turn, this Character cannot be K.O.'d by your opponent's effects.
    // [When Attacking] You may place 3 cards from your trash at the bottom of your deck in any order: If your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand.
    {
      cardId: 'OP10-118',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-118-special',
        },
      ],
    },
    // OP10-119 Trafalgar Law (119)
    // [On Play] Reveal up to 1 "Supernovas" type Character card from your hand and add it to the top of your Life cards face-down. Then, give up to 1 rested DON!! card to 1 of your "Supernovas" type Leader.
    {
      cardId: 'OP10-119',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op10-119-special',
        },
      ],
    },
  ],
};
