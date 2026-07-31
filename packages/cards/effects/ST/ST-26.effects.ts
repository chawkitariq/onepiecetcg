import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st26EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-26',
  cards: [
    // ST26-001 Soba Mask
    // If you have a [San-Gorou] or [Sanji] Character with 7000 base power or more, give this card in your hand -5 cost.
    // [On Play] Return all of your [San-Gorou] and [Sanji] Characters to the owner's hand.
    {
      cardId: 'ST26-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st26-001-cost-reduction',
            text: 'If you have a [San-Gorou] or [Sanji] Character with 7000 base power or more, give this card in your hand -5 cost.',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['San-Gorou', 'Sanji'],
                    basePowerMin: 7000,
                  },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['hand'],
                filter: { name: ['Soba Mask'] },
              },
              cost: -5,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st26-001-on-play-return-to-hand',
            text: "[On Play] Return all of your [San-Gorou] and [Sanji] Characters to the owner's hand.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    trait: ['San-Gorou', 'Sanji'],
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
    // ST26-002 Tony Tony.Chopper
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Rest up to 1 of your opponent's DON!! cards or Characters with a cost of 1 or less.
    {
      cardId: 'ST26-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st26-002-on-play-rest-don-or-character',
            text: "[On Play] DON!! -2: Rest up to 1 of your opponent's DON!! cards or Characters with a cost of 1 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost', 'characters'],
                  filter: { costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST26-003 Nico Robin
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'ST26-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st26-003-on-play-add-don-active',
            text: '[On Play] DON!! -2: Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // ST26-004 General Franky
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Give up to 2 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'ST26-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st26-004-on-play-minus-2000-power',
            text: "[On Play] DON!! -2: Give up to 2 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 2 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST26-005 Monkey.D.Luffy
    // [On Play] / [When Attacking] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader is multicolored and your opponent has 5 or more DON!! cards on their field, your "Straw Hat Crew" type Leader's base power becomes 7000 until the end of your opponent's next End Phase.
    {
      cardId: 'ST26-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st26-005-on-play-leader-power-boost',
            text: '[On Play] DON!! -2: If your Leader is multicolored and your opponent has 5 or more DON!! cards on their field, your "Straw Hat Crew" type Leader\'s base power becomes 7000 until the end of your opponent\'s next End Phase.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'opponent',
                value: 5,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { trait: ['Straw Hat Crew'] },
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
            id: 'st26-005-when-attacking-leader-power-boost',
            text: '[When Attacking] DON!! -2: If your Leader is multicolored and your opponent has 5 or more DON!! cards on their field, your "Straw Hat Crew" type Leader\'s base power becomes 7000 until the end of your opponent\'s next End Phase.',
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'opponent',
                value: 5,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { trait: ['Straw Hat Crew'] },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
  ],
};
