import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st10EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST10',
  cards: [
    // ST10-010 Trafalgar Law (010)
    // [Blocker] [On Play] DON!! -1: If your opponent has 7 or more cards in their hand, trash 2 cards from your opponent's hand.
    {
      cardId: 'ST10-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-010-on-play-don-1-trash-hand',
            text: "[On Play] DON!! -1: If your opponent has 7 or more cards in their hand, trash 2 cards from your opponent's hand.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['hand'] },
                value: 7,
              },
            ],
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
        },
      ],
    },
    // ST10-008 Shachi & Penguin
    // [On Play] If you have 3 or less DON!! cards on your field, add up to 2 DON!! cards from your DON!! deck and rest them.
    {
      cardId: 'ST10-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-008-on-play-add-don-2-rested',
            text: '[On Play] If you have 3 or less DON!! cards on your field, add up to 2 DON!! cards from your DON!! deck and rest them.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtMost', player: 'self', value: 3 },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 2, rested: true },
            ],
          },
        },
      ],
    },
    // ST10-005 Jinbe
    // [DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'ST10-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-005-when-attacking-minus-2000',
            text: "[DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST10-013 Eustass"Captain"Kid (013)
    // [On Play] / [When Attacking] DON!! -1: Up to 1 of your Leader gains +1000 power until the start of your next turn.
    {
      cardId: 'ST10-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-013-on-play-don-1-plus-1000-leader',
            text: '[On Play] DON!! -1: Up to 1 of your Leader gains +1000 power until the start of your next turn.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: { player: 'self', zones: ['leader'] },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st10-013-when-attacking-don-1-plus-1000-leader',
            text: '[When Attacking] DON!! -1: Up to 1 of your Leader gains +1000 power until the start of your next turn.',
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: { player: 'self', zones: ['leader'] },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST10-006 Monkey.D.Luffy (006)
    // [Rush] [Once Per Turn] When your opponent activates a [Blocker], K.O. up to 1 of your opponent's Characters with 8000 power or less.
    //
    // NOTE: The onBlock trigger currently only fires on the blocker card (not
    // broadcast to other in-play cards). This standard effect will work once
    // `onBlock` is added to `shouldBroadcastTriggerToOtherCards` in the engine.
    {
      cardId: 'ST10-006',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st10-006-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Monkey.D.Luffy'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st10-006-on-block-ko-8000-or-less',
            text: "[Once Per Turn] When your opponent activates a [Blocker], K.O. up to 1 of your opponent's Characters with 8000 power or less.",
            trigger: { type: 'onBlock', oncePerTurn: true },
            conditions: [{ type: 'eventPlayerIs', player: 'opponent' }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 8000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // ST10-004 Sanji
    // [On Play] If your opponent has a Character with 5000 or more power, this Character gains [Rush] during this turn.
    {
      cardId: 'ST10-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-004-on-play-rush-if-opponent-5000',
            text: '[On Play] If your opponent has a Character with 5000 or more power, this Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 5000 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Sanji'] },
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
    // ST10-001 Trafalgar Law (001)
    // [Activate:Main] [Once Per Turn] DON!! -3: Place up to 1 of your opponent's Characters with 3000 power or less at the bottom of the owner's deck, and play up to 1 Character card with a cost of 4 or less from your hand.
    {
      cardId: 'ST10-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-001-activate-main-don-3-bounce-play',
            text: "[Activate:Main] [Once Per Turn] DON!! -3: Place up to 1 of your opponent's Characters with 3000 power or less at the bottom of the owner's deck, and play up to 1 Character card with a cost of 4 or less from your hand.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 3 }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 3000 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST10-002 Monkey.D.Luffy (002)
    // [Activate:Main] [Once Per Turn] If you have 0 DON!! cards on your field or 8 or more DON!! cards on your field, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'ST10-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-002-activate-main-add-don-if-zero-or-eight-plus',
            text: '[Activate:Main] [Once Per Turn] If you have 0 DON!! cards on your field or 8 or more DON!! cards on your field, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'ifAnyConditionGroupMatches',
                conditionGroups: [
                  [
                    {
                      type: 'playerHasTotalDonAtMost',
                      player: 'self',
                      value: 0,
                    },
                  ],
                  [
                    {
                      type: 'playerHasTotalDonAtLeast',
                      player: 'self',
                      value: 8,
                    },
                  ],
                ],
                actions: [
                  { type: 'addDon', player: 'self', amount: 1, rested: false },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST10-012 Bepo
    // [On Play] / [When Attacking] If your opponent has more DON!! cards on their field than you, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'ST10-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-012-on-play-add-don-if-opponent-has-more-don',
            text: '[On Play] If your opponent has more DON!! cards on their field than you, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st10-012-when-attacking-add-don-if-opponent-has-more-don',
            text: '[When Attacking] If your opponent has more DON!! cards on their field than you, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    // ST10-014 Wire
    // [Blocker] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, draw 1 card and trash 1 card from your hand.
    {
      cardId: 'ST10-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-014-on-don-returned-draw-trash',
            text: '[Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
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
    // ST10-009 Jean Bart
    // [On Play] (1) (You may rest the specified number of DON!! cards in your cost area.): Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'ST10-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-009-on-play-rest-1-don-add-1-active',
            text: '[On Play] (1) (You may rest the specified number of DON!! cards in your cost area.): Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    // ST10-007 Killer
    // [Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.
    {
      cardId: 'ST10-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-007-on-don-returned-ko-rested-cost-3-or-less',
            text: "[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
            ],
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // ST10-011 Heat
    // [Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, this Character gains +2000 power until the start of your next turn.
    {
      cardId: 'ST10-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-011-on-don-returned-plus-2000',
            text: '[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, this Character gains +2000 power until the start of your next turn.',
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
                  zones: ['characters'],
                  filter: { name: ['Heat'] },
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
    // ST10-003 Eustass"Captain"Kid (003)
    // [Your Turn] If you have 4 or more Life cards, give this Leader -1000 power.
    // [When Attacking] DON!! -1: This Leader gains +2000 power during this turn.
    {
      cardId: 'ST10-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st10-003-your-turn-minus-1000-if-life-4',
            text: '[Your Turn] If you have 4 or more Life cards, give this Leader -1000 power.',
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['life'] },
                value: 4,
              },
            ],
            modifier: {
              selector: { player: 'self', zones: ['leader'] },
              power: -1000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st10-003-when-attacking-don-1-plus-2000',
            text: '[When Attacking] DON!! -1: This Leader gains +2000 power during this turn.',
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: { player: 'self', zones: ['leader'] },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST10-016 Gum-Gum Kong Gatling
    // [Main] K.O. up to 1 of your opponent's Characters with 7000 power or less.
    // [Trigger] Up to 1 of your Leader gains +1000 power until the end of your next turn.
    {
      cardId: 'ST10-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-016-main-ko-7000-or-less',
            text: "[Main] K.O. up to 1 of your opponent's Characters with 7000 power or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 7000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st10-016-trigger-plus-1000-leader',
            text: '[Trigger] Up to 1 of your Leader gains +1000 power until the end of your next turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: { player: 'self', zones: ['leader'] },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST10-015 Gum-Gum Giant Sumo Slap
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle, and K.O. up to 1 of your opponent's Characters with 2000 power or less.
    {
      cardId: 'ST10-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-015-counter-plus-2000-and-ko-2000-or-less',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle, and K.O. up to 1 of your opponent's Characters with 2000 power or less.",
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 2000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // ST10-017 Punk Vise
    // [Main] Rest up to 1 of your opponent's Characters with a cost of 2 or less, and add up to 1 DON!! card from your DON!! deck and rest it.
    // [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'ST10-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st10-017-main-rest-cost-2-or-less-add-don-rested',
            text: "[Main] Rest up to 1 of your opponent's Characters with a cost of 2 or less, and add up to 1 DON!! card from your DON!! deck and rest it.",
            trigger: { type: 'activateMain' },
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
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st10-017-trigger-add-don-active',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
  ],
};
