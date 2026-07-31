import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st20EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-20',
  cards: [
    // ST20-001 Charlotte Katakuri (ST20-001)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Activate: Main] [Once Per Turn] You may turn 1 card from the top of your Life cards face-up: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST20-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st20-001-activate-main-reveal-life-attach-don',
            text: '[Activate: Main] [Once Per Turn] You may turn 1 card from the top of your Life cards face-up: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
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
    // ST20-002 Charlotte Cracker
    // [Once Per Turn] If this Character would be K.O.'d by an effect, you may trash 1 card from the top of your Life cards instead.
    // [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'ST20-002',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'st20-002-replacement-ko-protection',
            text: "[Once Per Turn] If this Character would be K.O.'d by an effect, you may trash 1 card from the top of your Life cards instead.",
            event: 'wouldKoCharacter',
            optional: true,
            oncePerTurn: true,
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
                destinationZone: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st20-002-trigger-play',
            text: '[Trigger] You may trash 1 card from your hand: Play this card.',
            trigger: { type: 'trigger' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Charlotte Cracker'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST20-003 Charlotte Brulee (Pirate Foil)
    // [Trigger] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, add this card to your hand.
    {
      cardId: 'ST20-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st20-003-trigger-life-manipulate',
            text: "[Trigger] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, add this card to your hand.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'reveal',
                player: 'either',
                zone: 'life',
                amount: 1,
                storeAs: 'st20-003-revealed-life',
              },
              {
                type: 'moveStoredCards',
                key: 'st20-003-revealed-life',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                chooseDestinationPosition: true,
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Charlotte Brulee'] },
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
    // ST20-004 Charlotte Pudding (ST20-004)
    // [On Play] You may add 1 card from the top of your Life cards to your hand: Set up to 1 of your "Big Mom Pirates" type Characters with a cost of 3 or less as active.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'ST20-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st20-004-on-play-life-to-hand-restand',
            text: '[On Play] You may add 1 card from the top of your Life cards to your hand: Set up to 1 of your "Big Mom Pirates" type Characters with a cost of 3 or less as active.',
            trigger: { type: 'onPlay' },
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
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Big Mom Pirates'],
                    costMax: 3,
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
            id: 'st20-004-trigger-rest-cost-3-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST20-005 Charlotte Linlin
    // [On Play] You may trash 1 card from your hand: Your opponent chooses one:
    // • Your opponent trashes 2 cards from their hand.
    // • Trash 1 card from the top of your opponent's Life cards.
    {
      cardId: 'ST20-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st20-005-on-play-opponent-chooses-hand-or-life',
            text: "[On Play] You may trash 1 card from your hand: Your opponent chooses one: • Your opponent trashes 2 cards from their hand. • Trash 1 card from the top of your opponent's Life cards.",
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Your opponent chooses one:',
                choices: [
                  {
                    id: 'trash-hand',
                    label: 'Your opponent trashes 2 cards from their hand',
                    actions: [
                      {
                        type: 'trashFromHand',
                        selector: {
                          player: 'opponent',
                          zones: ['hand'],
                          count: { kind: 'exact', value: 2 },
                        },
                      },
                    ],
                  },
                  {
                    id: 'trash-life',
                    label:
                      "Trash 1 card from the top of your opponent's Life cards",
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['life'],
                          filter: { zonePosition: 'top' },
                          count: { kind: 'exact', value: 1 },
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'trash',
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
  ],
};
