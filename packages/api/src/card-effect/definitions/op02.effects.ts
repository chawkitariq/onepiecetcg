import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op02EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP02',
  cards: [
    // OP02-004 Edward.Newgate (OP02-004) (Alternate Art)
    // [On Play] Up to 1 of your Leader gains +2000 power until the start of your next turn. Then, you cannot add Life cards to your hand using your own effects during this turn.[DON!! x2] [When Attacking] K.O. up to 1 of your opponents Characters with 3000 power or less.
    {
      cardId: 'OP02-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-newgate-004-on-play-plus-2000-until-next-turn-and-prevent-own-life-to-hand',
            text: '[On Play] Up to 1 of your Leader gains +2000 power until the start of your next turn. Then, you cannot add Life cards to your hand using your own effects during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'preventOwnEffectLifeToHand',
                player: 'self',
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'edward-newgate-004-don-2-when-attacking-ko-3000-or-less',
            text: "[DON!! x2] [When Attacking] K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
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
    // OP02-099 Sakazuki (Alternate Art)
    // [On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponents Characters with a cost of 5 or less.
    {
      cardId: 'OP02-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-on-play-trash-1-ko-cost-5-or-less',
            text: "[On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
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
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP02-085 Magellan (085) (Alternate Art)
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Your opponent returns 1 DON!! card from their field to their DON!! deck. [Opponents Turn] When this Character is K.O.d, your opponent returns 2 DON!! cards from their field to their DON!! deck.
    {
      cardId: 'OP02-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'magellan-085-on-play-remove-1-opponent-remove-1-don',
            text: "[On Play] DON!! -1: Your opponent returns 1 DON!! card from their field to their DON!! deck.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [{ type: 'removeDon', player: 'opponent', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'magellan-085-opponents-turn-on-ko-opponent-remove-2-don',
            text: "[Opponents Turn] When this Character is K.O.d, your opponent returns 2 DON!! cards from their field to their DON!! deck.",
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'eventPlayerIs', player: 'self' },
            ],
            actions: [{ type: 'removeDon', player: 'opponent', amount: 2 }],
          },
        },
      ],
    },
    // OP02-120 Uta (Alternate Art)
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Your Leader and all of your Characters gain +1000 power until the start of your next turn.
    {
      cardId: 'OP02-120',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uta-120-on-play-remove-2-leader-and-characters-plus-1000-until-next-turn',
            text: '[On Play] DON!! -2: Your Leader and all of your Characters gain +1000 power until the start of your next turn.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP02-013 Portgas.D.Ace (Manga)
    // [On Play] Give up to 2 of your opponents Characters -3000 power during this turn. Then, if your Leaders type includes "Whitebeard Pirates", this Character gains [Rush] during this turn. (This card can attack on the turn in which it is played.)Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP02-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-on-play-minus-3000-up-to-2',
            text: "[On Play] Give up to 2 of your opponent's Characters -3000 power during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 2 },
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
            id: 'portgas-d-ace-on-play-gain-rush',
            text: 'Then, if your Leader\'s type includes "Whitebeard Pirates", this Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
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
    // OP02-048 Land of Wano
    // [Activate:Main] You may trash 1 [Land of Wano] type card from your hand and rest this Stage: Set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP02-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'land-of-wano-activate-main-trash-1-rest-self-unrest-don',
            text: '[Activate:Main] You may trash 1 [Land of Wano] type card from your hand and rest this Stage: Set up to 1 of your DON!! cards as active.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
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
      ],
    },
    // OP02-092 Impel Down
    // [Activate:Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 [Impel Down] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP02-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'impel-down-stage-activate-main-trash-1-rest-self-search-top-3',
            text: '[Activate:Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 [Impel Down] type card and add it to your hand.',
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
                  source: 'effectSource',
                  zones: ['stage'],
                  filter: { rested: false },
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
                filter: { trait: ['Impel Down'] },
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
    // OP02-070 New Kama Land
    // [Activate:Main] You may rest this Stage: If your Leader is [Emporio.Ivankov], draw 1 card and trash 1 card from your hand. Then, trash up to 3 cards from your hand.
    {
      cardId: 'OP02-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'new-kama-land-activate-main-rest-self-ivankov-hand-cycle',
            text: '[Activate:Main] You may rest this Stage: If your Leader is [Emporio.Ivankov], draw 1 card and trash 1 card from your hand. Then, trash up to 3 cards from your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Emporio.Ivankov',
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
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 3 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP02-024 Moby Dick
    // [Your Turn] If you have 1 or less Life cards, your [Edward.Newgate] and all your Characters with a type including "Whitebeard Pirates" gain +2000 power. [Trigger] Play this card.
    {
      cardId: 'OP02-024',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'moby-dick-your-turn-edward-newgate-plus-2000',
            text: '[Your Turn] If you have 1 or less Life cards, your [Edward.Newgate] gains +2000 power.',
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader'],
                filter: { name: ['Edward.Newgate'] },
              },
              power: 2000,
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'moby-dick-your-turn-whitebeard-pirates-plus-2000',
            text: '[Your Turn] If you have 1 or less Life cards, all your Characters with a type including "Whitebeard Pirates" gain +2000 power.',
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Whitebeard Pirates'],
                },
              },
              power: 2000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'moby-dick-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Moby Dick'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // OP02-117 Ice Age
    // [Main] Give up to 1 of your opponents Characters -5 cost during this turn. [Trigger] K.O. up to 1 of your opponents Characters with a cost of 3 or less.
    {
      cardId: 'OP02-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ice-age-trigger-ko-cost-3-or-less',
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
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP02-066 Impel Down All Stars
    // [Main] You may trash 2 cards from your hand: If your Leader has the [Impel Down] type, draw up to 2 cards. [Trigger] Draw 2 cards.
    {
      cardId: 'OP02-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'impel-down-all-stars-main-trash-2-draw-2',
            text: '[Main] You may trash 2 cards from your hand: If your Leader has the [Impel Down] type, draw up to 2 cards.',
            trigger: { type: 'onEventActivated', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
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
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'impel-down-all-stars-trigger-draw-2',
            text: '[Trigger] Draw 2 cards.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP02-068 Gum-Gum Rain (Alternate Art)
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.[Trigger] Return up to 1 Character with a cost of 2 or less to the owners hand.
    {
      cardId: 'OP02-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-rain-counter-trash-1-plus-3000',
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
            id: 'gum-gum-rain-trigger-return-cost-2-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 2 or less to the owner's hand.",
            trigger: { type: 'trigger' },
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP02-021 Seaquake
    // [Main] If your Leaders type includes "Whitebeard Pirates", K.O. up to 1 of your opponents Characters with 3000 power or less. [Trigger] Give up to 1 of your opponents Leader or Character cards -3000 power during this turn.
    {
      cardId: 'OP02-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'seaquake-main-whitebeard-ko-power-3000-or-less',
            text: '[Main] If your Leader\'s type includes "Whitebeard Pirates", K.O. up to 1 of your opponent\'s Characters with 3000 power or less.',
            trigger: { type: 'onEventActivated' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
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
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'seaquake-trigger-minus-3000',
            text: "[Trigger] Give up to 1 of your opponent's Leader or Character cards -3000 power during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
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
    // OP02-069 DEATH WINK
    // [Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle. Then, draw cards so that you have 2 cards in your hand. [Trigger] Return up to 1 Character with a cost of 7 or less to the owners hand.
    {
      cardId: 'OP02-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'death-wink-counter-plus-6000-then-draw-until-2',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle. Then, draw cards so that you have 2 cards in your hand.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 6000,
                duration: { type: 'untilEndOfBattle' },
              },
              { type: 'drawUntilHandSize', player: 'self', size: 2 },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'death-wink-trigger-return-cost-7-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 7 or less to the owners hand.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
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
    // OP02-022 Whitebeard Pirates
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 Character card with a type including "Whitebeard Pirates" and add it to your hand. Then, place the rest at the bottom of your deck in any order. [Trigger] Activate this cards [Main] effect.
    {
      cardId: 'OP02-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'whitebeard-pirates-main-search-top-5',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 Character card with a type including "Whitebeard Pirates" and add it to your hand.',
            trigger: { type: 'onEventActivated' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Whitebeard Pirates'],
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
            id: 'whitebeard-pirates-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP02-022',
                effectId: 'whitebeard-pirates-main-search-top-5',
              },
            ],
          },
        },
      ],
    },
    // OP02-067 Arabesque Brick Fist
    // [Main] Return up to 1 Character with a cost of 4 or less to the owners hand. [Trigger] Activate this cards [Main] effect.
    {
      cardId: 'OP02-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'arabesque-brick-fist-main-return-cost-4-or-less',
            text: "[Main] Return up to 1 Character with a cost of 4 or less to the owner's hand.",
            trigger: { type: 'onEventActivated' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
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
        {
          kind: 'standard',
          effect: {
            id: 'arabesque-brick-fist-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP02-067',
                effectId: 'arabesque-brick-fist-main-return-cost-4-or-less',
              },
            ],
          },
        },
      ],
    },
    // OP02-089 Judgment of Hell
    // [Counter] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Give up to a total of 2 of your opponents Leader or Character cards -3000 power during this turn. [Trigger] If your opponent has 6 or more DON!! cards on their field, your opponent returns 1 DON!! card from their field to their DON!! deck.
    {
      cardId: 'OP02-089',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'judgment-of-hell-counter-remove-1-minus-3000-up-to-2',
            text: '[Counter] DON!! -1: Give up to a total of 2 of your opponents Leader or Character cards -3000 power during this turn.',
            trigger: { type: 'activateCounter' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 2 },
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
            id: 'judgment-of-hell-trigger-opponent-remove-1-don',
            text: '[Trigger] If your opponent has 6 or more DON!! cards on their field, your opponent returns 1 DON!! card from their field to their DON!! deck.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'opponent', value: 6 },
            ],
            actions: [{ type: 'removeDon', player: 'opponent', amount: 1 }],
          },
        },
      ],
    },
    // OP02-047 Paradise Totsuka
    // [Main] Rest up to 1 of your opponents Characters with a cost of 4 or less. [Trigger] K.O. up to 1 of your opponents rested Characters with a cost of 3 or less.
    {
      cardId: 'OP02-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'paradise-totsuka-main-rest-cost-4-or-less',
            text: "[Main] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onEventActivated' },
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
            id: 'paradise-totsuka-trigger-ko-rested-cost-3-or-less',
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
                    costMax: 3,
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
    // OP02-119 Meteor Volcano
    // [Main] K.O. up to 1 of your opponents Characters with a cost of 1 or less. [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP02-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'meteor-volcano-main-ko-cost-1-or-less',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'onEventActivated' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
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
            id: 'meteor-volcano-trigger-draw-2-trash-1',
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
    // OP02-091 Venom Road
    // [Main] Add up to 1 DON!! card from your DON!! deck and set it as active. [Trigger] If your opponent has 6 or more DON!! cards on their field, your opponent returns 1 DON!! card from their field to their DON!! deck.
    {
      cardId: 'OP02-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'venom-road-main-add-active-don',
            text: '[Main] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onEventActivated' },
            actions: [{ type: 'addDon', player: 'self', amount: 1, rested: false }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'venom-road-trigger-opponent-remove-1-don',
            text: "[Trigger] If your opponent has 6 or more DON!! cards on their field, your opponent returns 1 DON!! card from their field to their DON!! deck.",
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'opponent', value: 6 },
            ],
            actions: [{ type: 'removeDon', player: 'opponent', amount: 1 }],
          },
        },
      ],
    },
    // OP02-046 Diable Jambe Venaison Shoot
    // [Main] K.O. up to 1 of your opponents rested Characters with a cost of 4 or less. [Trigger] Play up to 1 Character card with a cost of 4 or less and no base effect from your hand.
    {
      cardId: 'OP02-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'diable-jambe-venaison-shoot-main-ko-rested-cost-4-or-less',
            text: "[Main] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'onEventActivated' },
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
            id: 'diable-jambe-venaison-shoot-trigger-play-no-base-effect-cost-4-or-less',
            text: '[Trigger] Play up to 1 Character card with a cost of 4 or less and no base effect from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    hasNoBaseEffect: true,
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
    // OP02-045 Three Sword Style Oni Giri
    // [Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle. Then, play up to 1 Character card with a cost of 3 or less and no base effect from your hand. [Trigger] Rest up to 1 of your opponents Leader or Character cards with a cost of 5 or less.
    {
      cardId: 'OP02-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'three-sword-style-oni-giri-counter-plus-6000-then-play-no-base-effect-cost-3-or-less',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle. Then, play up to 1 Character card with a cost of 3 or less and no base effect from your hand.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 6000,
                duration: { type: 'untilEndOfBattle' },
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                    hasNoBaseEffect: true,
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
            id: 'three-sword-style-oni-giri-trigger-rest-cost-5-or-less',
            text: "[Trigger] Rest up to 1 of your opponents Leader or Character cards with a cost of 5 or less.",
            trigger: { type: 'trigger' },
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
    // OP02-023 You May Be a Fool...but I Still Love You
    // [Main] If you have 3 or less Life cards, you cannot add Life cards to your hand using your own effects during this turn. [Trigger] Up to 1 of your Leader gains +1000 power during this turn.
    {
      cardId: 'OP02-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'you-may-be-a-fool-main-if-life-3-or-less-prevent-own-life-to-hand',
            text: '[Main] If you have 3 or less Life cards, you cannot add Life cards to your hand using your own effects during this turn.',
            trigger: { type: 'onEventActivated' },
            conditions: [{ type: 'playerHasLifeAtMost', player: 'self', value: 3 }],
            actions: [
              {
                type: 'preventOwnEffectLifeToHand',
                player: 'self',
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'you-may-be-a-fool-trigger-leader-plus-1000',
            text: '[Trigger] Up to 1 of your Leader gains +1000 power during this turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP02-118 Yasakani Sacred Jewel
    // [Counter] You may trash 1 card from your hand: Select up to 1 of your Characters. The selected Character cannot be K.O.d during this battle. [Trigger] K.O. up to 1 of your opponents Stages with a cost of 3 or less.
    {
      cardId: 'OP02-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yasakani-sacred-jewel-counter-trash-1-cannot-be-koed-in-battle',
            text: '[Counter] You may trash 1 card from your hand: Select up to 1 of your Characters. The selected Character cannot be K.O.d during this battle.',
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
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotBeKoedInBattle'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'yasakani-sacred-jewel-trigger-trash-stage-cost-3-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Stages with a cost of 3 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['stage'],
                  filter: { cardCategory: ['Stage'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP02-090 Hydra
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Give up to 1 of your opponents Characters -3000 power during this turn. [Trigger] If your opponent has 6 or more DON!! cards on their field, your opponent returns 1 DON!! card from their field to their DON!! deck.
    {
      cardId: 'OP02-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hydra-main-remove-1-minus-3000',
            text: "[Main] DON!! -1: Give up to 1 of your opponent's Characters -3000 power during this turn.",
            trigger: { type: 'onEventActivated' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
            id: 'hydra-trigger-opponent-remove-1-don',
            text: '[Trigger] If your opponent has 6 or more DON!! cards on their field, your opponent returns 1 DON!! card from their field to their DON!! deck.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'opponent', value: 6 },
            ],
            actions: [{ type: 'removeDon', player: 'opponent', amount: 1 }],
          },
        },
      ],
    },
    // OP02-072 Zephyr (Alternate Art)
    // [When Attacking] DON!! -4 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponents Characters with a cost of 3 or less. Then, this Leader gains +1000 power during this turn.
    {
      cardId: 'OP02-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zephyr-when-attacking-remove-4-ko-cost-3-or-less-then-plus-1000',
            text: "[When Attacking] DON!! -4: K.O. up to 1 of your opponent's Characters with a cost of 3 or less. Then, this Leader gains +1000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 4 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['leader'],
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
    // OP02-002 Monkey.D.Garp (002) (Alternate Art)
    // [Your Turn] When this Leader or 1 of your Characters is given a DON!! card, give up to 1 of your opponents Characters with a cost of 7 or less -1 cost during this turn.
    {
      cardId: 'OP02-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-002-on-don-attached-minus-1-cost-to-7-or-less',
            text: "[Your Turn] When this Leader or 1 of your Characters is given a DON!! card, give up to 1 of your opponent's Characters with a cost of 7 or less -1 cost during this turn.",
            trigger: { type: 'onDonAttached' },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP02-001 Edward.Newgate (OP02-001)
    // [End of Your Turn] Add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP02-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-newgate-end-of-turn-add-top-life-to-hand',
            text: '[End of Your Turn] Add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            actions: [
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
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
    // OP02-026 Sanji (Alternate Art)
    // [Once Per Turn] When you play a Character with no base effect from your hand, if you have 3 or less Characters, set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP02-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-026-on-character-played-no-base-effect-unrest-up-to-2-don',
            text: '[Once Per Turn] When you play a Character with no base effect from your hand, if you have 3 or less Characters, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onCharacterPlayed', oncePerTurn: true },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              { type: 'eventSourceHasNoBaseEffect' },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 3,
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP02-093 Smoker (OP02-093)
    // [DON!! x1] [Activate: Main] [Once Per Turn] Give up to 1 of your opponents Characters 1 cost during this turn. Then, if there is a Character with a cost of 0, this Leader gains +1000 power during this turn.
    {
      cardId: 'OP02-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'smoker-093-don-1-activate-main-once-per-turn-minus-1-cost-then-plus-1000',
            text: "[DON!! x1] [Activate: Main] [Once Per Turn] Give up to 1 of your opponent's Characters -1 cost during this turn. Then, if there is a Character with a cost of 0, this Leader gains +1000 power during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['leader'],
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
    // OP02-049 Emporio.Ivankov (049) (Alternate Art)
    // [End of Your Turn] If you have 0 cards in your hand, draw 2 cards.
    {
      cardId: 'OP02-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emporio-ivankov-end-of-turn-draw-2-if-hand-empty',
            text: '[End of Your Turn] If you have 0 cards in your hand, draw 2 cards.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 0,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP02-071 Magellan (071) (Alternate Art)
    // [Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, this Leader gains +1000 power during this turn.
    {
      cardId: 'OP02-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'magellan-071-on-don-returned-plus-1000',
            text: '[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, this Leader gains +1000 power during this turn.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['leader'],
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
    // OP02-025 Kinemon (Alternate Art)
    // [Activate:Main] [Once Per Turn] If you have 1 or less Characters, the next time you play a [Land of Wano] type Character card with a cost of 3 or more from your hand during this turn, the cost will be reduced by 1.
    {
      cardId: 'OP02-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kinemon-025-activate-main-next-land-of-wano-cost-reduced-by-1',
            text: '[Activate:Main] [Once Per Turn] If you have 1 or less Characters, the next time you play a [Land of Wano] type Character card with a cost of 3 or more from your hand during this turn, the cost will be reduced by 1.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 1,
              },
            ],
            actions: [
              {
                type: 'registerNextPlayCostModifier',
                player: 'self',
                sourceZone: 'hand',
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Land of Wano'],
                  costMin: 3,
                },
                amount: -1,
              },
            ],
          },
        },
      ],
    },
    // OP02-106 Tsuru
    // [On Play] Give up to 1 of your opponents Characters 2 cost during this turn.
    {
      cardId: 'OP02-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tsuru-on-play-minus-2-cost',
            text: "[On Play] Give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
    // OP02-096 Kuzan (OP02-096) (Alternate Art)
    // [On Play] Draw 1 card.[When Attacking] Give up to 1 of your opponents Characters -4 cost during this turn.
    {
      cardId: 'OP02-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-096-on-play-draw-1',
            text: '[On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-096-when-attacking-minus-4-cost',
            text: "[When Attacking] Give up to 1 of your opponent's Characters -4 cost during this turn.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -4,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP02-114 Borsalino (Alternate Art)
    // [Opponents Turn] This Character gains +1000 power and cannot be K.O.d by effects.[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-114',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'borsalino-114-opponents-turn-plus-1000',
            text: '[Opponents Turn] This Character gains +1000 power.',
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 1000,
            },
          },
        },
        {
          kind: 'replacement',
          effect: {
            id: 'borsalino-114-cannot-be-koed-by-effects',
            text: 'This Character cannot be K.O.d by effects.',
            event: 'wouldKoCharacter',
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [],
          },
        },
      ],
    },
    // OP02-121 Kuzan (OP02-121) (Alternate Art)
    // [Your Turn] Give all of your opponents Characters -5 cost.[On Play] K.O. up to 1 of your opponents Characters with a cost of 0.
    {
      cardId: 'OP02-121',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kuzan-121-your-turn-all-opponents-characters-minus-5-cost',
            text: "[Your Turn] Give all of your opponent's Characters -5 cost.",
            conditions: [{ type: 'controllerTurn', value: true }],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              cost: -5,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-121-on-play-ko-cost-0',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with a cost of 0.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                    costMin: 0,
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
    // OP02-110 Hina
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Block] Select up to 1 of your opponents Characters with a cost of 6 or less. The selected Character cannot attack during this turn.
    {
      cardId: 'OP02-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hina-on-block-restrict-attack-cost-6-or-less',
            text: "[On Block] Select up to 1 of your opponent's Characters with a cost of 6 or less. The selected Character cannot attack during this turn.",
            trigger: { type: 'onBlock' },
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 0,
              },
            ],
          },
        },
      ],
    },
    // OP02-098 Koby
    // [On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponents Characters with a cost of 3 or less.
    {
      cardId: 'OP02-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koby-on-play-trash-1-ko-cost-3-or-less',
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
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP02-115 Monkey.D.Garp (115) (Alternate Art)
    // [DON!! x2] [When Attacking] K.O. up to 1 of your opponents Characters with a cost of 0.
    {
      cardId: 'OP02-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-115-when-attacking-ko-cost-0',
            text: "[DON!! x2] [When Attacking] K.O. up to 1 of your opponent's Characters with a cost of 0.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                    costMin: 0,
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
    // OP02-112 Bell-mere
    // [Activate:Main] You may rest this Character: Give up to 1 of your opponents Characters -1 cost during this turn. Then, up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP02-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bell-mere-activate-main-rest-self-minus-1-cost-then-plus-1000',
            text: "[Activate:Main] You may rest this Character: Give up to 1 of your opponent's Characters -1 cost during this turn. Then, up to 1 of your Leader or Character cards gains +1000 power during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
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
                amount: -1,
                duration: { type: 'untilEndOfTurn' },
              },
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
    // OP02-103 Sengoku
    // [DON!! x1] [When Attacking] Give up to 1 of your opponents Characters -2 cost during this turn.
    {
      cardId: 'OP02-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sengoku-don-1-when-attacking-minus-2-cost',
            text: "[DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
    // OP02-102 Smoker (102)
    // This Character cannot be K.O.d by effects. [When Attacking] If there is a Character with a cost of 0, this Character gains +2000 power during this battle.
    {
      cardId: 'OP02-102',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'smoker-102-cannot-be-koed-by-effects',
            text: 'This Character cannot be K.O.d by effects.',
            event: 'wouldKoCharacter',
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'smoker-102-when-attacking-if-cost-0-plus-2000',
            text: '[When Attacking] If there is a Character with a cost of 0, this Character gains +2000 power during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                    costMin: 0,
                  },
                },
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
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP02-105 Tashigi (Box Topper)
    // [DON!! x1] [When Attacking] Give up to 1 of your opponents Characters -3 cost during this turn.
    {
      cardId: 'OP02-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tashigi-don-1-when-attacking-minus-3-cost',
            text: "[DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters -3 cost during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
      ],
    },
    // OP02-108 Donquixote Rosinante
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-108',
      effects: [],
    },
    // OP02-113 Helmeppo
    // [When Attacking] Give up to 1 of your opponents Characters 2 cost during this turn. Then, if there is a Character with a cost of 0, this Character gains +2000 power during this battle.
    // [Trigger] Play this card.
    {
      cardId: 'OP02-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'helmeppo-when-attacking-if-cost-0-plus-2000',
            text: '[When Attacking] Then, if there is a Character with a cost of 0, this Character gains +2000 power during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                    costMin: 0,
                  },
                },
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
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'helmeppo-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Helmeppo'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP02-101 Strawberry
    // [When Attacking] If there is a Character with a cost of 0, your opponent cannot activate the [Blocker] of any Character with a cost of 5 or less during this battle.
    {
      cardId: 'OP02-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'strawberry-when-attacking-if-cost-0-opponent-cost-5-or-less-cannot-block',
            text: '[When Attacking] If there is a Character with a cost of 0, your opponent cannot activate the [Blocker] of any Character with a cost of 5 or less during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                    costMin: 0,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP02-094 Isuka
    // [DON!! x1] [Once Per Turn] When this Character battles and K.O.s your opponents Character, set this Character as active.
    {
      cardId: 'OP02-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'isuka-on-battle-ko-unrest-self',
            text: "[DON!! x1] [Once Per Turn] When this Character battles and K.O.'s your opponent's Character, set this Character as active.",
            trigger: { type: 'onBattleKo', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // OP02-100 Jango
    // If you have [Fullbody], this Character cannot be K.O.d in battle.
    {
      cardId: 'OP02-100',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'jango-if-you-have-fullbody-cannot-be-koed-in-battle',
            text: 'If you have [Fullbody], this Character cannot be K.O.d in battle.',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Fullbody'] },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // OP02-111 Fullbody
    // [When Attacking] If you have [Jango], this card gains +3000 power during this battle.
    {
      cardId: 'OP02-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fullbody-when-attacking-if-you-have-jango-plus-3000',
            text: '[When Attacking] If you have [Jango], this card gains +3000 power during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Jango'] },
                },
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
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP02-095 Onigumo
    // If there is a Character with a cost of 0, this Character gains [Banish]. (When this card deals damage, the target card is trashed without activating its Trigger.)
    {
      cardId: 'OP02-095',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'onigumo-if-there-is-a-cost-0-character-gains-banish',
            text: 'If there is a Character with a cost of 0, this Character gains [Banish].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                    costMin: 0,
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
              keywords: ['banish'],
            },
          },
        },
      ],
    },
    // OP02-104 Sentomaru
    // [Trigger] Play this card.
    {
      cardId: 'OP02-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sentomaru-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Sentomaru'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP02-063 Mr.1 (Daz.Bonez)
    // [On Play] Add up to 1 blue Event card with a cost of 1 from your trash to your hand.
    {
      cardId: 'OP02-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-1-daz-bonez-on-play-recover-blue-event-cost-1',
            text: '[On Play] Add up to 1 blue Event card with a cost of 1 from your trash to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Event'],
                  color: ['Blue'],
                  costMax: 1,
                  costMin: 1,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP02-058 Buggy (Alternate Art)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 blue [Impel Down] type card other than [Buggy] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP02-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buggy-on-play-search-top-5-blue-impel-down',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 blue [Impel Down] type card other than [Buggy] and add it to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  color: ['Blue'],
                  trait: ['Impel Down'],
                  excludeName: ['Buggy'],
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
    // OP02-051 Emporio.Ivankov (051) (Alternate Art)
    // [On Play] Draw card(s) so that you have 3 cards in your hand and then play up to 1 blue [Impel Down] type Character card with a cost of 6 or less from your hand.
    {
      cardId: 'OP02-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emporio-ivankov-051-on-play-draw-until-3-then-play-blue-impel-down-cost-6-or-less',
            text: '[On Play] Draw card(s) so that you have 3 cards in your hand and then play up to 1 blue [Impel Down] type Character card with a cost of 6 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'drawUntilHandSize', player: 'self', size: 3 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Blue'],
                    trait: ['Impel Down'],
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
    // OP02-062 Monkey.D.Luffy (062) (Alternate Art)
    // [On Play] / [When Attacking] You may trash 2 cards from your hand: Return up to 1 Character with a cost of 4 or less to the owners hand. Then, this Character gains [Double Attack] during this turn. (This card deals 2 damage.)
    {
      cardId: 'OP02-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-on-play-trash-2-return-cost-4-or-less-gain-double-attack',
            text: '[On Play] You may trash 2 cards from your hand: Return up to 1 Character with a cost of 4 or less to the owner\'s hand. Then, this Character gains [Double Attack] during this turn.',
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
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['doubleAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-when-attacking-trash-2-return-cost-4-or-less-gain-double-attack',
            text: '[When Attacking] You may trash 2 cards from your hand: Return up to 1 Character with a cost of 4 or less to the owner\'s hand. Then, this Character gains [Double Attack] during this turn.',
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
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['doubleAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP02-064 Mr.2.Bon.Kurei (Bentham)
    // [DON!! x1] [When Attacking] You may trash 1 card from your hand: Place up to 1 Character with a cost of 2 or less at the bottom of the owners deck. Then, at the end of this battle, place this Character at the bottom of the owners deck.
    {
      cardId: 'OP02-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-2-bon-kurei-don-1-when-attacking-trash-1-bottom-small-character-then-self',
            text: "[DON!! x1] [When Attacking] You may trash 1 card from your hand: Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck. Then, at the end of this battle, place this Character at the bottom of the owner's deck.",
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
              {
                type: 'scheduleMoveAtEndOfBattle',
                selector: {
                  player: 'self',
                  source: 'effectSource',
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
    // OP02-059 Boa Hancock (Box Topper)
    // [When Attacking] Draw 1 card and trash 1 card from your hand. Then, trash up to 3 cards from your hand.
    {
      cardId: 'OP02-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-when-attacking-draw-1-then-trash-1-then-up-to-3',
            text: '[When Attacking] Draw 1 card and trash 1 card from your hand. Then, trash up to 3 cards from your hand.',
            trigger: { type: 'whenAttacking' },
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
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 3 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP02-050 Inazuma
    // If you have 1 or less cards in your hand, this Character gains +2000 power. [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-050',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'inazuma-if-hand-1-or-less-plus-2000',
            text: 'If you have 1 or less cards in your hand, this Character gains +2000 power.',
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 1,
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
    // OP02-057 Bartholomew Kuma
    // [On Play] Look at 2 cards from the top of your deck; reveal up to 1 "The Seven Warlords of the Sea" type card and add it to your hand. Then, place the rest at the top or bottom of the deck in any order.
    {
      cardId: 'OP02-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-on-play-search-top-2-seven-warlords',
            text: '[On Play] Look at 2 cards from the top of your deck; reveal up to 1 "The Seven Warlords of the Sea" type card and add it to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 2,
                filter: { trait: ['The Seven Warlords of the Sea'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
              },
            ],
          },
        },
      ],
    },
    // OP02-056 Donquixote Doflamingo
    // [On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order. [DON!! x1] [When Attacking] You may trash 1 card from your hand: Place up to 1 of your opponents Characters with a cost of 1 or less at the bottom of the owners deck.
    {
      cardId: 'OP02-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-on-play-arrange-top-3',
            text: '[On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-when-attacking-trash-1-bottom-deck-cost-1-or-less',
            text: "[DON!! x1] [When Attacking] You may trash 1 card from your hand: Place up to 1 of your opponent's Characters with a cost of 1 or less at the bottom of the owner's deck.",
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
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
            ],
          },
        },
      ],
    },
    // OP02-065 Mr.3 (Galdino)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [End of Your Turn] You may trash 1 card from your hand: Set this Character as active.
    {
      cardId: 'OP02-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-3-galdino-end-of-turn-trash-1-set-self-active',
            text: '[End of Your Turn] You may trash 1 card from your hand: Set this Character as active.',
            trigger: { type: 'onTurnEnd', optional: true },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
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
    // OP02-052 Cabaji
    // [On Play] If you have [Mohji], draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP02-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cabaji-on-play-if-you-have-mohji-draw-2-trash-1',
            text: '[On Play] If you have [Mohji], draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Mohji'] },
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
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP02-061 Morley
    // [When Attacking] If you have 1 or less cards in your hand, your opponent cannot activate the [Blocker] of any Character with a cost of 5 or less during this battle.
    {
      cardId: 'OP02-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'morley-when-attacking-if-hand-1-or-less-opponent-cost-5-or-less-cannot-block',
            text: '[When Attacking] If you have 1 or less cards in your hand, your opponent cannot activate the [Blocker] of any Character with a cost of 5 or less during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 1,
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP02-015 Makino
    // [Activate:Main] You may rest this Character: Up to 1 of your red Characters with a cost of 1 gains +3000 power during this turn.
    {
      cardId: 'OP02-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'makino-activate-main-rest-self-red-cost-1-plus-3000',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your red Characters with a cost of 1 gains +3000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { rested: false },
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
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    costMax: 1,
                    costMin: 1,
                  },
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
    // OP02-018 Marco
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On K.O.] You may trash 1 card with a type including "Whitebeard Pirates" from your hand: If you have 2 or less Life cards, play this Character card from your trash rested.
    {
      cardId: 'OP02-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marco-on-ko-trash-whitebeard-pirates-if-life-2-or-less-play-self-rested',
            text: '[On K.O.] You may trash 1 card with a type including "Whitebeard Pirates" from your hand: If you have 2 or less Life cards, play this Character card from your trash rested.',
            trigger: { type: 'onKo', optional: true },
            conditions: [{ type: 'playerHasLifeAtMost', player: 'self', value: 2 }],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Whitebeard Pirates'] },
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
                  filter: { name: ['Marco'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP02-008 Jozu
    // [DON!! x1] If you have 2 or less Life cards and your Leaders type includes "Whitebeard Pirates", this Character gains [Rush].
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP02-008',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'jozu-don-1-if-life-2-or-less-and-whitebeard-leader-gains-rush',
            text: '[DON!! x1] If you have 2 or less Life cards and your Leaders type includes "Whitebeard Pirates", this Character gains [Rush].',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
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
      ],
    },
    // OP02-005 Curly.Dadan (Pirate Foil)
    // [On Play] Look at up to 5 cards from the top of your deck; reveal up to 1 red Character with a cost of 1 and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP02-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'curly-dadan-on-play-search-top-5-red-character-cost-1',
            text: '[On Play] Look at up to 5 cards from the top of your deck; reveal up to 1 red Character with a cost of 1 and add it to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  color: ['Red'],
                  costMax: 1,
                  costMin: 1,
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
    // OP02-011 Vista
    // [On Play] K.O. up to 1 of your opponents Characters with 3000 power or less.
    {
      cardId: 'OP02-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vista-on-play-ko-power-3000-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'onPlay' },
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
    // OP02-016 Magura
    // [On Play] Up to 1 of your red Characters with a cost of 1 gains +3000 power during this turn.
    {
      cardId: 'OP02-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'magura-on-play-red-cost-1-plus-3000',
            text: '[On Play] Up to 1 of your red Characters with a cost of 1 gains +3000 power during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    costMax: 1,
                    costMin: 1,
                  },
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
    // OP02-019 Rakuyo
    // [DON!! x1] [Your Turn] All of your Characters with a type including "Whitebeard Pirates" gain +1000 power.
    {
      cardId: 'OP02-019',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'rakuyo-don-1-your-turn-whitebeard-pirates-plus-1000',
            text: '[DON!! x1] [Your Turn] All of your Characters with a type including "Whitebeard Pirates" gain +1000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Whitebeard Pirates'],
                },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // OP02-017 Masked Deuce (Alternate Art)
    // [DON!! x2] [When Attacking] K.O. up to 1 of your opponents Characters with 2000 power or less.
    {
      cardId: 'OP02-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'masked-deuce-don-2-when-attacking-ko-power-2000-or-less',
            text: "[DON!! x2] [When Attacking] K.O. up to 1 of your opponent's Characters with 2000 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
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
    // OP02-012 Blenheim
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-012',
      effects: [],
    },
    // OP02-014 Whitey Bay
    // [DON!! x1] This Character can also attack your opponents active Characters.
    {
      cardId: 'OP02-014',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'whitey-bay-don-1-can-attack-active-characters',
            text: '[DON!! x1] This Character can also attack your opponents active Characters.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
      ],
    },
    // OP02-010 Dogura
    // [Activate:Main] You may rest this Character: Play up to 1 red Character other than [Dogura] with a cost of 1 from your hand.
    {
      cardId: 'OP02-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dogura-activate-main-rest-self-play-red-character-cost-1',
            text: '[Activate:Main] You may rest this Character: Play up to 1 red Character other than [Dogura] with a cost of 1 from your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
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
                    color: ['Red'],
                    costMax: 1,
                    costMin: 1,
                    excludeName: ['Dogura'],
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
    // OP02-009 Squard (Box Topper)
    // [On Play] If your Leaders type includes "Whitebeard Pirates", give up to 1 of your opponents Characters -4000 power during this turn and add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP02-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'squard-on-play-if-whitebeard-minus-4000-and-add-top-life-to-hand',
            text: '[On Play] If your Leaders type includes "Whitebeard Pirates", give up to 1 of your opponents Characters -4000 power during this turn and add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
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
                amount: -4000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
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
    // OP02-029 Carrot
    // [End of Your Turn] Set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP02-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carrot-end-of-turn-set-up-to-1-don-active',
            text: '[End of Your Turn] Set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
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
      ],
    },
    // OP02-032 Shishilian
    // [On Play] (2) (You may rest the specified number of DON!! cards in your cost area.): Set up to 1 of your [Minks] type Characters with a cost of 5 or less as active.
    {
      cardId: 'OP02-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shishilian-on-play-rest-2-don-unrest-minks-cost-5-or-less',
            text: '[On Play] (2): Set up to 1 of your [Minks] type Characters with a cost of 5 or less as active.',
            trigger: { type: 'onPlay' },
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
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Minks'],
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP02-034 Tony Tony.Chopper
    // [DON!! x1] [When Attacking] Rest up to 1 of your opponents Characters with a cost of 2 or less.
    {
      cardId: 'OP02-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-don-1-when-attacking-rest-cost-2-or-less',
            text: "[DON!! x1] [When Attacking] Rest up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // OP02-036 Nami (Alternate Art)
    // [On Play]/[When Attacking] (1) (You may rest the specified number of DON!! cards in your cost area.): Look at 3 cards from the top of your deck; reveal up to 1 "FILM" type card other than [Nami] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP02-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-on-play-rest-1-don-search-top-3-film-other-than-nami',
            text: '[On Play] (1): Look at 3 cards from the top of your deck; reveal up to 1 "FILM" type card other than [Nami] and add it to your hand.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
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
                filter: { trait: ['FILM'], excludeName: ['Nami'] },
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
            id: 'nami-when-attacking-rest-1-don-search-top-3-film-other-than-nami',
            text: '[When Attacking] (1): Look at 3 cards from the top of your deck; reveal up to 1 "FILM" type card other than [Nami] and add it to your hand.',
            trigger: { type: 'whenAttacking' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
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
                filter: { trait: ['FILM'], excludeName: ['Nami'] },
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
    // OP02-027 Inuarashi
    // If all of your DON!! cards are rested, this Character cannot be removed from the field by your opponents effects.
    {
      cardId: 'OP02-027',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'inuarashi-if-all-don-rested-cannot-be-removed-by-opponent-effects',
            text: "If all of your DON!! cards are rested, this Character cannot be removed from the field by your opponent's effects.",
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
                },
                value: 0,
              },
            ],
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
      ],
    },
    // OP02-040 Brook
    // [On Play] Play up to 1 [FILM] or [Straw Hat Crew] type Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP02-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-on-play-play-film-or-straw-hat-cost-3-or-less',
            text: '[On Play] Play up to 1 [FILM] or [Straw Hat Crew] type Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                    trait: ['FILM', 'Straw Hat Crew'],
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
    // OP02-044 Wanda
    // [On Play] Play up to 1 [Minks] type Character card other than [Wanda] with a cost of 3 or less from your hand.
    {
      cardId: 'OP02-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'wanda-on-play-play-minks-other-than-wanda-cost-3-or-less',
            text: '[On Play] Play up to 1 [Minks] type Character card other than [Wanda] with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                    trait: ['Minks'],
                    excludeName: ['Wanda'],
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
    // OP02-041 Monkey.D.Luffy (041) (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] Play up to 1 "FILM" or "Straw Hat Crew" type Character card with a cost of 4 or less from your hand.
    {
      cardId: 'OP02-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-041-on-play-play-film-or-straw-hat-cost-4-or-less',
            text: '[On Play] Play up to 1 "FILM" or "Straw Hat Crew" type Character card with a cost of 4 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    trait: ['FILM', 'Straw Hat Crew'],
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
    // OP02-038 Nekomamushi
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-038',
      effects: [],
    },
    // OP02-042 Yamato
    // Also treat this cards name as [Kouzuki Oden] according to the rules. [On Play] Rest up to 1 of your opponents Characters with a cost of 6 or less.
    {
      cardId: 'OP02-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yamato-on-play-rest-cost-6-or-less',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 6 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP02-030 Kouzuki Oden (Alternate Art)
    // [Activate:Main] [Once Per Turn] (3) (You may rest the specified number of DON!! cards in your cost area.): Set this Character as active. [On K.O.] Play up to 1 green "Land of Wano" type Character card with a cost of 3 from your deck. Then, shuffle your deck.
    {
      cardId: 'OP02-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-oden-activate-main-once-per-turn-rest-3-don-set-self-active',
            text: '[Activate:Main] [Once Per Turn] (3): Set this Character as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 3 },
                },
              },
            ],
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
            id: 'kouzuki-oden-on-ko-play-green-land-of-wano-cost-3-from-deck-then-shuffle',
            text: '[On K.O.] Play up to 1 green "Land of Wano" type Character card with a cost of 3 from your deck. Then, shuffle your deck.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  color: ['Green'],
                  trait: ['Land of Wano'],
                  costMax: 3,
                  costMin: 3,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
              },
              { type: 'shuffleDeck', player: 'self' },
            ],
          },
        },
      ],
    },
    // OP02-035 Trafalgar Law
    // [Activate:Main] (1) (You may rest the specified number of DON!! cards in your cost area.) You may return this Character to the owners hand: Play up to 1 Character with a cost of 3 from your hand.
    {
      cardId: 'OP02-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-activate-main-rest-1-don-return-self-play-cost-3',
            text: '[Activate:Main] (1) You may return this Character to the owners hand: Play up to 1 Character with a cost of 3 from your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
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
                    costMax: 3,
                    costMin: 3,
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
    // OP02-037 Nico Robin
    // [On Play] Play up to 1 [FILM] or [Straw Hat Crew] type Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP02-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-on-play-play-film-or-straw-hat-cost-2-or-less',
            text: '[On Play] Play up to 1 [FILM] or [Straw Hat Crew] type Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 2,
                    trait: ['FILM', 'Straw Hat Crew'],
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
    // OP02-031 Kouzuki Toki (Box Topper)
    // If you have a [Kouzuki Oden] Character, this Character gains [Blocker]. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-031',
      effects: [],
    },
    // OP02-083 Hannyabal
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 purple [Impel Down] type card other than [Hannyabal] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP02-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hannyabal-on-play-search-top-5-purple-impel-down',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 purple [Impel Down] type card other than [Hannyabal] and add it to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  color: ['Purple'],
                  trait: ['Impel Down'],
                  excludeName: ['Hannyabal'],
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
    // OP02-073 Little Sadi (Alternate Art)
    // [On Play] Play up to 1 [Jailer Beast] type Character card from your hand.
    {
      cardId: 'OP02-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'little-sadi-on-play-play-jailer-beast',
            text: '[On Play] Play up to 1 [Jailer Beast] type Character card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Jailer Beast'],
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
    // OP02-075 Shiki
    // [Trigger] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.
    {
      cardId: 'OP02-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shiki-trigger-remove-1-play-this-card',
            text: '[Trigger] DON!! -1: Play this card.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Shiki'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP02-081 Domino
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-081',
      effects: [],
    },
    // OP02-087 Minotaur
    // [Double Attack] (This card deals 2 damage.) [On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP02-087',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'minotaur-has-double-attack',
            text: '[Double Attack] (This card deals 2 damage.)',
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
          kind: 'standard',
          effect: {
            id: 'minotaur-on-ko-if-impel-down-leader-add-rested-don',
            text: ' [On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
              },
            ],
            actions: [{ type: 'addDon', player: 'self', amount: 1, rested: true }],
          },
        },
      ],
    },
    // OP02-076 Shiryu
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponents Characters with a cost of 1 or less.
    {
      cardId: 'OP02-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shiryu-on-play-remove-1-ko-cost-1-or-less',
            text: "[On Play] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP02-086 Minokoala (Box Topper)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP02-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'minokoala-on-ko-if-impel-down-leader-add-rested-don',
            text: '[On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
              },
            ],
            actions: [{ type: 'addDon', player: 'self', amount: 1, rested: true }],
          },
        },
      ],
    },
    // OP02-079 Douglas Bullet
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Rest up to 1 of your opponents Characters with a cost of 4 or less.
    {
      cardId: 'OP02-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'douglas-bullet-on-play-remove-1-rest-cost-4-or-less',
            text: "[On Play] DON!! -1: Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // OP02-074 Saldeath
    // Your [Blugori] gains [Blocker]. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP02-074',
      effects: [],
    },
    // OP02-082 Byrnndi World
    // [Activate:Main] DON!! -8 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character gains +792000 power during this turn.
    {
      cardId: 'OP02-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'byrnndi-world-activate-main-remove-8-plus-792000',
            text: '[Activate:Main] DON!! -8: This Character gains +792000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 8 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 792000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP02-078 Daifugo
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [SMILE] type Character card other than [Daifugo] with a cost of 3 or less from your hand.
    {
      cardId: 'OP02-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'daifugo-on-play-remove-2-play-smile-other-than-daifugo-cost-3-or-less',
            text: '[On Play] DON!! -2: Play up to 1 [SMILE] type Character card other than [Daifugo] with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['SMILE'],
                    costMax: 3,
                    excludeName: ['Daifugo'],
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
  ],
};
