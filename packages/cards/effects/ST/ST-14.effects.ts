import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st14EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-14',
  cards: [
    // ST14-001 Monkey.D.Luffy (001)
    // [DON!! x1] All of your Characters gain +1 cost. If you have a Character with a cost of 8 or more, this Leader gains +1000 power.
    {
      cardId: 'ST14-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st14-001-don-x1-all-characters-plus-1-cost',
            text: '[DON!! x1] All of your Characters gain +1 cost.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
              },
              cost: 1,
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'st14-001-don-x1-leader-plus-1000-if-character-8-cost',
            text: '[DON!! x1] If you have a Character with a cost of 8 or more, this Leader gains +1000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            modifier: {
              selector: { player: 'self', zones: ['leader'] },
              power: 1000,
            },
          },
        },
      ],
    },
    // ST14-002 Usopp
    // [DON!! x1] [When Attacking] If you have a Character with a cost of 8 or more, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'ST14-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-002-when-attacking-ko-cost-4-or-less',
            text: "[DON!! x1] [When Attacking] If you have a Character with a cost of 8 or more, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
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
    // ST14-003 Sanji (SP)
    // [On Play] If you have a Character with a cost of 6 or more, K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'ST14-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-003-on-play-ko-cost-5-or-less',
            text: "[On Play] If you have a Character with a cost of 6 or more, K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 6 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
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
    // ST14-004 Jinbe
    // [Activate:Main] [Once Per Turn] Up to 1 of your black "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent's next turn.
    {
      cardId: 'ST14-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-004-activate-main-once-plus-2-cost-straw-hat',
            text: '[Activate:Main] [Once Per Turn] Up to 1 of your black "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent\'s next turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
                    trait: ['Straw Hat Crew'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST14-006 Nami
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If you have 6 or less cards in your hand and a Character with a cost of 8 or more, draw 1 card.
    {
      cardId: 'ST14-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-006-on-play-draw-if-hand-6-or-less-and-cost-8',
            text: '[On Play] If you have 6 or less cards in your hand and a Character with a cost of 8 or more, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasHandAtMost', player: 'self', value: 6 },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST14-007 Nico Robin - ST14-007 (Pirate Foil)
    // [On Play] / [When Attacking] If you have a Character with a cost of 8 or more, give up to 1 of your opponent's Characters -5 cost during this turn.
    {
      cardId: 'ST14-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-007-on-play-minus-5-cost',
            text: "[On Play] If you have a Character with a cost of 8 or more, give up to 1 of your opponent's Characters -5 cost during this turn.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -5,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st14-007-when-attacking-minus-5-cost',
            text: "[When Attacking] If you have a Character with a cost of 8 or more, give up to 1 of your opponent's Characters -5 cost during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -5,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST14-008 Haredas
    // [Activate:Main] You may rest this Character: Up to 1 of your black "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent's next turn. Then, if you have a Character with a cost of 8 or more, draw 1 card and trash 1 card from your hand.
    {
      cardId: 'ST14-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-008-activate-main-rest-plus-2-cost-then-draw-trash',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your black "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent\'s next turn. Then, if you have a Character with a cost of 8 or more, draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Haredas'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
                    trait: ['Straw Hat Crew'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'targetExists',
                    selector: {
                      player: 'self',
                      zones: ['characters'],
                      filter: { cardCategory: ['Character'], costMin: 8 },
                    },
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
            ],
          },
        },
      ],
    },
    // ST14-009 Franky
    // [DON!! x1] [Opponent's Turn] If you have a Character with a cost of 6 or more, this Character cannot be K.O.'d by your opponent's effects and gains +2000 power.
    {
      cardId: 'ST14-009',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st14-009-don-x1-opponent-turn-cannot-be-koed-plus-2000',
            text: "[DON!! x1] [Opponent's Turn] If you have a Character with a cost of 6 or more, this Character cannot be K.O.'d by your opponent's effects and gains +2000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: false },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 6 },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Franky'] },
              },
              power: 2000,
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
      ],
    },
    // ST14-011 Heracles
    // [Activate:Main] You may rest this Character: Up to 1 of your black "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent's next turn.
    {
      cardId: 'ST14-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-011-activate-main-rest-plus-2-cost-straw-hat',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your black "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent\'s next turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Heracles'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
                    trait: ['Straw Hat Crew'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST14-012 Monkey.D.Luffy (012)
    // If you have a Character with a cost of 10 or more, this Character gains [Rush]. (This card can attack on the turn in which it is played.)
    {
      cardId: 'ST14-012',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st14-012-rush-if-character-10-cost',
            text: 'If you have a Character with a cost of 10 or more, this Character gains [Rush].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 10 },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Monkey.D.Luffy (012)'] },
              },
              keywords: ['rush'],
            },
          },
        },
      ],
    },
    // ST14-014 Gum-Gum Giant Rifl
    // [Counter] If you have a Character with a cost of 8 or more, up to 1 of your Leader or Character cards gains +3000 power during this battle. [Trigger] Add up to 1 of your Character cards with a cost of 2 or less from your trash to your hand.
    {
      cardId: 'ST14-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-014-counter-plus-3000-if-cost-8',
            text: '[Counter] If you have a Character with a cost of 8 or more, up to 1 of your Leader or Character cards gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st14-014-trigger-add-character-cost-2-or-less-from-trash',
            text: '[Trigger] Add up to 1 of your Character cards with a cost of 2 or less from your trash to your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  costMax: 2,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // ST14-015 Gum-Gum Diable Three-Swords Style Mouten Jet Six Hundred Pound Phoenix Cannon
    // [Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if you have a Character with a cost of 8 or more, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    // [Trigger] If you have a Character with a cost of 8 or more, K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'ST14-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-015-main-plus-3000-then-ko-cost-2-or-less',
            text: "[Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if you have a Character with a cost of 8 or more, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'targetExists',
                    selector: {
                      player: 'self',
                      zones: ['characters'],
                      filter: { cardCategory: ['Character'], costMin: 8 },
                    },
                  },
                ],
                actions: [
                  {
                    type: 'ko',
                    selector: {
                      player: 'opponent',
                      zones: ['characters'],
                      filter: { cardCategory: ['Character'], costMax: 2 },
                      count: { kind: 'upTo', value: 1 },
                    },
                    upTo: true,
                    reason: 'effect',
                  },
                ],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st14-015-trigger-ko-cost-5-or-less',
            text: "[Trigger] If you have a Character with a cost of 8 or more, K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
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
    // ST14-016 I Have My Crew!! (Pirate Foil)
    // [Main] Draw 1 card. Then, up to 1 of your Characters gains +3 cost until the end of your opponent's next turn.[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'ST14-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st14-016-main-draw-plus-3-cost',
            text: "[Main] Draw 1 card. Then, up to 1 of your Characters gains +3 cost until the end of your opponent's next turn.",
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st14-016-trigger-ko-cost-3-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'trigger' },
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
      ],
    },
    // ST14-017 Thousand Sunny (Pirate Foil)
    // All of your black "Straw Hat Crew" type Characters gain +1 cost.[On Play] If your Leader has the "Straw Hat Crew" type, draw 1 card.
    {
      cardId: 'ST14-017',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st14-017-all-black-straw-hat-plus-1-cost',
            text: 'All of your black "Straw Hat Crew" type Characters gain +1 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { color: ['Black'], trait: ['Straw Hat Crew'] },
              },
              cost: 1,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st14-017-on-play-draw-if-leader-straw-hat',
            text: '[On Play] If your Leader has the "Straw Hat Crew" type, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
  ],
};
