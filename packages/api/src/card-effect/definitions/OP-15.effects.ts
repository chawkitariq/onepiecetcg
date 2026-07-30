import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op15EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-15',
  cards: [
    // OP15-001 Krieg (OP15-001)
    // [DON!! x1] [Opponent's Turn] If the only Characters on your field are {East Blue} type Characters, give all of your opponent's Characters -2000 power.
    // [Activate: Main] [Once Per Turn] Rest up to 1 of your opponent's Characters that has 2 or more DON!! cards given.
    {
      cardId: 'OP15-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'krieg-leader-opponent-turn-east-blue-minus-2000',
            text: "[DON!! x1] [Opponent's Turn] If the only Characters on your field are {East Blue} type Characters, give all of your opponent's Characters -2000 power.",
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              power: -2000,
            },
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'East Blue',
              },
            ],
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-001-special',
        },
      ],
    },
    // OP15-002 Lucy
    // [When Attacking]/[On Your Opponent's Attack] You may trash any number of Event or Stage cards from your hand. This Leader gains +1000 power during this battle for every card trashed.
    // [Activate: Main] [Once Per Turn] If you have activated an Event with a base cost of 3 or more during this turn, draw 1 card.
    {
      cardId: 'OP15-002',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-002-special',
        },
      ],
    },
    // OP15-003 Alvida
    // If this Character would be K.O.'d, you may trash 1 Character card with a power of 6000 or less from your hand instead.
    // [Activate: Main] [Once Per Turn] You may give 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters: Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.
    {
      cardId: 'OP15-003',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'alvida-ko-replacement',
            text: "If this Character would be K.O.'d, you may trash 1 Character card with a power of 6000 or less from your hand instead.",
            event: 'wouldKoCharacter',
            replacement: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'], powerMax: 6000 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            optional: true,
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'alvida-activate-main-move-rested-don',
            text: "[Activate: Main] [Once Per Turn] You may give 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters: Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.",
            trigger: {
              type: 'activateMain',
              optional: true,
              oncePerTurn: true,
            },
            costs: [
              {
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'either',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'opponent',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP15-004 Sea Cat
    // [On Play] If your Leader has 0 power or less, give up to 1 of your opponent's Characters -3000 power during this turn.
    {
      cardId: 'OP15-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sea-cat-on-play-leader-0-power-minus-3000',
            text: "[On Play] If your Leader has 0 power or less, give up to 1 of your opponent's Characters -3000 power during this turn.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { powerMax: 0 },
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
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-005 Cabaji
    // [When Attacking] If your opponent has any DON!! cards given, this Character gains +2000 power during this turn.
    {
      cardId: 'OP15-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cabaji-when-attacking-opponent-has-don-plus-2000',
            text: '[When Attacking] If your opponent has any DON!! cards given, this Character gains +2000 power during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'any' },
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
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-006 Cavendish
    // If you have 4 or more Events in your trash, this Character gains +2000 power.
    {
      cardId: 'OP15-006',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'cavendish-4-events-in-trash-plus-2000',
            text: 'If you have 4 or more Events in your trash, this Character gains +2000 power.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
            },
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
          },
        },
      ],
    },
    // OP15-007 Gin
    // [On Play] If your Leader has the {East Blue} type, play up to 1 Character card with a cost of 5 or less from your hand.
    {
      cardId: 'OP15-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gin-on-play-leader-east-blue-play-cost-5-or-less',
            text: '[On Play] If your Leader has the {East Blue} type, play up to 1 Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP15-008 Krieg (OP15-008)
    // [On Play] Give up to 3 of your opponent's rested DON!! cards to 1 of your opponent's Characters. Then, this Character gains [Rush] during this turn.
    // [Activate: Main] [Once Per Turn] If this Character was played on this turn, give all of your opponent's Characters -1000 power during this turn for every DON!! card given to that Character.
    {
      cardId: 'OP15-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'krieg-008-on-play-move-don-and-rush',
            text: "[On Play] Give up to 3 of your opponent's rested DON!! cards to 1 of your opponent's Characters. Then, this Character gains [Rush] during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 3 },
                },
                amount: 3,
              },
              {
                type: 'attachDon',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'opponent',
                amount: 3,
                rested: true,
              },
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
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-008-special',
        },
      ],
    },
    // OP15-009 Koby (OP15-009)
    // If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may give your Leader -2000 power during this turn instead.
    {
      cardId: 'OP15-009',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'koby-replacement-leader-minus-2000-instead-of-removal',
            text: "If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may give your Leader -2000 power during this turn instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            replacement: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-010 Nezumi
    // [Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.
    {
      cardId: 'OP15-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nezumi-activate-main-give-rested-don',
            text: "[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'either',
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
    // OP15-011 Pearl
    // [Opponent's Turn] If your Leader has the {East Blue} type, this Character gains [Blocker] and +2000 power.
    // [On K.O.] If your Leader has the {East Blue} type, K.O. up to 1 of your opponent's Characters with 6000 base power or less.
    {
      cardId: 'OP15-011',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'pearl-opponent-turn-leader-east-blue-power-2000',
            text: "[Opponent's Turn] If your Leader has the {East Blue} type, this Character gains [Blocker] and +2000 power.",
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
            },
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'pearl-on-ko-leader-east-blue-ko-6000-or-less',
            text: "[On K.O.] If your Leader has the {East Blue} type, K.O. up to 1 of your opponent's Characters with 6000 base power or less.",
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
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
    // OP15-012 Buggy
    // [When Attacking] Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.
    // [On K.O.] Draw 1 card.
    {
      cardId: 'OP15-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buggy-when-attacking-give-rested-don',
            text: "[When Attacking] Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'either',
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
        {
          kind: 'standard',
          effect: {
            id: 'buggy-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP15-013 Pincers
    // If your Leader has 0 power or less, give this card in your hand -2 cost.
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP15-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pincers-reduce-cost-conditional',
            text: 'If your Leader has 0 power or less, give this card in your hand -2 cost.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { powerMax: 0 },
                },
              },
            ],
            actions: [
              {
                type: 'registerNextPlayCostModifier',
                player: 'self',
                filter: { name: ['Pincers'] },
                sourceZone: 'hand',
                amount: -2,
              },
            ],
          },
        },
      ],
    },
    // OP15-014 Bartolomeo
    // If this Character would be K.O.'d, you may trash 1 Event from your hand instead.
    // [On Play] Activate up to 1 {Dressrosa} type Event with a base cost of 3 or less from your hand.
    {
      cardId: 'OP15-014',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'bartolomeo-ko-replacement-trash-event',
            text: "If this Character would be K.O.'d, you may trash 1 Event from your hand instead.",
            event: 'wouldKoCharacter',
            replacement: [
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
            optional: true,
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-014-special',
        },
      ],
    },
    // OP15-015 Higuma
    // [On Play] Give up to 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters. Then, give -1000 power during this turn to up to 1 of your opponent's Characters with a DON!! card given.
    {
      cardId: 'OP15-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'higuma-on-play-move-don-then-minus-1000',
            text: "[On Play] Give up to 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters. Then, give -1000 power during this turn to up to 1 of your opponent's Characters with a DON!! card given.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
              {
                type: 'attachDon',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'opponent',
                amount: 1,
                rested: true,
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
      ],
    },
    // OP15-016 Fullbody
    // (no effect)
    {
      cardId: 'OP15-016',
      effects: [],
    },
    // OP15-017 Morgan
    // [Activate: Main] [Once Per Turn] You may give 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters: Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.
    {
      cardId: 'OP15-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'morgan-activate-main-move-don',
            text: "[Activate: Main] [Once Per Turn] You may give 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters: Give up to 1 rested DON!! card to its owner's Leader or 1 of their Characters.",
            trigger: {
              type: 'activateMain',
              optional: true,
              oncePerTurn: true,
            },
            costs: [
              {
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'either',
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
    // OP15-018 Mohji
    // [When Attacking] K.O. up to 1 of your opponent's Characters with 3000 power or less with a DON!! card given.
    {
      cardId: 'OP15-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mohji-when-attacking-ko-3000-or-less',
            text: "[When Attacking] K.O. up to 1 of your opponent's Characters with 3000 power or less with a DON!! card given.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 3000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP15-019 Barrier Bulls
    // [Main] Draw 1 card and your Leader gains +1000 power until the end of your opponent's next End Phase.[Trigger] Give up to 1 of your opponent's Characters -4000 power during this turn.
    {
      cardId: 'OP15-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'barrier-bulls-main-draw-leader-plus-1000',
            text: "[Main] Draw 1 card and your Leader gains +1000 power until the end of your opponent's next End Phase.",
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'barrier-bulls-trigger-minus-4000',
            text: "[Trigger] Give up to 1 of your opponent's Characters -4000 power during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -4000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-020 Fire Fist
    // [Main] Your Leader gains +3000 power during this turn and give up to 1 of your opponent's Characters -8000 power until the end of your opponent's next End Phase. Then, you may trash 2 cards from your hand. If you do, K.O. up to 1 of your opponent's Characters with 0 power or less.
    {
      cardId: 'OP15-020',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-020-special',
        },
      ],
    },
    // OP15-021 Just Watch Me, Ace!!!
    // If you have 4 or more Events in your trash, give this card in your hand -3 cost.[Main]/[Counter] Give up to 1 of your opponent's Characters -3000 power during this turn.
    {
      cardId: 'OP15-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'just-watch-me-ace-cost-reduction',
            text: 'If you have 4 or more Events in your trash, give this card in your hand -3 cost.',
            trigger: { type: 'activateMain' },
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
            actions: [
              {
                type: 'registerNextPlayCostModifier',
                player: 'self',
                filter: { name: ['Just Watch Me, Ace!!!'] },
                sourceZone: 'hand',
                amount: -3,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'just-watch-me-ace-main-counter-minus-3000',
            text: "[Main]/[Counter] Give up to 1 of your opponent's Characters -3000 power during this turn.",
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
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'just-watch-me-ace-counter-minus-3000',
            text: "[Counter] Give up to 1 of your opponent's Characters -3000 power during this turn.",
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
                amount: -3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP15-022 Brook (OP15-022)
    // Under the rules of this game, you do not lose when your deck has 0 cards. You lose at the end of the turn in which your deck becomes 0 cards.
    // [Activate: Main] [Once Per Turn] Trash 4 cards from the top of your deck. Then, if your deck has 0 cards, set up to 1 of your Characters as active.
    {
      cardId: 'OP15-022',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'brook-leader-win-on-deck-out',
            text: 'Under the rules of this game, you do not lose when your deck has 0 cards. You lose at the end of the turn in which your deck becomes 0 cards.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['leader'],
              },
              keywords: ['winOnDeckOut'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'brook-leader-activate-main-trash-4-restand-if-deck-0',
            text: '[Activate: Main] [Once Per Turn] Trash 4 cards from the top of your deck. Then, if your deck has 0 cards, set up to 1 of your Characters as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              { type: 'trashFromDeck', player: 'self', amount: 4 },
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'cardInZone',
                zone: 'deck',
              },
            ],
          },
        },
      ],
    },
    // OP15-023 Arlong
    // [On K.O.] Up to 2 of your opponent's rested cards will not become active in your opponent's next Refresh Phase.
    // [Activate: Main] [Once Per Turn] You may give 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters: Give up to 1 DON!! card from its owner's cost area to its owner's Leader or 1 of their Characters.
    {
      cardId: 'OP15-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'arlong-on-ko-skip-refresh',
            text: "[On K.O.] Up to 2 of your opponent's rested cards will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 2 },
                },
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'arlong-activate-main-move-don-from-cost',
            text: "[Activate: Main] [Once Per Turn] You may give 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters: Give up to 1 DON!! card from its owner's cost area to its owner's Leader or 1 of their Characters.",
            trigger: {
              type: 'activateMain',
              optional: true,
              oncePerTurn: true,
            },
            costs: [
              {
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'either',
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
    // OP15-024 Usopp
    // [Opponent's Turn] This Character cannot be rested by your opponent's Leader and Character effects and gains [Blocker].
    // [On K.O.] Rest up to 1 of your opponent's Leader or Character cards with a cost of 7 or less.
    {
      cardId: 'OP15-024',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'usopp-opponent-turn-can-attack-active',
            text: "[Opponent's Turn] This Character cannot be rested by your opponent's Leader and Character effects and gains [Blocker].",
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
            },
            conditions: [{ type: 'controllerTurn', value: false }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'usopp-on-ko-rest-cost-7-or-less',
            text: "[On K.O.] Rest up to 1 of your opponent's Leader or Character cards with a cost of 7 or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { costMax: 7 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP15-025 Kuro
    // [Blocker]
    // [On Play] Give up to 2 DON!! cards from your opponent's cost area to 1 of your opponent's Characters. Then, at the end of this turn, up to 1 rested Character with 3 or more DON!! cards given will not become active in your opponent's next Refresh Phase.
    {
      cardId: 'OP15-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuro-on-play-move-2-don-from-cost',
            text: "[On Play] Give up to 2 DON!! cards from your opponent's cost area to 1 of your opponent's Characters.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 2 },
                },
                amount: 2,
              },
              {
                type: 'attachDon',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'opponent',
                amount: 2,
                rested: true,
              },
              {
                type: 'scheduleActionsAtTurnEnd',
                actions: [
                  {
                    type: 'skipNextRefreshPhases',
                    selector: {
                      player: 'opponent',
                      zones: ['characters'],
                      filter: { rested: true },
                      count: { kind: 'upTo', value: 1 },
                    },
                    amount: 1,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP15-026 Jango
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 {East Blue} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Activate: Main] You may trash this Character: Give up to 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters.
    {
      cardId: 'OP15-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jango-on-play-search-east-blue',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {East Blue} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['East Blue'] },
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
            id: 'jango-activate-main-trash-self-move-don',
            text: "[Activate: Main] You may trash this Character: Give up to 1 of your opponent's rested DON!! cards to 1 of your opponent's Characters.",
            trigger: { type: 'activateMain', optional: true },
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
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
              {
                type: 'attachDon',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'opponent',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP15-027 Dracule Mihawk
    // [On Play] Rest up to 1 of your opponent's Characters with a DON!! card given.
    {
      cardId: 'OP15-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mihawk-on-play-rest-with-don',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a DON!! card given.",
            trigger: { type: 'onPlay' },
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
    // OP15-028 Meowban Brothers
    // [On Play] If your Leader has the {East Blue} type, give up to 1 DON!! card from your opponent's cost area to 1 of your opponent's Characters.
    {
      cardId: 'OP15-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'meowban-brothers-on-play-move-don-if-east-blue-leader',
            text: "[On Play] If your Leader has the {East Blue} type, give up to 1 DON!! card from your opponent's cost area to 1 of your opponent's Characters.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
            actions: [
              {
                type: 'detachDon',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
              {
                type: 'attachDon',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'opponent',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP15-029 Bartholomew Kuma (OP15-029)
    // [On Play] Up to 1 of your opponent's Characters with a cost of 5 or less cannot be rested until the end of your opponent's next End Phase.
    {
      cardId: 'OP15-029',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-029-special',
        },
      ],
    },
    // OP15-030 Hyouzou
    // (no effect)
    {
      cardId: 'OP15-030',
      effects: [],
    },
    // OP15-031 Purinpurin
    // [On Play] Select up to 1 of your opponent's rested Characters. If the chosen Character has a cost equal to the number of DON!! cards given to it, K.O. it.
    {
      cardId: 'OP15-031',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-031-special',
        },
      ],
    },
    // OP15-032 Brook (OP15-032)
    // [On Play] Rest up to 1 of your opponent's cards.
    // [Activate: Main] You may trash this Character: If your Leader has the {Straw Hat Crew} type, set up to 1 of your Characters with a base cost of 8 or less as active.
    {
      cardId: 'OP15-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-032-on-play-rest-up-to-1',
            text: "[On Play] Rest up to 1 of your opponent's cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'brook-032-activate-main-trash-self-restand',
            text: '[Activate: Main] You may trash this Character: If your Leader has the {Straw Hat Crew} type, set up to 1 of your Characters with a base cost of 8 or less as active.',
            trigger: { type: 'activateMain', optional: true },
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
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMax: 8 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP15-033 Hody Jones
    // [On Play] Set your {Fish-Man} type Leader as active. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP15-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hody-jones-on-play-restand-leader-life-to-hand',
            text: '[On Play] Set your {Fish-Man} type Leader as active. Then, add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
              },
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
    // OP15-034 Yorki
    // [Your Turn] [On Play] Up to 1 of your [Brook] cards gains +2000 power during this turn.
    {
      cardId: 'OP15-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yorki-on-play-your-turn-brook-plus-2000',
            text: '[Your Turn] [On Play] Up to 1 of your [Brook] cards gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Brook'] },
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
    // OP15-035 Laboon
    // If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may rest 2 of your cards instead.
    {
      cardId: 'OP15-035',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'laboon-replacement-rest-2-instead-of-removal',
            text: "If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may rest 2 of your cards instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters', 'stage'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP15-036 Ryuma
    // [On Play]/[When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.
    {
      cardId: 'OP15-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ryuma-036-on-play-ko-rested-cost-4-or-less',
            text: "[On Play]/[When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    rested: true,
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
            id: 'ryuma-when-attacking-ko-rested-cost-4-or-less',
            text: "[When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    rested: true,
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
    // OP15-037 The Outcome Will Tell Us Who's Strong and Who's Weak
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 {East Blue} type card other than [The Outcome Will Tell Us Who's Strong and Who's Weak] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP15-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'outcome-tells-strong-weak-main-search-east-blue',
            text: "[Main] Look at 5 cards from the top of your deck; reveal up to 1 {East Blue} type card other than [The Outcome Will Tell Us Who's Strong and Who's Weak] and add it to your hand. Then, place the rest at the bottom of your deck in any order.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['East Blue'],
                  excludeName: [
                    "The Outcome Will Tell Us Who's Strong and Who's Weak",
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
            id: 'outcome-tells-strong-weak-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP15-038 It's an Order! Do Not Defy Me!!!
    // [Main] Up to 1 of your opponent's rested Characters with a cost of 8 or less that has 2 or more DON!! cards given will not become active in your opponent's next Refresh Phase.
    // [Counter] Up to 1 of your [Krieg] cards gains +4000 power during this battle.
    {
      cardId: 'OP15-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'its-an-order-main-skip-refresh',
            text: "[Main] Up to 1 of your opponent's rested Characters with a cost of 8 or less that has 2 or more DON!! cards given will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 8,
                    rested: true,
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
            id: 'its-an-order-counter-krieg-plus-4000',
            text: '[Counter] Up to 1 of your [Krieg] cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Krieg'] },
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
    // OP15-039 Rebecca (OP15-039)
    // This Leader cannot attack.
    // [Activate: Main] You may rest this Leader and return 1 of your {Dressrosa} type Characters to the owner's hand: Play up to 1 {Dressrosa} type Character card with a cost of 3 from your hand.
    {
      cardId: 'OP15-039',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'rebecca-leader-cannot-attack',
            text: 'This Leader cannot attack.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['leader'],
              },
              keywords: ['cannotAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'rebecca-leader-activate-main-rest-self-return-dressrosa-play',
            text: "[Activate: Main] You may rest this Leader and return 1 of your {Dressrosa} type Characters to the owner's hand: Play up to 1 {Dressrosa} type Character card with a cost of 3 from your hand.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Dressrosa'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
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
                    trait: ['Dressrosa'],
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
    // OP15-040 Viola
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Dressrosa} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP15-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'viola-on-play-search-dressrosa',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Dressrosa} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Dressrosa'] },
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
    // OP15-041 Orlumbus
    // [On K.O.] Draw 1 card.
    // [Activate: Main] [Once Per Turn] You may place 1 of your Characters at the bottom of the owner's deck: This Character gains [Rush] during this turn.
    {
      cardId: 'OP15-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'orlumbus-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'orlumbus-activate-main-bottom-deck-character-gain-rush',
            text: "[Activate: Main] [Once Per Turn] You may place 1 of your Characters at the bottom of the owner's deck: This Character gains [Rush] during this turn.",
            trigger: {
              type: 'activateMain',
              optional: true,
              oncePerTurn: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
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
    // OP15-042 Kyros
    // [On Play] You may trash 1 card from your hand: If your Leader is [Rebecca], this Character gains [Rush] during this turn.
    // [On K.O.] Add this Character card from your trash to your hand.
    {
      cardId: 'OP15-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kyros-on-play-trash-1-rush-if-rebecca-leader',
            text: '[On Play] You may trash 1 card from your hand: If your Leader is [Rebecca], this Character gains [Rush] during this turn.',
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
              { type: 'playerHasLeaderName', player: 'self', value: 'Rebecca' },
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
        {
          kind: 'standard',
          effect: {
            id: 'kyros-on-ko-add-self-from-trash-to-hand',
            text: '[On K.O.] Add this Character card from your trash to your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Kyros'] },
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
    // OP15-043 Kelly Funk
    // [On Play] Play up to 1 [Bobby Funk] from your hand.
    {
      cardId: 'OP15-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kelly-funk-on-play-play-bobby-funk',
            text: '[On Play] Play up to 1 [Bobby Funk] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Bobby Funk'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP15-044 Koala
    // [Blocker]
    // [On K.O.] Look at 3 cards from the top of your deck; reveal up to 1 {Dressrosa} type Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP15-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-on-ko-search-dressrosa-event',
            text: '[On K.O.] Look at 3 cards from the top of your deck; reveal up to 1 {Dressrosa} type Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { cardCategory: ['Event'], trait: ['Dressrosa'] },
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
    // OP15-045 Sai
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] You may trash 1 Event from your hand: Draw 2 cards.
    {
      cardId: 'OP15-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sai-on-play-trash-event-draw-2',
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
      ],
    },
    // OP15-046 Sabo
    // [Blocker]
    // [On Play] If your Leader has the {Dressrosa} type, activate up to 1 {Dressrosa} type Event from your hand.
    {
      cardId: 'OP15-046',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-046-special',
        },
      ],
    },
    // OP15-047 Sanji (OP15-047)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Up to 1 of your Characters gains [Unblockable] during this turn.
    // (This card cannot be blocked.)
    {
      cardId: 'OP15-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-047-on-play-grant-unblockable',
            text: '[On Play] Up to 1 of your Characters gains [Unblockable] during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
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
    // OP15-048 Chinjao
    // [On Play] You may trash 1 Event from your hand: Draw 2 cards.
    // [Opponent's Turn] [On K.O.] Your opponent places 1 card from their hand at the bottom of their deck.
    {
      cardId: 'OP15-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chinjao-on-play-trash-event-draw-2',
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
            id: 'chinjao-opponent-turn-on-ko-opponent-bottom-deck',
            text: "[Opponent's Turn] [On K.O.] Your opponent places 1 card from their hand at the bottom of their deck.",
            trigger: { type: 'onKo' },
            conditions: [{ type: 'controllerTurn', value: false }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP15-049 Hajrudin
    // (no effect)
    {
      cardId: 'OP15-049',
      effects: [],
    },
    // OP15-050 Bobby Funk
    // If you have [Kelly Funk], this Character gains +3000 power.
    {
      cardId: 'OP15-050',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'bobby-funk-has-kelly-funk-plus-3000',
            text: 'If you have [Kelly Funk], this Character gains +3000 power.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 3000,
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Kelly Funk'] },
                },
              },
            ],
          },
        },
      ],
    },
    // OP15-051 Monkey.D.Luffy (OP15-051)
    // [Opponent's Turn] If your Leader has the "Dressrosa" type, this Character gains +3000 power.
    {
      cardId: 'OP15-051',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'luffy-051-opponent-turn-dressrosa-plus-3000',
            text: '[Opponent\'s Turn] If your Leader has the "Dressrosa" type, this Character gains +3000 power.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 3000,
            },
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Dressrosa',
              },
            ],
          },
        },
      ],
    },
    // OP15-052 Leo
    // If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may place 1 of your Characters at the bottom of the owner's deck instead.
    {
      cardId: 'OP15-052',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'leo-replacement-bottom-deck-instead-of-removal',
            text: "If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may place 1 of your Characters at the bottom of the owner's deck instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
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
    // OP15-053 Rebecca (OP15-053)
    // [DON!! x1] This Character gains [Blocker].
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Dressrosa} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP15-053',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'rebecca-053-don-1-blocker',
            text: '[DON!! x1] This Character gains [Blocker].',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
            },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'rebecca-053-on-play-search-dressrosa',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Dressrosa} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Dressrosa'] },
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
    // OP15-054 And No One Else Can Have It! It's Our Memento of Him
    // [Main] If your Leader is [Lucy], choose one:
    // • Draw 2 cards and trash 1 card from your hand. Then, play up to 1 {Dressrosa} type Character card with a cost of 4 or less from your hand.
    // • Return up to 1 Stage to the owner's hand.
    {
      cardId: 'OP15-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'memento-of-him-main-choose-one',
            text: "[Main] If your Leader is [Lucy], choose one: Draw 2 cards and trash 1 card from your hand. Then, play up to 1 {Dressrosa} type Character card with a cost of 4 or less from your hand. OR Return up to 1 Stage to the owner's hand.",
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Lucy' },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'draw-trash-play',
                    label:
                      'Draw 2 cards and trash 1 card from your hand. Then, play up to 1 {Dressrosa} type Character card with a cost of 4 or less from your hand.',
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
                      {
                        type: 'play',
                        selector: {
                          player: 'self',
                          zones: ['hand'],
                          filter: {
                            cardCategory: ['Character'],
                            trait: ['Dressrosa'],
                            costMax: 4,
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destination: 'characters',
                      },
                    ],
                  },
                  {
                    id: 'return-stage',
                    label: "Return up to 1 Stage to the owner's hand.",
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'either',
                          zones: ['stage'],
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
    // OP15-055 Go Ahead and Use 'Em, Mr. Luffy!!!
    // [Main] Choose one:
    // • Draw 2 cards.
    // • Up to 1 of your {Dressrosa} type Characters gains [Blocker] until the end of your opponent's next End Phase.
    {
      cardId: 'OP15-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'go-ahead-use-em-main-choose-one',
            text: "[Main] Choose one: Draw 2 cards. OR Up to 1 of your {Dressrosa} type Characters gains [Blocker] until the end of your opponent's next End Phase.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'go-ahead-draw-2',
                    label: 'Draw 2 cards.',
                    actions: [{ type: 'draw', player: 'self', amount: 2 }],
                  },
                  {
                    id: 'grant-blocker',
                    label:
                      "Up to 1 of your {Dressrosa} type Characters gains [Blocker] until the end of your opponent's next End Phase.",
                    actions: [],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP15-056 Would You Let Me Eat the Flame-Flame Fruit?
    // [Main] Draw 2 cards. Then, your [Lucy] Leader gains [Double Attack] and +3000 power during this turn.
    // (This card deals 2 damage.)
    // [Trigger] Draw 2 cards.
    {
      cardId: 'OP15-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'flame-flame-fruit-main-draw-2-lucy-double-attack-plus-3000',
            text: '[Main] Draw 2 cards. Then, your [Lucy] Leader gains [Double Attack] and +3000 power during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Lucy'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['doubleAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Lucy'] },
                  count: { kind: 'exact', value: 1 },
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
            id: 'flame-flame-fruit-trigger-draw-2',
            text: '[Trigger] Draw 2 cards.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP15-057 Dressrosa Kingdom
    // [On Play] If your Leader has the {Dressrosa} type, draw 1 card.
    // [On Your Opponent's Attack] You may rest this Stage and trash 1 Event or Stage card from your hand: Up to 1 of your Leader or Character cards gains +2000 power during this battle.
    {
      cardId: 'OP15-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dressrosa-kingdom-on-play-draw-if-dressrosa-leader',
            text: '[On Play] If your Leader has the {Dressrosa} type, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Dressrosa',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'dressrosa-kingdom-on-attacked-rest-trash-event-stage-plus-2000',
            text: "[On Your Opponent's Attack] You may rest this Stage and trash 1 Event or Stage card from your hand: Up to 1 of your Leader or Character cards gains +2000 power during this battle.",
            trigger: { type: 'onAttacked', optional: true },
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
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Event', 'Stage'] },
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
    // OP15-058 Enel (OP15-058)
    // Under the rules of this game, your DON!! deck consists of 6 cards.
    // [Activate: Main] [Once Per Turn] If it is your second turn or later, add up to 1 DON!! card from your DON!! deck and set it as active, and add up to 4 additional DON!! cards and rest them. Then, give up to 4 rested DON!! cards to 1 of your Characters.
    {
      cardId: 'OP15-058',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-058-special',
        },
      ],
    },
    // OP15-059 Amazon
    // [On Your Opponent's Attack] You may rest this Character: Your opponent may return 1 of their active DON!! cards to their DON!! deck. If they do not, give up to 1 of your opponent's Leader or Character cards 2000 power during this turn.
    {
      cardId: 'OP15-059',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-059-special',
        },
      ],
    },
    // OP15-060 Enel (OP15-060)
    // If you have 6 or less DON!! cards on your field, this Character cannot be removed from the field by your opponent's effects and gains +2000 power.
    // [Activate: Main] DON!! 1: This Character gains [Blocker] until the end of your opponent's next End Phase. Then, trash 1 card from your hand.
    {
      cardId: 'OP15-060',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'enel-060-6-or-less-don-cannot-be-removed-plus-2000',
            text: "If you have 6 or less DON!! cards on your field, this Character cannot be removed from the field by your opponent's effects and gains +2000 power.",
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
              keywords: ['cannotBeRemovedByOpponentEffects'],
            },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 0 },
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 7,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'enel-060-activate-main-don-1-blocker-trash-hand',
            text: "[Activate: Main] DON!! 1: This Character gains [Blocker] until the end of your opponent's next End Phase. Then, trash 1 card from your hand.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [
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
    // OP15-061 Ohm
    // [On Play] DON!! 1: Draw 1 card.
    // [When Attacking] If you have 6 or less DON!! cards on your field, give up to 1 of your opponent's Characters 1000 power during this turn.
    {
      cardId: 'OP15-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ohm-on-play-don-1-draw-1',
            text: '[On Play] DON!! 1: Draw 1 card.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ohm-when-attacking-6-or-less-don-minus-1000',
            text: "[When Attacking] If you have 6 or less DON!! cards on your field, give up to 1 of your opponent's Characters 1000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 7,
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
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-062 Captain Seamars
    // (no effect)
    {
      cardId: 'OP15-062',
      effects: [],
    },
    // OP15-063 Gedatsu
    // [On Play] DON!! 1: Draw 1 card.
    // [On K.O.] If you have 6 or less DON!! cards on your field, K.O. up to 1 of your opponent's Characters with 2000 power or less.
    {
      cardId: 'OP15-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gedatsu-on-play-don-1-draw-1',
            text: '[On Play] DON!! 1: Draw 1 card.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gedatsu-on-ko-6-or-less-don-ko-2000-or-less',
            text: "[On K.O.] If you have 6 or less DON!! cards on your field, K.O. up to 1 of your opponent's Characters with 2000 power or less.",
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 7,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 2000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP15-064 Kotori
    // [Activate: Main] DON!! 2, You may rest this Character: If you have [Satori] and [Hotori], rest up to 1 of your opponent's Characters with 5000 power or less.
    {
      cardId: 'OP15-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kotori-activate-main-don-2-rest-self-satori-hotori-rest-5000-or-less',
            text: "[Activate: Main] DON!! 2, You may rest this Character: If you have [Satori] and [Hotori], rest up to 1 of your opponent's Characters with 5000 power or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
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
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Satori'] },
                },
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Hotori'] },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 5000 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP15-065 Goro
    // [On Play] Reveal 1 card from the top of your deck. If the revealed card has a cost of 2 or less, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP15-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'goro-on-play-reveal-top-if-cost-2-or-less-add-don',
            text: '[On Play] Reveal 1 card from the top of your deck. If the revealed card has a cost of 2 or less, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'revealedTop',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'revealedTop',
                filter: { costMax: 2 },
                actions: [
                  {
                    type: 'addDon',
                    player: 'self',
                    amount: 1,
                    rested: true,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP15-066 Satori
    // [On Play] DON!! 1: Draw 1 card.
    // [When Attacking] If you have 6 or less DON!! cards on your field, look at 2 cards from the top of your deck and place them at the top or bottom of your deck in any order.
    {
      cardId: 'OP15-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'satori-on-play-don-1-draw-1',
            text: '[On Play] DON!! 1: Draw 1 card.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'satori-when-attacking-6-or-less-don-arrange-top-2',
            text: '[When Attacking] If you have 6 or less DON!! cards on your field, look at 2 cards from the top of your deck and place them at the top or bottom of your deck in any order.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 7,
              },
            ],
            actions: [
              {
                type: 'arrangeDeckWindow',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
      ],
    },
    // OP15-067 Shura
    // If you have 6 or less DON!! cards on your field, this Character gains [Rush].
    // (This card can attack on the turn in which it is played.)
    // [On Play] DON!! 1: Draw 1 card.
    {
      cardId: 'OP15-067',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'shura-6-or-less-don-rush',
            text: 'If you have 6 or less DON!! cards on your field, this Character gains [Rush].',
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
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 7,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shura-on-play-don-1-draw-1',
            text: '[On Play] DON!! 1: Draw 1 card.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP15-068 Heavenly Warriors
    // If you have 6 or less DON!! cards on your field, this Character gains [Blocker].
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP15-068',
      effects: [],
    },
    // OP15-069 Nola
    // If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may return 1 DON!! card from your field to your DON!! deck instead.
    {
      cardId: 'OP15-069',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'nola-replacement-return-don-instead-of-removal',
            text: "If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may return 1 DON!! card from your field to your DON!! deck instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [
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
    // OP15-070 Fuza
    // All of your [Shura] cards and this Character gain [Unblockable].
    // (This card cannot be blocked.)
    // [Opponent's Turn] All of your [Shura] cards' base power and this Character's base power become 6000.
    {
      cardId: 'OP15-070',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'fuza-shura-unblockable',
            text: 'All of your [Shura] cards and this Character gain [Unblockable].',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'fuza-shura-unblockable-all-shura',
            text: 'All of your [Shura] cards gain [Unblockable].',
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader', 'characters'],
                filter: { name: ['Shura'] },
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-070-special',
        },
      ],
    },
    // OP15-071 Holly
    // All of your [Ohm] cards and this Character gain [Double Attack].
    // (This card deals 2 damage.)
    // [Opponent's Turn] All of your [Ohm] cards' base power and this Character's base power become 6000.
    {
      cardId: 'OP15-071',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'holly-ohm-double-attack',
            text: 'All of your [Ohm] cards and this Character gain [Double Attack].',
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
        {
          kind: 'continuous',
          effect: {
            id: 'holly-ohm-double-attack-all-ohm',
            text: 'All of your [Ohm] cards gain [Double Attack].',
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader', 'characters'],
                filter: { name: ['Ohm'] },
              },
              keywords: ['doubleAttack'],
            },
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-071-special',
        },
      ],
    },
    // OP15-072 Hotori
    // [Activate: Main] DON!! 2, You may rest this Character: If you have [Kotori] and [Satori], give up to 1 of your opponent's Characters 3000 power during this turn.
    {
      cardId: 'OP15-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hotori-activate-main-don-2-rest-self-kotori-satori-minus-3000',
            text: "[Activate: Main] DON!! 2, You may rest this Character: If you have [Kotori] and [Satori], give up to 1 of your opponent's Characters 3000 power during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
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
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Kotori'] },
                },
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Satori'] },
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
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-073 Yama
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Play up to 1 [Heavenly Warriors] with a cost of 1 or up to 1 {Vassals} type Character card with a cost of 1 from your hand.
    {
      cardId: 'OP15-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yama-on-play-heavenly-warriors-or-vassals',
            text: '[On Play] Play up to 1 [Heavenly Warriors] with a cost of 1 or up to 1 {Vassals} type Character card with a cost of 1 from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one to play:',
                choices: [
                  {
                    id: 'heavenly-warriors',
                    label: 'Play up to 1 [Heavenly Warriors] with a cost of 1',
                    actions: [
                      {
                        type: 'play',
                        selector: {
                          player: 'self',
                          zones: ['hand'],
                          filter: { name: ['Heavenly Warriors'], costMax: 1 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destination: 'characters',
                      },
                    ],
                  },
                  {
                    id: 'vassals',
                    label:
                      'Play up to 1 {Vassals} type Character card with a cost of 1',
                    actions: [
                      {
                        type: 'play',
                        selector: {
                          player: 'self',
                          zones: ['hand'],
                          filter: {
                            cardCategory: ['Character'],
                            trait: ['Vassals'],
                            costMax: 1,
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destination: 'characters',
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
    // OP15-074 Varie
    // [Main] DON!! 1: If your Leader is [Enel], draw 1 card. Then, up to 1 of your Characters gains +2 cost until the end of your opponent's next End Phase.
    // [Counter] Up to 1 of your [Enel] cards gains +2000 power during this battle.
    {
      cardId: 'OP15-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'varie-main-don-1-enel-draw-1-plus-cost',
            text: "[Main] DON!! 1: If your Leader is [Enel], draw 1 card. Then, up to 1 of your Characters gains +2 cost until the end of your opponent's next End Phase.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Enel' },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'varie-counter-enel-plus-2000',
            text: '[Counter] Up to 1 of your [Enel] cards gains +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Enel'] },
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
    // OP15-075 El Thor
    // [Main] DON!! 1: If your Leader is [Enel], up to 1 of your Leader or Character cards gains +1000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 3000 power or less.
    // [Counter] Up to 1 of your [Enel] cards gains +2000 power during this battle.
    {
      cardId: 'OP15-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'el-thor-main-don-1-enel-plus-1000-ko-3000-or-less',
            text: "[Main] DON!! 1: If your Leader is [Enel], up to 1 of your Leader or Character cards gains +1000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Enel' },
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
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 3000 },
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
            id: 'el-thor-counter-enel-plus-2000',
            text: '[Counter] Up to 1 of your [Enel] cards gains +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Enel'] },
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
    // OP15-076 Lightning Beast Kiten
    // [Main] DON!! 1: If your Leader is [Enel], draw 1 card. Then, give up to 1 of your opponent's Characters 1000 power during this turn.
    // [Counter] Up to 1 of your [Enel] cards gains +2000 power during this battle.
    {
      cardId: 'OP15-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kiten-main-don-1-enel-draw-1-minus-1000',
            text: "[Main] DON!! 1: If your Leader is [Enel], draw 1 card. Then, give up to 1 of your opponent's Characters 1000 power during this turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Enel' },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
            id: 'kiten-counter-enel-plus-2000',
            text: '[Counter] Up to 1 of your [Enel] cards gains +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Enel'] },
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
    // OP15-077 Lightning Dragon
    // [Main] DON!! 1: Draw 1 card. Then, up to 1 of your opponent's rested Characters with 6000 power or less will not become active in your opponent's next Refresh Phase.
    {
      cardId: 'OP15-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lightning-dragon-main-don-1-draw-1-skip-refresh',
            text: "[Main] DON!! 1: Draw 1 card. Then, up to 1 of your opponent's rested Characters with 6000 power or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                    rested: true,
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
    // OP15-078 Mamaragan
    // [Main] DON!! 2: Draw 1 card. Then, rest up to 1 of your opponent's Characters with 5000 power or less.
    // [Counter] Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, if you have 6 or less DON!! cards on your field, draw 1 card.
    {
      cardId: 'OP15-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mamaragan-main-don-2-draw-1-rest-5000-or-less',
            text: "[Main] DON!! 2: Draw 1 card. Then, rest up to 1 of your opponent's Characters with 5000 power or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 5000 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'mamaragan-counter-plus-1000-draw-if-don-6-or-less',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, if you have 6 or less DON!! cards on your field, draw 1 card.',
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
                duration: { type: 'untilEndOfBattle' },
              },
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 7,
              },
            ],
          },
        },
      ],
    },
    // OP15-079 Absalom
    // [On K.O.] Add up to 1 {Thriller Bark Pirates} type card from your trash to your hand.
    // [Trigger] Activate this card's [On K.O.] effect.
    {
      cardId: 'OP15-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'absalom-on-ko-add-thriller-bark-from-trash',
            text: '[On K.O.] Add up to 1 {Thriller Bark Pirates} type card from your trash to your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { trait: ['Thriller Bark Pirates'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'absalom-trigger-activate-on-ko',
            text: "[Trigger] Activate this card's [On K.O.] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP15-079',
                effectId: 'absalom-on-ko-add-thriller-bark-from-trash',
              },
            ],
          },
        },
      ],
    },
    // OP15-080 Oars
    // If you have [Gecko Moria] with 10000 power or more on your field and there are no other [Oars] cards, this Character gains +7000 power.
    // [On K.O.] You may place 3 cards from your trash at the bottom of your deck in any order: Play this Character card from your trash.
    {
      cardId: 'OP15-080',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'oars-gecko-moria-10000-plus-7000',
            text: 'If you have [Gecko Moria] with 10000 power or more on your field and there are no other [Oars] cards, this Character gains +7000 power.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 7000,
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Gecko Moria'], powerMin: 10000 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'oars-on-ko-place-3-bottom-deck-play-from-trash',
            text: '[On K.O.] You may place 3 cards from your trash at the bottom of your deck in any order: Play this Character card from your trash.',
            trigger: { type: 'onKo', optional: true },
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Oars'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP15-081 Sanji (OP15-081)
    // [On Play] If your Leader has the {Straw Hat Crew} type, trash 5 cards from the top of your deck.
    {
      cardId: 'OP15-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-081-on-play-straw-hat-trash-5',
            text: '[On Play] If your Leader has the {Straw Hat Crew} type, trash 5 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 5 }],
          },
        },
      ],
    },
    // OP15-082 Charlotte Lola
    // [On Play] Trash 3 cards from the top of your deck.
    // [On K.O.] Add up to 1 of your Character cards with a cost of 8 or less from your trash to your hand.
    {
      cardId: 'OP15-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-lola-on-play-trash-3',
            text: '[On Play] Trash 3 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-lola-on-ko-add-character-from-trash',
            text: '[On K.O.] Add up to 1 of your Character cards with a cost of 8 or less from your trash to your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { cardCategory: ['Character'], costMax: 8 },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP15-083 Spoil
    // [On Play] Trash 3 cards from the top of your deck.
    // [Activate: Main] You may trash this Character: If you have 15 or more cards in your trash, give up to 1 rested DON!! card to 1 of your Leader or Character cards.
    {
      cardId: 'OP15-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spoil-on-play-trash-3',
            text: '[On Play] Trash 3 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'spoil-activate-main-trash-self-give-don',
            text: '[Activate: Main] You may trash this Character: If you have 15 or more cards in your trash, give up to 1 rested DON!! card to 1 of your Leader or Character cards.',
            trigger: { type: 'activateMain', optional: true },
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
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 15,
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
    // OP15-084 Dr. Hogback
    // [On Play] If your Leader has the {Thriller Bark Pirates} type, trash 5 cards from the top of your deck.
    // [On K.O.] If you have 6 or less cards in your hand, draw 1 card.
    {
      cardId: 'OP15-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dr-hogback-on-play-thriller-bark-trash-5',
            text: '[On Play] If your Leader has the {Thriller Bark Pirates} type, trash 5 cards from the top of your deck.',
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
        {
          kind: 'standard',
          effect: {
            id: 'dr-hogback-on-ko-hand-6-or-less-draw-1',
            text: '[On K.O.] If you have 6 or less cards in your hand, draw 1 card.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 6,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP15-085 Tony Tony.Chopper (OP15-085)
    // [On Play] Trash 3 cards from the top of your deck.
    // [Activate: Main] You may trash this Character: If your Leader has the {Straw Hat Crew} type, add up to 1 {Straw Hat Crew} type Character card other than [Tony Tony.Chopper] from your trash to your hand.
    {
      cardId: 'OP15-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chopper-085-on-play-trash-3',
            text: '[On Play] Trash 3 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'chopper-085-activate-main-trash-self-search-straw-hat',
            text: '[Activate: Main] You may trash this Character: If your Leader has the {Straw Hat Crew} type, add up to 1 {Straw Hat Crew} type Character card other than [Tony Tony.Chopper] from your trash to your hand.',
            trigger: { type: 'activateMain', optional: true },
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
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
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
                  trait: ['Straw Hat Crew'],
                  excludeName: ['Tony Tony.Chopper'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP15-086 Nami (OP15-086)
    // [On Play] If your Leader has the {Straw Hat Crew} type, play up to 1 {Straw Hat Crew} type Character with a cost of 7 or less from your trash. The Character played with this effect gains [Rush] during this turn.
    {
      cardId: 'OP15-086',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-086-special',
        },
      ],
    },
    // OP15-087 Nico Robin (OP15-087)
    // If you have 10 or more cards in your trash, this Character gains [Blocker].
    // [On Play] Draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP15-087',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nico-robin-087-10-trash-blocker',
            text: 'If you have 10 or more cards in your trash, this Character gains [Blocker].',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-087-on-play-draw-2-trash-2',
            text: '[On Play] Draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
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
    // OP15-088 Pirates Docking Six
    // This Character gains +6 cost.
    // [On Play] You may trash 3 cards from the top of your deck: Play up to 1 {Straw Hat Crew} type Character card with a cost of 2 or less from your trash.
    {
      cardId: 'OP15-088',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'pirates-docking-six-plus-6-cost',
            text: 'This Character gains +6 cost.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              cost: 6,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'pirates-docking-six-on-play-trash-3-play-straw-hat-from-trash',
            text: '[On Play] You may trash 3 cards from the top of your deck: Play up to 1 {Straw Hat Crew} type Character card with a cost of 2 or less from your trash.',
            trigger: { type: 'onPlay', optional: true },
            costs: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Straw Hat Crew'],
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
    // OP15-089 Franky
    // (no effect)
    {
      cardId: 'OP15-089',
      effects: [],
    },
    // OP15-090 Perona
    // If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may trash 1 card from your hand instead.
    {
      cardId: 'OP15-090',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'perona-replacement-trash-hand-instead-of-removal',
            text: "If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may trash 1 card from your hand instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
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
    // OP15-091 Margarita
    // [On Play] Place up to 1 card from your opponent's trash at the bottom of the owner's deck.
    {
      cardId: 'OP15-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'margarita-on-play-bottom-deck-opponent-trash',
            text: "[On Play] Place up to 1 card from your opponent's trash at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['trash'],
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
    // OP15-092 Monkey.D.Luffy (OP15-092)
    // Apply each of the following effects based on the number of cards in your trash:
    // • If there are 10 or more cards, this Character's base power becomes 9000 and it gains +10 cost.
    // • If you have 20 or more cards, during your opponent's turn, your Leader's base power becomes 7000.
    // • If you have 30 or more cards, this Character gains +1000 power.
    {
      cardId: 'OP15-092',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'luffy-092-10-trash-base-9000-plus-10-cost',
            text: "If there are 10 or more cards, this Character's base power becomes 9000 and it gains +10 cost.",
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
              cost: 10,
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
              },
            ],
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-092-special',
        },
        {
          kind: 'continuous',
          effect: {
            id: 'luffy-092-30-trash-plus-1000',
            text: 'If you have 30 or more cards, this Character gains +1000 power.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 1000,
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 30,
              },
            ],
          },
        },
      ],
    },
    // OP15-093 The Risky Brothers
    // [Activate: Main] You may trash this Character: If you have 15 or more cards in your trash, up to 1 of your [Monkey.D.Luffy] Characters gains [Rush: Character] and the "Slash" attribute during this turn.
    {
      cardId: 'OP15-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'risky-brothers-activate-main-trash-self-luffy-rush',
            text: '[Activate: Main] You may trash this Character: If you have 15 or more cards in your trash, up to 1 of your [Monkey.D.Luffy] Characters gains [Rush] and the "Slash" attribute during this turn.',
            trigger: { type: 'activateMain', optional: true },
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
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 15,
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
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-094 Roronoa Zoro (OP15-094)
    // If your {Straw Hat Crew} type Character other than this Character would be removed from the field by your opponent's effect, you may trash this Character instead.
    // [Blocker]
    {
      cardId: 'OP15-094',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'zoro-094-replacement-trash-self-instead-of-straw-hat-removal',
            text: "If your {Straw Hat Crew} type Character other than this Character would be removed from the field by your opponent's effect, you may trash this Character instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Straw Hat Crew'],
                  },
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
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP15-095 Gum-Gum Storm
    // [Main] You may rest 1 of your DON!! cards: If you have 15 or more cards in your trash, up to 1 of your {Straw Hat Crew} type Leader or Character cards gains +3000 power during this turn.
    // [Counter] If you have 15 or more cards in your trash, up to 1 of your Leader or Character cards gains +4000 power during this battle.
    {
      cardId: 'OP15-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-storm-main-rest-don-straw-hat-plus-3000',
            text: '[Main] You may rest 1 of your DON!! cards: If you have 15 or more cards in your trash, up to 1 of your {Straw Hat Crew} type Leader or Character cards gains +3000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 15,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Straw Hat Crew'] },
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
            id: 'gum-gum-storm-counter-15-trash-plus-4000',
            text: '[Counter] If you have 15 or more cards in your trash, up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 15,
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
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP15-096 Swallow Bond en Avant
    // [Main] You may rest 1 of your DON!! cards: If your Leader has the {Straw Hat Crew} type, trash 5 cards from the top of your deck.
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.
    {
      cardId: 'OP15-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'swallow-bond-main-rest-don-straw-hat-trash-5',
            text: '[Main] You may rest 1 of your DON!! cards: If your Leader has the {Straw Hat Crew} type, trash 5 cards from the top of your deck.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 5 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'swallow-bond-counter-trash-hand-plus-3000',
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
      ],
    },
    // OP15-097 I Find It Embarrassing as a Human Being
    // [Main] If you have 10 or more cards in your trash, up to 1 of your opponent's Characters with a base cost of 5 or less cannot attack until the end of your opponent's next End Phase.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP15-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'embarrassing-main-10-trash-restrict-attack',
            text: "[Main] If you have 10 or more cards in your trash, up to 1 of your opponent's Characters with a base cost of 5 or less cannot attack until the end of your opponent's next End Phase.",
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
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'embarrassing-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP15-097',
                effectId: 'embarrassing-main-10-trash-restrict-attack',
              },
            ],
          },
        },
      ],
    },
    // OP15-098 Monkey.D.Luffy (OP15-098)
    // If your {Sky Island} type Character with 6000 base power or more would be removed from the field by your opponent, you may add 1 card from the top of your Life cards to your hand instead.
    {
      cardId: 'OP15-098',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'luffy-098-replacement-life-to-hand-instead-of-sky-island-removal',
            text: 'If your {Sky Island} type Character with 6000 base power or more would be removed from the field by your opponent, you may add 1 card from the top of your Life cards to your hand instead.',
            event: 'wouldMoveCard',
            optional: true,
            conditions: [
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Sky Island'],
                    basePowerMin: 6000,
                  },
                },
              },
            ],
            replacement: [
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
    // OP15-099 Urouge
    // [On Play] You may trash 1 {Supernovas} type card from your hand:This Character gains [Rush] during this turn.
    // [Activate: Main] You may turn 1 card from the top of your Life cards face-down: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP15-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'urouge-on-play-trash-supernovas-rush',
            text: '[On Play] You may trash 1 {Supernovas} type card from your hand: This Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Supernovas'] },
                  count: { kind: 'exact', value: 1 },
                },
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
        {
          kind: 'standard',
          effect: {
            id: 'urouge-activate-main-life-face-down-give-don',
            text: '[Activate: Main] You may turn 1 card from the top of your Life cards face-down: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', optional: true },
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
                destinationZone: 'life',
                faceDown: true,
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
    // OP15-100 Kamakiri
    // [On Play] You may trash this Character and add 1 card from the top of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 6 or less.
    {
      cardId: 'OP15-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kamakiri-on-play-trash-self-life-to-hand-ko-cost-6-or-less',
            text: "[On Play] You may trash this Character and add 1 card from the top of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 6 or less.",
            trigger: { type: 'onPlay', optional: true },
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
            ],
          },
        },
      ],
    },
    // OP15-101 Kalgara
    // [On Play] You may trash 1 card from your hand: Look at 5 cards from the top of your deck; reveal up to a total of 2 [Mont Blanc Noland] or {Shandian Warrior} type cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP15-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kalgara-on-play-trash-1-search-noland-or-shandian',
            text: '[On Play] You may trash 1 card from your hand: Look at 5 cards from the top of your deck; reveal up to a total of 2 [Mont Blanc Noland] or {Shandian Warrior} type cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Shandian Warrior'] },
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
    // OP15-102 Gan.Fall
    // If you have a {Sky Island} type Character with 7000 power or more, give this card in your hand 3 cost.
    // [On Play] Rest up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.
    {
      cardId: 'OP15-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ganfall-reduce-cost-if-sky-island-7000',
            text: 'If you have a {Sky Island} type Character with 7000 power or more, give this card in your hand 3 cost.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Sky Island'],
                    powerMin: 7000,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'registerNextPlayCostModifier',
                player: 'self',
                filter: { name: ['Gan.Fall'] },
                sourceZone: 'hand',
                amount: -1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ganfall-on-play-rest-cost-equal-or-less-opponent-life',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
            trigger: { type: 'onPlay' },
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
    // OP15-103 Genbo
    // [Trigger] Draw 1 card. Then, if you have 2 or less Life cards, play this card.
    {
      cardId: 'OP15-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'genbo-trigger-draw-1-play-if-life-2-or-less',
            text: '[Trigger] Draw 1 card. Then, if you have 2 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
          },
        },
      ],
    },
    // OP15-104 Conis
    // [On Play] If you have less Life cards than your opponent, draw 2 cards and trash 2 cards from your hand.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP15-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'conis-on-play-less-life-than-opponent-draw-2-trash-2',
            text: '[On Play] If you have less Life cards than your opponent, draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
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
            id: 'conis-trigger-draw-2-trash-1',
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
    // OP15-105 Jewelry Bonney (OP15-105)
    // If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may add 1 card from the top of your Life cards to your hand instead.
    {
      cardId: 'OP15-105',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'jewelry-bonney-replacement-life-to-hand-instead-of-removal',
            text: "If your Character with 7000 base power or less would be removed from the field by your opponent's effect, you may add 1 card from the top of your Life cards to your hand instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [
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
    // OP15-106 Octoballoon
    // [Trigger] Draw 1 card. Then, play up to 1 yellow Character or Stage card with a cost of 2 or less from your hand.
    {
      cardId: 'OP15-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'octoballoon-trigger-draw-1-play-yellow-cost-2-or-less',
            text: '[Trigger] Draw 1 card. Then, play up to 1 yellow Character or Stage card with a cost of 2 or less from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character', 'Stage'],
                    color: ['Yellow'],
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
    // OP15-107 Tony Tony.Chopper (OP15-107)
    // (no effect)
    {
      cardId: 'OP15-107',
      effects: [],
    },
    // OP15-108 Nami (OP15-108)
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Sky Island} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP15-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-108-on-play-search-sky-island',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Sky Island} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Sky Island'] },
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
    // OP15-109 Nico Robin (OP15-109)
    // [On Play] You may add 1 card from the top of your Life cards to your hand: If your Leader has the {Straw Hat Crew} type, add up to 1 card from the top of your deck to the top of your Life cards. Then, play up to 1 {Sky Island} type Character card with a cost of 5 or less from your hand.
    {
      cardId: 'OP15-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-109-on-play-life-to-hand-deck-to-life-play-sky-island',
            text: '[On Play] You may add 1 card from the top of your Life cards to your hand: If your Leader has the {Straw Hat Crew} type, add up to 1 card from the top of your deck to the top of your Life cards. Then, play up to 1 {Sky Island} type Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'onPlay', optional: true },
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
                destinationZone: 'hand',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Sky Island'],
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
    // OP15-110 Braham
    // [On K.O.] If your Leader has the {Shandian Warrior} type, add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP15-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'braham-on-ko-shandian-warrior-deck-to-life',
            text: '[On K.O.] If your Leader has the {Shandian Warrior} type, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Shandian Warrior',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
      ],
    },
    // OP15-111 Mont Blanc Noland
    // [DON!! x1] [When Attacking] Up to 1 of your [Kalgara] cards gains [Rush] during this turn.
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP15-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mont-blanc-noland-don-1-when-attacking-kalgara-rush',
            text: '[DON!! x1] [When Attacking] Up to 1 of your [Kalgara] cards gains [Rush] during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Kalgara'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP15-112 Raki
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Play up to 1 {Shandian Warrior} type Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP15-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'raki-on-play-play-shandian-warrior-cost-3-or-less',
            text: '[On Play] Play up to 1 {Shandian Warrior} type Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Shandian Warrior'],
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
    // OP15-113 Roronoa Zoro (OP15-113)
    // [On Play] You may trash 1 card from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP15-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zoro-113-on-play-trash-1-deck-to-life',
            text: '[On Play] You may trash 1 card from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.',
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
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
      ],
    },
    // OP15-114 Wyper
    // [On Play] You may turn 1 card from the top of your Life cards face-up: Give all of your opponent's Characters 2000 power during this turn. Then, K.O. all of your opponent's Characters with 0 power or less.
    // [Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your {Sky Island} type Leader or Character cards.
    {
      cardId: 'OP15-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'wyper-on-play-life-face-up-all-opponent-minus-2000-ko-0-power',
            text: "[On Play] You may turn 1 card from the top of your Life cards face-up: Give all of your opponent's Characters 2000 power during this turn. Then, K.O. all of your opponent's Characters with 0 power or less.",
            trigger: { type: 'onPlay', optional: true },
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
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'koAllCharacters',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 0 },
                },
                excludeSource: true,
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'wyper-activate-main-give-rested-don-sky-island',
            text: '[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your {Sky Island} type Leader or Character cards.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Sky Island'] },
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
    // OP15-115 Impact Dial
    // [Main] K.O. up to 1 of your opponent's Characters with a cost of 4 or less. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP15-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'impact-dial-main-ko-cost-4-or-less-life-to-hand',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost of 4 or less. Then, add 1 card from the top of your Life cards to your hand.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
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
    // OP15-116 Gum-Gum Golden Rifle
    // [Main] If your Leader has the {Straw Hat Crew} type, trash 1 card from the top of your Life cards. Then, add up to 1 card from the top of your deck to the top of your Life cards and trash 1 card from your hand.
    // [Counter] Your Leader gains +4000 power during this battle.
    {
      cardId: 'OP15-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'golden-rifle-main-straw-hat-trash-life-deck-to-life-trash-hand',
            text: '[Main] If your Leader has the {Straw Hat Crew} type, trash 1 card from the top of your Life cards. Then, add up to 1 card from the top of your deck to the top of your Life cards and trash 1 card from your hand.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
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
                destinationZone: 'trash',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
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
        {
          kind: 'standard',
          effect: {
            id: 'golden-rifle-counter-leader-plus-4000',
            text: '[Counter] Your Leader gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
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
    // OP15-117 Heso!!
    // [Main] Draw 1 card. Then, give up to 1 rested DON!! card to 1 of your {Sky Island} type Leader or Character cards.
    // [Trigger] If your Leader has the {Sky Island} type, draw 2 cards.
    {
      cardId: 'OP15-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'heso-main-draw-1-give-don-sky-island',
            text: '[Main] Draw 1 card. Then, give up to 1 rested DON!! card to 1 of your {Sky Island} type Leader or Character cards.',
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Sky Island'] },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'heso-trigger-sky-island-leader-draw-2',
            text: '[Trigger] If your Leader has the {Sky Island} type, draw 2 cards.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Sky Island',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP15-118 Enel (OP15-118)
    // If you have 6 or less DON!! cards on your field, this Character cannot be removed from the field by your opponent's effects and gains +2000 power.
    // [On Play] DON!! 1: Look at 5 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the bottom of your deck in any order, and trash 1 card from your hand.
    {
      cardId: 'OP15-118',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'enel-118-6-or-less-don-cannot-be-removed-plus-2000',
            text: "If you have 6 or less DON!! cards on your field, this Character cannot be removed from the field by your opponent's effects and gains +2000 power.",
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
              keywords: ['cannotBeRemovedByOpponentEffects'],
            },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 7,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'enel-118-on-play-don-1-search-5-add-1-trash-1',
            text: '[On Play] DON!! 1: Look at 5 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the bottom of your deck in any order, and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {},
                count: { kind: 'upTo', value: 1 },
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
    // OP15-119 Monkey.D.Luffy (OP15-119)
    // If you have 6 or more DON!! cards on your field, this Character gains [Rush].
    // When your opponent activates an Event or [Blocker], reveal up to 1 card from the top of your Life cards. This Character gains +1000 power during this turn per 1 cost on the revealed card.
    {
      cardId: 'OP15-119',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'luffy-119-6-or-more-don-rush',
            text: 'If you have 6 or more DON!! cards on your field, this Character gains [Rush].',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['rush'],
            },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 6 },
            ],
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op15-119-special',
        },
      ],
    },
  ],
};
