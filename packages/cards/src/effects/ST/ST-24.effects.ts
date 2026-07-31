import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st24EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-24',
  cards: [
    // ST24-002 Kid & Killer
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Supernovas" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [On Your Opponent's Attack] You may trash this Character: Set up to 1 of your DON!! cards as active.
    {
      cardId: 'ST24-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st24-002-on-play-search-supernovas',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Supernovas" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Supernovas'] },
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
            id: 'st24-002-on-opponent-attack-trash-set-don-active',
            text: "[On Your Opponent's Attack] You may trash this Character: Set up to 1 of your DON!! cards as active.",
            trigger: { type: 'onAttacked', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kid & Killer'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'restand',
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
    // ST24-004 Law & Bepo
    // [On Play] Rest up to 1 of your opponent's Characters and that Character will not become active in your opponent's next Refresh Phase. Then, if your opponent has 2 or more rested Characters, your Leader gains +2000 power until the end of your opponent's next End Phase.
    {
      cardId: 'ST24-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st24-004-on-play-rest-leader-power',
            text: "[On Play] Rest up to 1 of your opponent's Characters and that Character will not become active in your opponent's next Refresh Phase. Then, if your opponent has 2 or more rested Characters, your Leader gains +2000 power until the end of your opponent's next End Phase.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'targetCountAtLeast',
                    selector: {
                      player: 'opponent',
                      zones: ['characters'],
                      filter: { rested: true },
                    },
                    value: 2,
                  },
                ],
                actions: [
                  {
                    type: 'modifyPower',
                    selector: {
                      player: 'self',
                      zones: ['leader'],
                    },
                    amount: 2000,
                    duration: { type: 'untilStartOfYourNextTurn' },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST24-005 X.Drake
    // [On Play] If your Leader has the "Supernovas" type, rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, set up to 1 of your DON!! cards as active at the end of this turn.
    {
      cardId: 'ST24-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st24-005-on-play-rest-and-schedule-don',
            text: '[On Play] If your Leader has the "Supernovas" type, rest up to 1 of your opponent\'s Characters with a cost of 5 or less. Then, set up to 1 of your DON!! cards as active at the end of this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
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
                type: 'scheduleActionsAtTurnEnd',
                actions: [
                  {
                    type: 'restand',
                    selector: {
                      player: 'self',
                      zones: ['cost'],
                      filter: { rested: true },
                      count: { kind: 'upTo', value: 1 },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST24-003 Basil Hawkins
    // [End of Your Turn] Set up to 1 of your DON!! cards as active.
    {
      cardId: 'ST24-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st24-003-end-of-turn-set-don-active',
            text: '[End of Your Turn] Set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'restand',
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
    // ST24-001 Capone"Gang"Bege
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If you have 6 or more rested cards, draw 1 card and trash 1 card from your hand.
    {
      cardId: 'ST24-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st24-001-on-play-draw-trash',
            text: '[On Play] If you have 6 or more rested cards, draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters', 'stage', 'cost'],
                  filter: { rested: true },
                },
                value: 6,
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
  ],
};
