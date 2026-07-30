import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st18EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-18',
  cards: [
    // ST18-001 Uso-Hachi (SP)
    // [On Play] If you have 8 or more DON!! cards on your field, rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'ST18-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st18-001-on-play-rest-opp-char-cost-5-or-less',
            text: "[On Play] If you have 8 or more DON!! cards on your field, rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
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
    // ST18-002 O-Nami (Pirate Foil)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play] If you have 8 or more DON!! cards on your field, trash 1 card from your hand and draw 2 cards.
    {
      cardId: 'ST18-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st18-002-on-play-trash-1-draw-2',
            text: '[On Play] If you have 8 or more DON!! cards on your field, trash 1 card from your hand and draw 2 cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
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
              { type: 'draw', player: 'self', amount: 2 },
            ],
          },
        },
      ],
    },
    // ST18-003 San-Gorou (Pirate Foil)
    // [When Attacking] [Once Per Turn] If you have 8 or more DON!! cards on your field, draw 1 card.
    {
      cardId: 'ST18-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st18-003-when-attacking-draw-1',
            text: '[When Attacking] [Once Per Turn] If you have 8 or more DON!! cards on your field, draw 1 card.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST18-004 Zoro-Juurou (ST18-004)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 purple "Straw Hat Crew" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'ST18-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st18-004-on-play-search-5',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 purple "Straw Hat Crew" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Straw Hat Crew'],
                  color: ['Purple'],
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
    // ST18-005 Luffy-Tarou (SP)
    // [On Play] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 purple "Straw Hat Crew" type Character card with a cost of 5 or less from your hand.
    {
      cardId: 'ST18-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st18-005-on-play-don-1-play-char',
            text: '[On Play] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 purple "Straw Hat Crew" type Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Purple'],
                    trait: ['Straw Hat Crew'],
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
  ],
};
