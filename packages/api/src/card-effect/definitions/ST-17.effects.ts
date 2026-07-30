import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st17EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-17',
  cards: [
    // ST17-001 Crocodile
    // [On Play] Reveal 1 card from the top of your deck. If that card is a "The Seven Warlords of the Sea" type card, draw 2 cards and place 1 card from your hand at the top of your deck.
    {
      cardId: 'ST17-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st17-001-on-play-reveal-trait-draw-bounce',
            text: '[On Play] Reveal 1 card from the top of your deck. If that card is a "The Seven Warlords of the Sea" type card, draw 2 cards and place 1 card from your hand at the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'st17-001-revealed',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'st17-001-revealed',
                filter: {
                  traitIncludes: ['The Seven Warlords of the Sea'],
                },
                actions: [
                  { type: 'draw', player: 'self', amount: 2 },
                  {
                    type: 'moveCard',
                    selector: {
                      player: 'self',
                      zones: ['hand'],
                      count: { kind: 'exact', value: 1 },
                    },
                    destinationPlayer: 'self',
                    destinationZone: 'deck',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST17-002 Trafalgar Law - ST17-002 (Reprint)
    // [On Play] You may return 1 of your Characters to the owner's hand: If your Leader has the "The Seven Warlords of the Sea" type, return up to 1 Character with a cost of 4 or less to the owner's hand.
    {
      cardId: 'ST17-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st17-002-on-play-return-own-bounce',
            text: '[On Play] You may return 1 of your Characters to the owner\'s hand: If your Leader has the "The Seven Warlords of the Sea" type, return up to 1 Character with a cost of 4 or less to the owner\'s hand.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'The Seven Warlords of the Sea',
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
    // ST17-003 Buggy - ST17-003 (Pirate Foil)
    // [On Play] Look at 3 cards from the top of your deck and place them at the top of your deck in any order.
    {
      cardId: 'ST17-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st17-003-on-play-arrange-3',
            text: '[On Play] Look at 3 cards from the top of your deck and place them at the top of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 3 }],
          },
        },
      ],
    },
    // ST17-004 Boa Hancock
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of your deck in any order. Then, give up to 1 rested DON!! card to 1 of your "The Seven Warlords of the Sea" type Leader or Character cards.
    {
      cardId: 'ST17-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st17-004-on-play-arrange-3-then-attach-don',
            text: '[On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of your deck in any order. Then, give up to 1 rested DON!! card to 1 of your "The Seven Warlords of the Sea" type Leader or Character cards.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'arrangeDeckWindow', player: 'self', amount: 3 },
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    traitIncludes: ['The Seven Warlords of the Sea'],
                  },
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
    // ST17-005 Marshall.D.Teach - ST17-005 (Pirate Foil)
    // [Activate: Main] [Once Per Turn] You may place 1 card from your hand at the top of your deck: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.
    {
      cardId: 'ST17-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st17-005-activate-main-place-hand-deck-top-attach-don-2',
            text: '[Activate: Main] [Once Per Turn] You may place 1 card from your hand at the top of your deck: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
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
            ],
          },
        },
      ],
    },
  ],
};
