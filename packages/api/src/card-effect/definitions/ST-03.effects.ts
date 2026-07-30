import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st03EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-03',
  cards: [
    // ST03-001 Crocodile (001)
    // [Activate: Main] [Once Per Turn] DON!! -4 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Return up to 1 Character with a cost of 5 or less to the owner's hand.
    {
      cardId: 'ST03-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-leader-activate-main-don-minus-4-bounce-cost-5-or-less',
            text: "[Activate: Main] [Once Per Turn] DON!! -4: Return up to 1 Character with a cost of 5 or less to the owner's hand.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 4 }],
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // ST03-003 Crocodile (003)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [DON!! x1] [On Block] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.
    {
      cardId: 'ST03-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-on-block-don-1-bottom-deck-cost-2-or-less',
            text: "[DON!! x1] [On Block] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.",
            trigger: { type: 'onBlock' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // ST03-004 Gecko Moria (SP)
    // [On Play] Add up to 1 [The Seven Warlords of the Sea] or [Thriller Bark Pirates] type Character with a cost of 4 or less other than [Gecko Moria] from your trash to your hand.
    {
      cardId: 'ST03-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gecko-moria-on-play-recover-warlord-or-thriller-bark',
            text: '[On Play] Add up to 1 [The Seven Warlords of the Sea] or [Thriller Bark Pirates] type Character with a cost of 4 or less other than [Gecko Moria] from your trash to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  trait: [
                    'The Seven Warlords of the Sea',
                    'Thriller Bark Pirates',
                  ],
                  costMax: 4,
                  excludeName: ['Gecko Moria'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // ST03-005 Dracule Mihawk (ST03-005) (Full Art)
    // [DON!! x1] [When Attacking] Draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'ST03-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dracule-mihawk-when-attacking-draw-2-trash-2',
            text: '[DON!! x1] [When Attacking] Draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // ST03-007 Sentomaru
    // [DON!! x1] [Activate: Main] [Once Per Turn] (2) (You may rest the specified number of DON!! cards in your cost area.): Play up to 1 [Pacifista] with a cost of 4 or less from your deck, then shuffle your deck.
    {
      cardId: 'ST03-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sentomaru-activate-main-don-2-search-pacifista',
            text: '[DON!! x1] [Activate: Main] [Once Per Turn] (2): Play up to 1 [Pacifista] with a cost of 4 or less from your deck, then shuffle your deck.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 99,
                filter: { name: ['Pacifista'], costMax: 4 },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
              },
              { type: 'shuffleDeck', player: 'self' },
            ],
          },
        },
      ],
    },
    // ST03-008 Trafalgar Law (ST03-008) (Jolly Roger Foil)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST03-008',
      effects: [],
    },
    // ST03-009 Donquixote Doflamingo (Wanted Poster)
    // [On Play] Return up to 1 Character with a cost of 7 or less to the owner's hand.
    {
      cardId: 'ST03-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-on-play-bounce-cost-7-or-less',
            text: "[On Play] Return up to 1 Character with a cost of 7 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
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
    // ST03-010 Bartholomew Kuma
    // [On Play] Look at 3 cards from the top of your deck and return them to the top or bottom of the deck in any order. [Trigger] Play this card.
    {
      cardId: 'ST03-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-on-play-arrange-top-3',
            text: '[On Play] Look at 3 cards from the top of your deck and return them to the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
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
    // ST03-013 Boa Hancock (ST03-013) (Jolly Roger Foil)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[Trigger] Play this card.
    {
      cardId: 'ST03-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Boa Hancock'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST03-014 Marshall.D.Teach
    // [On Play] Return up to 1 Character with a cost of 3 or less to the owner's hand.
    {
      cardId: 'ST03-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marshall-d-teach-on-play-bounce-cost-3-or-less',
            text: "[On Play] Return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
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
    // ST03-015 Sables
    // [Main] Return up to 1 Character with a cost of 7 or less to the owner's hand. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'ST03-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sables-main-bounce-cost-7-or-less',
            text: "[Main] Return up to 1 Character with a cost of 7 or less to the owner's hand.",
            trigger: { type: 'activateMain' },
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
        {
          kind: 'standard',
          effect: {
            id: 'sables-trigger-bounce-cost-7-or-less',
            text: "[Trigger] Activate this card's [Main] effect.",
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
    // ST03-016 Thrust Pad Cannon
    // [Counter] Return up to 1 Character with a cost of 3 or less to the owner's hand. [Trigger] Activate this card's [Counter] effect.
    {
      cardId: 'ST03-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thrust-pad-cannon-counter-bounce-cost-3-or-less',
            text: "[Counter] Return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'activateCounter' },
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
        {
          kind: 'standard',
          effect: {
            id: 'thrust-pad-cannon-trigger-bounce-cost-3-or-less',
            text: "[Trigger] Activate this card's [Counter] effect.",
            trigger: { type: 'trigger' },
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
    // ST03-017 Love-Love Mellow
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, draw 1 card if you have 3 or less cards in your hand.
    {
      cardId: 'ST03-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'love-love-mellow-counter-plus-4000',
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
            id: 'love-love-mellow-counter-draw-1-if-hand-3-or-less',
            text: 'Then, draw 1 card if you have 3 or less cards in your hand.',
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasHandAtMost', player: 'self', value: 3 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
  ],
};
