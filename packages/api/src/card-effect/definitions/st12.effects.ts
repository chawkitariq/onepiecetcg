import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st12EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST12',
  cards: [
    // ST12-001 Roronoa Zoro & Sanji
    // [DON!! x1][When Attacking][Once Per Turn] You may return 1 of your Characters with a cost of 2 or more to the owner's hand: Set up to 1 of your Characters with 7000 power or less as active.
    {
      cardId: 'ST12-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-001-when-attacking-return-cost-2-set-active',
            text: "[DON!! x1][When Attacking][Once Per Turn] You may return 1 of your Characters with a cost of 2 or more to the owner's hand: Set up to 1 of your Characters with 7000 power or less as active.",
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 7000 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST12-002 Kuina
    // [Activate:Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a cost of 4 or less. [Trigger] Play this card.
    {
      cardId: 'ST12-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-002-activate-main-rest-opponent-cost-4-or-less',
            text: "[Activate:Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kuina'] },
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
            id: 'st12-002-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Kuina'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST12-003 Dracule Mihawk
    // [On Play] If you have 2 or less Characters, play up to 1 [Muggy Kingdom] type or "Slash" attribute Character card with a cost of 4 or less other than [Dracule Mihawk] from your hand rested.
    {
      cardId: 'ST12-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-003-on-play-if-2-or-less-characters-play-from-hand-rested',
            text: '[On Play] If you have 2 or less Characters, play up to 1 [Muggy Kingdom] type or "Slash" attribute Character card with a cost of 4 or less other than [Dracule Mihawk] from your hand rested.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['characters'] },
                value: 2,
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
                    costMax: 4,
                    excludeName: ['Dracule Mihawk'],
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
    // ST12-006 Yosaku & Johnny
    // [DON!! x1][When Attacking] Choose one: • Rest up to 1 of your opponent's Characters with a cost of 2 or less. • K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.
    {
      cardId: 'ST12-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-006-when-attacking-choose-rest-or-ko',
            text: "[DON!! x1][When Attacking] Choose one: • Rest up to 1 of your opponent's Characters with a cost of 2 or less. • K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'st12-006-rest',
                    label:
                      "Rest up to 1 of your opponent's Characters with a cost of 2 or less.",
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
                  {
                    id: 'st12-006-ko',
                    label:
                      "K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
                            cardCategory: ['Character'],
                            costMax: 2,
                            rested: true,
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
    // ST12-007 Rika
    // [On Play] (2) (You may rest the specified number of DON!! cards in your cost area.): If your opponent has 3 or more Life cards, set up to 1 of your "Slash" attribute Characters with a cost of 4 or less as active.
    {
      cardId: 'ST12-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-007-on-play-rest-2-don-set-slash-active',
            text: '[On Play] (2) (You may rest the specified number of DON!! cards in your cost area.): If your opponent has 3 or more Life cards, set up to 1 of your "Slash" attribute Characters with a cost of 4 or less as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['life'] },
                value: 3,
              },
            ],
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
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    attribute: ['Slash'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST12-008 Roronoa Zoro
    // [DON!! x1][When Attacking] Rest up to 1 of your opponent's Characters with a cost of 6 or less.
    {
      cardId: 'ST12-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-008-when-attacking-rest-opponent-cost-6-or-less',
            text: "[DON!! x1][When Attacking] Rest up to 1 of your opponent's Characters with a cost of 6 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // ST12-010 Emporio.Ivankov
    // [On Play] Reveal 1 card from the top of your deck and play up to 1 Character card with a cost of 2. Then, place the rest at the top or bottom of your deck. [When Attacking][Once Per Turn] Draw 1 card if you have 6 or less cards in your hand.
    {
      cardId: 'ST12-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-010-on-play-reveal-play-cost-2-or-less',
            text: '[On Play] Reveal 1 card from the top of your deck and play up to 1 Character card with a cost of 2. Then, place the rest at the top or bottom of your deck.',
            trigger: { type: 'onPlay' },
            actions: [
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
            id: 'st12-010-when-attacking-draw-if-hand-6-or-less',
            text: '[When Attacking][Once Per Turn] Draw 1 card if you have 6 or less cards in your hand.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [
              { type: 'playerHasHandAtMost', player: 'self', value: 6 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST12-011 Sanji
    // [DON!! x1][When Attacking] If you have 5 or less cards in your hand, this Character gains +2000 power until the start of your next turn.
    {
      cardId: 'ST12-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-011-when-attacking-plus-2000-if-hand-5-or-less',
            text: '[DON!! x1][When Attacking] If you have 5 or less cards in your hand, this Character gains +2000 power until the start of your next turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasHandAtMost', player: 'self', value: 5 },
            ],
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
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST12-012 Charlotte Pudding (SP)
    // [Activate: Main] Return this Character to the owner's hand.
    {
      cardId: 'ST12-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-012-activate-main-return-to-hand',
            text: "[Activate: Main] Return this Character to the owner's hand.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Charlotte Pudding'] },
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
    // ST12-013 Zeff
    // [On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order. [When Attacking] Reveal 1 card from the top of your deck and play up to 1 Character card with a cost of 2 rested. Then, place the rest at the top or bottom of your deck.
    {
      cardId: 'ST12-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-013-on-play-arrange-deck-3',
            text: '[On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'arrangeDeckWindow',
                player: 'self',
                amount: 3,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st12-013-when-attacking-reveal-play-cost-2-rested',
            text: '[When Attacking] Reveal 1 card from the top of your deck and play up to 1 Character card with a cost of 2 rested. Then, place the rest at the top or bottom of your deck.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: { cardCategory: ['Character'], costMax: 2 },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // ST12-014 Duval (Jolly Roger Foil)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'ST12-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-014-on-play-arrange-deck-3',
            text: '[On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'arrangeDeckWindow',
                player: 'self',
                amount: 3,
              },
            ],
          },
        },
      ],
    },
    // ST12-016 Lion Strike
    // [Main] / [Counter] Rest up to 1 of your opponent's Leader or Character cards with a cost of 4 or less. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'ST12-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-016-main-rest-cost-4-or-less',
            text: "[Main] Rest up to 1 of your opponent's Leader or Character cards with a cost of 4 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st12-016-counter-rest-cost-4-or-less',
            text: "[Counter] Rest up to 1 of your opponent's Leader or Character cards with a cost of 4 or less.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st12-016-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'ST12-016',
                effectId: 'st12-016-main-rest-cost-4-or-less',
              },
            ],
          },
        },
      ],
    },
    // ST12-017 Plastic Surgery Shot - ST12-017 (Pirate Foil)
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, reveal 1 card from the top of your deck, play up to 1 Character card with a cost of 2, and place the rest at the top or bottom of your deck.
    {
      cardId: 'ST12-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st12-017-counter-plus-2000-reveal-play-cost-2',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, reveal 1 card from the top of your deck, play up to 1 Character card with a cost of 2, and place the rest at the top or bottom of your deck.',
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
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: { cardCategory: ['Character'], costMax: 2 },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
  ],
};
