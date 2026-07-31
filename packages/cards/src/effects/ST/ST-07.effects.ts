import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st07EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-07',
  cards: [
    // ST07-001 Charlotte Linlin (Leader)
    // [DON!! x2] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: If you have 2 or less Life cards, add up to 1 card from your hand to the top of your Life cards.
    {
      cardId: 'ST07-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-001-when-attacking-add-life-to-hand-conditionally-add-hand-to-life',
            text: '[DON!! x2] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: If you have 2 or less Life cards, add up to 1 card from your hand to the top of your Life cards.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
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
                type: 'ifConditionsMatch',
                conditions: [
                  { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
                ],
                actions: [
                  {
                    type: 'moveCard',
                    selector: {
                      player: 'self',
                      zones: ['hand'],
                      count: { kind: 'upTo', value: 1 },
                    },
                    destinationPlayer: 'self',
                    destinationZone: 'life',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST07-003 Charlotte Katakuri
    // [On Play] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, if you have less Life cards than your opponent, this Character gains [Rush] during this turn.
    {
      cardId: 'ST07-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-003-on-play-look-life-then-rush',
            text: "[On Play] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, if you have less Life cards than your opponent, this Character gains [Rush] during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose whose life to look at',
                choices: [
                  {
                    id: 'st07-003-own-life',
                    label: 'Your Life',
                    actions: [
                      {
                        type: 'reveal',
                        player: 'self',
                        zone: 'life',
                        amount: 1,
                        storeAs: 'revealedLifeCard',
                      },
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['life'],
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'self',
                        destinationZone: 'life',
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                  {
                    id: 'st07-003-opponent-life',
                    label: "Opponent's Life",
                    actions: [
                      {
                        type: 'reveal',
                        player: 'opponent',
                        zone: 'life',
                        amount: 1,
                        storeAs: 'revealedLifeCard',
                      },
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['life'],
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'life',
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'playerHasLessLifeThan',
                    player: 'self',
                    thanPlayer: 'opponent',
                  },
                ],
                actions: [
                  {
                    type: 'grantKeywords',
                    selector: {
                      player: 'self',
                      zones: ['characters'],
                      filter: { name: ['Charlotte Katakuri'] },
                      count: { kind: 'exact', value: 1 },
                    },
                    keywords: ['rush'],
                    duration: { type: 'untilEndOfTurn' },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST07-004 Charlotte Snack
    // [DON!! x1] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains [Banish] and +1000 power during this battle.
    {
      cardId: 'ST07-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-004-when-attacking-add-life-to-hand-banish-plus-1000',
            text: '[DON!! x1] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains [Banish] and +1000 power during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Charlotte Snack'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfBattle' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Charlotte Snack'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // ST07-005 Charlotte Daifuku
    // [DON!! x1] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'ST07-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-005-when-attacking-add-life-to-hand-deck-to-life',
            text: '[DON!! x1] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
      ],
    },
    // ST07-007 Charlotte Brulee
    // [Blocker] [Trigger] Play this card.
    {
      cardId: 'ST07-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-007-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Charlotte Brulee'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST07-008 Charlotte Pudding
    // [On Play] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards.
    {
      cardId: 'ST07-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-008-on-play-look-life',
            text: "[On Play] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose whose life to look at',
                choices: [
                  {
                    id: 'st07-008-own-life',
                    label: 'Your Life',
                    actions: [
                      {
                        type: 'reveal',
                        player: 'self',
                        zone: 'life',
                        amount: 1,
                        storeAs: 'revealedLifeCard',
                      },
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['life'],
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'self',
                        destinationZone: 'life',
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                  {
                    id: 'st07-008-opponent-life',
                    label: "Opponent's Life",
                    actions: [
                      {
                        type: 'reveal',
                        player: 'opponent',
                        zone: 'life',
                        amount: 1,
                        storeAs: 'revealedLifeCard',
                      },
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['life'],
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'life',
                        chooseDestinationPosition: true,
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
    // ST07-009 Charlotte Mont-d'Or
    // [Activate:Main] You may rest this Character and add 1 card from the top or bottom of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 3 or less. [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'ST07-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-009-activate-main-rest-add-life-ko-cost-3-or-less',
            text: "[Activate:Main] You may rest this Character and add 1 card from the top or bottom of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ["Charlotte Mont-d'Or"] },
                  count: { kind: 'exact', value: 1 },
                },
              },
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
            id: 'st07-009-trigger-trash-play',
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
                  filter: { name: ["Charlotte Mont-d'Or"] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST07-010 Charlotte Linlin (010)
    // [On Play] Your opponent chooses one: • Trash 1 card from the top of your opponent's Life cards. • Add 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'ST07-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-010-on-play-opponent-choice-life',
            text: "[On Play] Your opponent chooses one: \u2022 Trash 1 card from the top of your opponent's Life cards. \u2022 Add 1 card from the top of your deck to the top of your Life cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'st07-010-trash-opponent-life',
                    label:
                      "Trash 1 card from the top of your opponent's Life cards",
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['life'],
                          count: { kind: 'exact', value: 1 },
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'trash',
                      },
                    ],
                  },
                  {
                    id: 'st07-010-deck-to-life',
                    label:
                      'Add 1 card from the top of your deck to the top of your Life cards',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['deck'],
                          count: { kind: 'exact', value: 1 },
                        },
                        destinationPlayer: 'self',
                        destinationZone: 'life',
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
    // ST07-011 Zeus
    // [Activate:Main] You may rest this Character: Up to 1 of your [Charlotte Linlin] cards gains [Banish] during this turn. [Trigger] Play this card.
    {
      cardId: 'ST07-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-011-activate-main-rest-banish-linlin',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your [Charlotte Linlin] cards gains [Banish] during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Zeus'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Charlotte Linlin'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st07-011-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Zeus'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST07-013 Prometheus
    // [Activate:Main] You may rest this Character: Up to 1 of your [Charlotte Linlin] cards gains [Double Attack] during this turn. [Trigger] Play this card.
    {
      cardId: 'ST07-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-013-activate-main-rest-double-attack-linlin',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your [Charlotte Linlin] cards gains [Double Attack] during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Prometheus'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Charlotte Linlin'] },
                  count: { kind: 'upTo', value: 1 },
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
            id: 'st07-013-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Prometheus'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST07-015 Soul Pocus
    // [Main] Your opponent chooses one: • Trash 1 card from the top of your opponent's Life cards. • Add 1 card from the top of your deck to the top of your Life cards. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'ST07-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-015-main-opponent-choice-life',
            text: "[Main] Your opponent chooses one: \u2022 Trash 1 card from the top of your opponent's Life cards. \u2022 Add 1 card from the top of your deck to the top of your Life cards.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'st07-015-trash-opponent-life',
                    label:
                      "Trash 1 card from the top of your opponent's Life cards",
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['life'],
                          count: { kind: 'exact', value: 1 },
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'trash',
                      },
                    ],
                  },
                  {
                    id: 'st07-015-deck-to-life',
                    label:
                      'Add 1 card from the top of your deck to the top of your Life cards',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['deck'],
                          count: { kind: 'exact', value: 1 },
                        },
                        destinationPlayer: 'self',
                        destinationZone: 'life',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st07-015-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'ST07-015',
                effectId: 'st07-015-main-opponent-choice-life',
              },
            ],
          },
        },
      ],
    },
    // ST07-016 Power Mochi
    // [Counter] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, up to 1 of your Leader or Character cards gains +2000 power during this battle. [Trigger] Draw 1 card, look at up to 1 card from the top of your opponent's Life cards, and place it at the top or bottom of the Life cards.
    {
      cardId: 'ST07-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-016-counter-look-life-plus-2000',
            text: "[Counter] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, up to 1 of your Leader or Character cards gains +2000 power during this battle.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose whose life to look at',
                choices: [
                  {
                    id: 'st07-016-counter-own-life',
                    label: 'Your Life',
                    actions: [
                      {
                        type: 'reveal',
                        player: 'self',
                        zone: 'life',
                        amount: 1,
                        storeAs: 'revealedLifeCard',
                      },
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['life'],
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'self',
                        destinationZone: 'life',
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                  {
                    id: 'st07-016-counter-opponent-life',
                    label: "Opponent's Life",
                    actions: [
                      {
                        type: 'reveal',
                        player: 'opponent',
                        zone: 'life',
                        amount: 1,
                        storeAs: 'revealedLifeCard',
                      },
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['life'],
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'opponent',
                        destinationZone: 'life',
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                ],
              },
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st07-016-trigger-draw-and-look-opponent-life',
            text: "[Trigger] Draw 1 card, look at up to 1 card from the top of your opponent's Life cards, and place it at the top or bottom of the Life cards.",
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'reveal',
                player: 'opponent',
                zone: 'life',
                amount: 1,
                storeAs: 'revealedLifeCard',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'life',
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // ST07-017 Queen Mama Chanter
    // [Activate:Main] You may rest this Stage and add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 of your Characters with a cost of 3 to the top of the owner's Life cards face-up.
    {
      cardId: 'ST07-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st07-017-activate-main-rest-add-life-character-to-life',
            text: "[Activate:Main] You may rest this Stage and add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 of your Characters with a cost of 3 to the top of the owner's Life cards face-up.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Queen Mama Chanter'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
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
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: false,
              },
            ],
          },
        },
      ],
    },
  ],
};
