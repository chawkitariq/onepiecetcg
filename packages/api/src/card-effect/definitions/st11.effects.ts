import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st11EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST11',
  cards: [
    // ST11-001 Uta (001)
    // [DON!! x1][When Attacking][Once Per Turn] Reveal 1 card from the top of your deck and add up to 1 [FILM] type card to your hand. Then, place the rest at the bottom of your deck.
    {
      cardId: 'ST11-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st11-001-when-attacking-reveal-film',
            text: '[DON!! x1][When Attacking][Once Per Turn] Reveal 1 card from the top of your deck and add up to 1 [FILM] type card to your hand. Then, place the rest at the bottom of your deck.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 1,
                filter: { trait: ['FILM'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // ST11-002 Uta (002)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [End of Your Turn] You may trash 1 Event from your hand: Set up to 1 of your [FILM] type Characters as active.
    {
      cardId: 'ST11-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st11-002-end-of-turn-trash-event-restand-film',
            text: '[End of Your Turn] You may trash 1 Event from your hand: Set up to 1 of your [FILM] type Characters as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'controllerTurn', value: true }],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Event'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['FILM'], cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST11-003 Backlight
    // [Main] If your Leader is [Uta], choose one: • Rest up to 1 of your opponent's Characters with a cost of 5 or less. • K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.
    {
      cardId: 'ST11-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st11-003-main-choose-rest-or-ko',
            text: "[Main] If your Leader is [Uta], choose one: • Rest up to 1 of your opponent's Characters with a cost of 5 or less. • K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Uta' },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'st11-003-rest',
                    label:
                      "Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
                    actions: [
                      {
                        type: 'rest',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
                            cardCategory: ['Character'],
                            costMax: 5,
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                      },
                    ],
                  },
                  {
                    id: 'st11-003-ko',
                    label:
                      "K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.",
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
                            cardCategory: ['Character'],
                            costMax: 5,
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
    // ST11-004 New Genesis
    // [Main] If your Leader is [Uta], look at 3 cards from the top of your deck, reveal up to 1 [FILM] type card other than [New Genesis] and add it to your hand. Then, place the rest at the bottom of your deck in any order and set up to 1 of your DON!! cards as active.
    {
      cardId: 'ST11-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st11-004-main-search-film-add-don',
            text: '[Main] If your Leader is [Uta], look at 3 cards from the top of your deck, reveal up to 1 [FILM] type card other than [New Genesis] and add it to your hand. Then, place the rest at the bottom of your deck in any order and set up to 1 of your DON!! cards as active.',
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Uta' },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['FILM'],
                  excludeName: ['New Genesis'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    // ST11-005 I'm invincible
    // [Main] Set up to 1 of your [Uta] Leader as active. [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'ST11-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st11-005-main-restand-uta-leader',
            text: '[Main] Set up to 1 of your [Uta] Leader as active.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Uta'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st11-005-trigger-plus-1000',
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
  ],
};
