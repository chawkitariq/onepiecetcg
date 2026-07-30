import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const op14EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-14',
  cards: [
    {
      cardId: 'OP14-001',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-001-special',
        },
      ],
    },
    {
      cardId: 'OP14-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'urouge-when-attacking-5000-draw-ko-3000',
            text: "[When Attacking] If this Character has 5000 power or more, draw 1 card and K.O. up to 1 of your opponent's Characters with 3000 base power or less.",
            trigger: {
              type: 'whenAttacking',
            },
            conditions: [
              {
                type: 'sourcePowerAtLeast',
                value: 5000,
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 3000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'capone-cannot-be-koed-by-effects',
            text: "This Character cannot be K.O.'d by effects of your opponent's Characters with 5000 base power or less.",
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP14-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'cavendish-5000-rush',
            text: 'If this Character has 5000 power or more, this Character gains [Rush].',
            conditions: [
              {
                type: 'sourcePowerAtLeast',
                value: 5000,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['rush'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP14-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'killer-activate-main-don-attach',
            text: '[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shachi-penguin-when-attacking-5000-minus-2000',
            text: "[When Attacking] If this Character has 5000 power or more, give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: {
              type: 'whenAttacking',
            },
            conditions: [
              {
                type: 'sourcePowerAtLeast',
                value: 5000,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-007',
      effects: [],
    },
    {
      cardId: 'OP14-008',
      effects: [],
    },
    {
      cardId: 'OP14-009',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-009-special',
        },
      ],
    },
    {
      cardId: 'OP14-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-on-ko-search-play-supernovas',
            text: '[On K.O.] Look at 5 cards from the top of your deck; play up to 1 {Supernovas} type Character card with 2000 power or less other than [Basil Hawkins]. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Supernovas'],
                  powerMax: 2000,
                  excludeName: ['Basil Hawkins'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'characters',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-011',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'bartolomeo-011-don-2-gains-blocker',
            text: '[DON!! x2] This Character gains [Blocker].',
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP14-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bepo-when-attacking-5000-don-attach',
            text: '[When Attacking] If this Character has 5000 power or more, give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: {
              type: 'whenAttacking',
            },
            conditions: [
              {
                type: 'sourcePowerAtLeast',
                value: 5000,
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'luffy-013-on-play-search-supernovas',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Supernovas} type card other than [Monkey.D.Luffy] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Supernovas'],
                  excludeName: ['Monkey.D.Luffy'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
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
            id: 'luffy-013-when-attacking-minus-1000',
            text: "[When Attacking] Give up to 1 of your opponent's Characters -1000 power during this turn.",
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eustass-kid-014-on-play-supernovas-leader-play-red',
            text: '[On Play] If your Leader has the {Supernovas} type, play up to 1 red Character card with 2000 power or less from your hand.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
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
                    color: ['Red'],
                    powerMax: 2000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zoro-015-when-attacking-minus-1000',
            text: "[When Attacking] Give up to 1 of your opponent's Characters -1000 power during this turn.",
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'x-drake-when-attacking-don-1-minus-2000',
            text: "[DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: {
              type: 'whenAttacking',
            },
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 1,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-017',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-017-special',
        },
      ],
    },
    {
      cardId: 'OP14-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'time-for-counterattack-counter-4000',
            text: '[Counter] If there is a Character with 8000 power or more, up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMin: 8000,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 4000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'time-for-counterattack-trigger-play-red',
            text: '[Trigger] Play up to 1 red Character card with 2000 power or less from your hand.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    powerMax: 2000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'plan-take-down-emperor-main-search',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 {Supernovas} or {Straw Hat Crew} type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Supernovas', 'Straw Hat Crew'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
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
            id: 'plan-take-down-emperor-trigger-draw',
            text: '[Trigger] Draw 1 card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-020',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-020-special',
        },
      ],
    },
    {
      cardId: 'OP14-021',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-021-special',
        },
      ],
    },
    {
      cardId: 'OP14-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopp-end-of-turn-unrest-don-film-straw-hat',
            text: '[End of Your Turn] If your Leader has the {FILM} or {Straw Hat Crew} type, set up to 2 of your DON!! cards as active.',
            trigger: {
              type: 'onTurnEnd',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'FILM',
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: {
                    kind: 'upTo',
                    value: 2,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kikunojo-end-of-turn-restand',
            text: '[End of Your Turn] Set this Character as active.',
            trigger: {
              type: 'onTurnEnd',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kinemon-on-play-unrest-don',
            text: '[On Play] Set up to 3 of your DON!! cards as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: {
                    kind: 'upTo',
                    value: 3,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kinemon-on-ko-rest-opponent',
            text: "[On K.O.] Rest up to 1 of your opponent's cards.",
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters', 'stage'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuro-on-play-leader-kuro-play-east-blue',
            text: '[On Play] If your Leader is [Kuro], play up to 1 {East Blue} type Character card with a cost of 6 or less from your hand.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Kuro',
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
                    trait: ['East Blue'],
                    costMax: 6,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-026',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kouzuki-oden-opponent-turn-rested-plus-2000',
            text: "[Opponent's Turn] If this Character is rested, this Character gains +2000 power.",
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP14-027',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'shanks-027-opponent-turn-rested-opponent-plus-1000',
            text: "[Opponent's Turn] If this Character is rested, give all of your opponent's Characters +1000 power.",
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
              },
              power: 1000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shanks-027-on-play-rested-rest-7000-or-less',
            text: "[Your Turn] When this Character becomes rested, rest up to 1 of your opponent's Characters with 7000 base power or less.",
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 7000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shanks-027-on-don-attached-rested-rest-7000-or-less',
            text: "[Your Turn] When this Character becomes rested, rest up to 1 of your opponent's Characters with 7000 base power or less.",
            trigger: {
              type: 'onDonAttached',
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 7000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'johnny-on-play-rested-ko-rested-cost-2-or-less',
            text: "[Your Turn] When this Character becomes rested, K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
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
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'johnny-on-don-attached-rested-ko-rested-cost-2-or-less',
            text: "[Your Turn] When this Character becomes rested, K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
            trigger: {
              type: 'onDonAttached',
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
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
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-029',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'tashigi-opponent-turn-remove-replacement',
            text: "[Opponent's Turn] If this Character would be removed from the field by your opponent's effect, you may rest 1 of your cards instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
            ],
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'cost', 'leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'tashigi-activate-main-rest-2-plus-2000',
            text: "[Activate: Main] [Once Per Turn] You may rest 2 of your cards: This Character gains +2000 power until the end of your opponent's next End Phase.",
            trigger: {
              type: 'activateMain',
              optional: true,
              oncePerTurn: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'cost', 'leader'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-030',
      effects: [],
    },
    {
      cardId: 'OP14-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-031-on-play-rest-cost-8-or-less',
            text: "[On Play] Rest up to 2 of your opponent's Characters with a cost of 8 or less.",
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 8,
                  },
                  count: {
                    kind: 'upTo',
                    value: 2,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nami-031-schedule-unrest-end-of-turn',
            text: 'Then, set up to 5 of your DON!! cards as active at the end of this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'scheduleActionsAtTurnEnd',
                actions: [
                  {
                    type: 'unrest',
                    selector: {
                      player: 'self',
                      zones: ['cost'],
                      count: {
                        kind: 'upTo',
                        value: 5,
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'humandrill-on-play-rested-rest-cost-4-or-less',
            text: "[Your Turn] When this Character becomes rested, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'humandrill-on-don-attached-rested-rest-cost-4-or-less',
            text: "[Your Turn] When this Character becomes rested, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: {
              type: 'onDonAttached',
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'sourceIsRested',
                value: true,
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-033',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-033-special',
        },
        {
          kind: 'standard',
          effect: {
            id: 'perona-033-on-ko-rest-play-green',
            text: '[On K.O.] You may rest 1 of your cards: Play up to 1 green Character card with a cost of 5 or less from your hand.',
            trigger: {
              type: 'onKo',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'cost', 'leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
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
                    color: ['Green'],
                    costMax: 5,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-034',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'luffy-034-your-turn-straw-hat-cost-4-plus-1000',
            text: '[Your Turn] All of your green {Straw Hat Crew} type Characters with a base cost of 4 or more gain +1000 power.',
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  color: ['Green'],
                  trait: ['Straw Hat Crew'],
                  baseCostMin: 4,
                },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP14-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'strive-to-surpass-zoro-counter-4000',
            text: '[Counter] You may rest 1 of your cards: Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: {
              type: 'activateCounter',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'cost', 'leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 4000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'strive-to-surpass-zoro-trigger-rest',
            text: "[Trigger] You may rest 1 of your cards: Rest up to 1 of your opponent's Characters with 7000 base power or less.",
            trigger: {
              type: 'trigger',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'cost', 'leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 7000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'for-fun-main-rest-3-ko-rested-7000',
            text: "[Main] You may rest 3 of your cards: K.O. up to 1 of your opponent's rested Characters with 7000 base power or less.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'cost', 'leader'],
                  count: {
                    kind: 'exact',
                    value: 3,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    powerMax: 7000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'for-fun-counter-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'never-bother-faces-main-rest-2-draw-rest',
            text: "[Main] You may rest 2 of your cards: Draw 1 card and rest up to 1 of your opponent's Characters with 7000 base power or less.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage', 'cost', 'leader'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 7000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'never-bother-faces-counter-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'coffin-boat-on-play-leader-mihawk-draw',
            text: '[On Play] If your Leader is [Dracule Mihawk], draw 1 card.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Dracule Mihawk',
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'coffin-boat-end-of-turn-leader-mihawk-unrest-don',
            text: '[End of Your Turn] If your Leader is [Dracule Mihawk], set up to 1 of your DON!! cards as active.',
            trigger: {
              type: 'onTurnEnd',
            },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Dracule Mihawk',
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-040-activate-main-trash-attach-don-fish-man',
            text: '[Activate: Main] You may trash 1 card from your hand: Give up to 2 rested DON!! cards to 1 of your {Fish-Man} or {Merfolk} type Leader or Character cards.',
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    trait: ['Fish-Man', 'Merfolk'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-041-opponent-turn-on-character-play-draw-1',
            text: "[Opponent's Turn] When you play a Character, draw 1 card.",
            trigger: {
              type: 'onCharacterPlayed',
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'eventPlayerIs',
                player: 'self',
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-041-on-ko-opponent-life-to-owner-hand',
            text: "[DON!!x1] [Once Per Turn] When one of your {Amazon Lily} or {Kuja Pirates} type Characters with 5000 base power or more is K.O.'d add up to 1 card from the top of your opponent's Life cards to the owner's hand.",
            trigger: {
              type: 'onKo',
              oncePerTurn: true,
            },
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 1,
              },
              {
                type: 'eventPlayerIs',
                player: 'self',
              },
              {
                type: 'eventTargetMatchesFilter',
                filter: {
                  cardCategory: ['Character'],
                  owner: 'self',
                  trait: ['Amazon Lily', 'Kuja Pirates'],
                  basePowerMin: 5000,
                },
              },
            ],
            actions: [
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: {
                    kind: 'upTo',
                    value: 1,
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
    {
      cardId: 'OP14-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'arlong-042-on-play-fish-man-leader-search',
            text: '[On Play] If your Leader has the {Fish Man} type, look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  costMin: 2,
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'aladine-on-play-fish-man-merfolk-cost-3',
            text: '[On Play] Play up to 1 {Fish-Man} or {Merfolk} type Character card with a cost of 3 or less from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Fish-Man', 'Merfolk'],
                    costMax: 3,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'aladine-on-ko-draw',
            text: '[On K.O.] Draw 1 card.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-newgate-044-on-play-whitebeard-reveal-draw-2-trash-1',
            text: '[On Play] Reveal 1 card from the top of your deck. If that card\'s type includes "Whitebeard Pirates", draw 2 cards and trash 1 card from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'revealedTopDeckCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
              {
                type: 'revealStoredCards',
                key: 'revealedTopDeckCard',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'revealedTopDeckCard',
                filter: {
                  traitIncludes: ['Whitebeard Pirates'],
                },
                actions: [
                  {
                    type: 'draw',
                    player: 'self',
                    amount: 2,
                  },
                  {
                    type: 'trashFromHand',
                    selector: {
                      player: 'self',
                      zones: ['hand'],
                      count: {
                        kind: 'exact',
                        value: 1,
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuroobi-045-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kuroobi-045-hand-trash-by-effect-gain-rush',
            text: 'When a card is trashed from your hand by an effect, this Character gains [Rush] during this turn.',
            trigger: {
              type: 'onCardRemovedByEffect',
            },
            conditions: [
              {
                type: 'eventPlayerIs',
                player: 'self',
              },
              {
                type: 'eventSourceZoneIs',
                value: 'hand',
              },
              {
                type: 'eventDestinationZoneIs',
                value: 'trash',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                keywords: ['rush'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-activate-main-trash-self-buff-fish-man',
            text: '[Activate: Main] You may trash this Character: Up to 1 of your {Fish-Man} or {Merfolk} type Leader or Character cards gains +2000 power during this turn.',
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    trait: ['Fish-Man', 'Merfolk'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirahoshi-on-play-draw-play-fish-man',
            text: '[On Play] Draw 1 card and play up to 1 {Fish-Man} or {Merfolk} type Character card with a cost of 3 or less from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Fish-Man', 'Merfolk'],
                    costMax: 3,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shiryu-on-play-bounce-trash-hand',
            text: "[On Play] Return up to 1 of your opponent's Characters to the owner's hand. Then, trash all cards from your hand.",
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'any',
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-049-hand-trash-by-effect-gain-rush',
            text: 'When a card is trashed from your hand by an effect, this Character gains [Rush] during this turn.',
            trigger: {
              type: 'onCardRemovedByEffect',
            },
            conditions: [
              {
                type: 'eventPlayerIs',
                player: 'self',
              },
              {
                type: 'eventSourceZoneIs',
                value: 'hand',
              },
              {
                type: 'eventDestinationZoneIs',
                value: 'trash',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                keywords: ['rush'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-049-on-play-rest-2-don-draw-2-bounce-7-or-less',
            text: "[On Play] You may rest 2 of your DON!! cards: Draw 2 cards and return up to 1 Character with a cost of 7 or less to the owner's hand.",
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: {
                    rested: false,
                  },
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 7,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
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
    {
      cardId: 'OP14-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chew-on-play-fish-man-leader-draw',
            text: '[On Play] If your Leader has the {Fish-Man} type, draw 1 card.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hatchan-don-2-on-ko-draw',
            text: '[DON!! x2] [On K.O.] Draw 1 card.',
            trigger: {
              type: 'onKo',
            },
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 2,
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hannyabal-on-play-trash-3-play-impel-down',
            text: '[On Play] You may trash 3 cards from your hand: Play up to 1 {Impel Down} type Character card with a cost of 6 or less from your hand.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 3,
                  },
                },
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
                    trait: ['Impel Down'],
                    costMax: 6,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-053',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-053-special',
        },
      ],
    },
    {
      cardId: 'OP14-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fisher-tiger-on-play-fish-man-draw-3',
            text: '[On Play] If your Leader has the {Fish-Man} type, draw 3 cards.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 3,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'fisher-tiger-end-of-turn-trash-to-5',
            text: '[End of Your Turn] Trash cards from your hand until you have 5 cards in your hand.',
            trigger: {
              type: 'onTurnEnd',
            },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'any',
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-055',
      effects: [],
    },
    {
      cardId: 'OP14-056',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'wadatsumi-cannot-attack',
            text: 'This Character cannot attack.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotAttack'],
            },
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-056-special',
        },
      ],
    },
    {
      cardId: 'OP14-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dont-worry-main-fish-man-merfolk-1000',
            text: '[Main] All of your {Fish-Man} or {Merfolk} type Leader and Character cards gain +1000 power during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    trait: ['Fish-Man', 'Merfolk'],
                  },
                },
                amount: 1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'dont-worry-trigger-draw-2',
            text: '[Trigger] Draw 2 cards.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ocean-current-main-rest-don-play-fish-man-bounce',
            text: "[Main] You may rest 3 of your DON!! cards: Play up to 1 {Fish-Man} type Character card with a cost of 3 or less from your hand. Then, return up to 1 Character with 6000 base power to the owner's hand.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: {
                    kind: 'exact',
                    value: 3,
                  },
                },
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
                    trait: ['Fish-Man'],
                    costMax: 3,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 6000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ocean-current-counter-draw-3000',
            text: '[Counter] Draw 1 card and your Leader gains +3000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'please-take-me-main-jinbe-draw',
            text: '[Main] If your Leader is [Jinbe] and you have 2 or less cards in your hand, draw 2 cards.',
            trigger: {
              type: 'activateMain',
            },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Jinbe',
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                },
                value: 2,
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'please-take-me-trigger-bounce-cost-4',
            text: "[Trigger] Return up to 1 Character with a cost of 4 or less to the owner's hand.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
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
    {
      cardId: 'OP14-060',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-060-special',
        },
      ],
    },
    {
      cardId: 'OP14-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vergo-when-attacking-don-1-minus-2000',
            text: "[When Attacking] DON!! 1: Give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: {
              type: 'whenAttacking',
            },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-062',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-062-special',
        },
      ],
    },
    {
      cardId: 'OP14-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sugar-on-play-add-don-active',
            text: '[On Play] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sugar-on-ko-opponent-don-6-play-donquixote',
            text: '[On K.O.] If your opponent has 6 or more DON!! cards on their field, play up to 1 {Donquixote Pirates} type Character card with a cost of 5 or less from your hand.',
            trigger: {
              type: 'onKo',
            },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'opponent',
                value: 6,
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
                    trait: ['Donquixote Pirates'],
                    costMax: 5,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'giolla-on-ko-add-don-rested-ko-power-0',
            text: "[On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it. Then, K.O. up to 1 of your opponent's Characters with a base power of 0.",
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 0,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'senor-pink-on-ko-opponent-return-don',
            text: '[On K.O.] Your opponent returns 1 DON!! card from their field to their DON!! deck.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'removeDon',
                player: 'opponent',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-066',
      effects: [],
    },
    {
      cardId: 'OP14-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dellinger-on-ko-add-don-search-donquixote',
            text: '[On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it, look at 5 cards from the top of your deck; reveal up to 1 {Donquixote Pirates} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Donquixote Pirates'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trebol-on-don-returned-add-don-donquixote-leader',
            text: "[Opponent's Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, if your Leader has the {Donquixote Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.",
            trigger: {
              type: 'onDonReturned',
              oncePerTurn: true,
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-069',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-069-special',
        },
      ],
    },
    {
      cardId: 'OP14-070',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-070-special',
        },
      ],
    },
    {
      cardId: 'OP14-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pica-end-of-turn-add-don-active-donquixote',
            text: '[End of Your Turn] If your Leader has the {Donquixote Pirates} type, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'onTurnEnd',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-on-play-add-don-active',
            text: '[On Play] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-on-ko-don-1-add-to-life',
            text: '[On K.O.] DON!! 1: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: {
              type: 'onKo',
            },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'addToLife',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-073',
      effects: [],
    },
    {
      cardId: 'OP14-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monet-on-play-add-don-donquixote',
            text: '[On Play] If your Leader has the {Donquixote Pirates} type, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monet-on-ko-draw-trash-add-don',
            text: '[On K.O.] Draw 2 cards and trash 1 card from your hand. Then, add up to 2 DON!! cards from your DON!! deck and rest them.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
              {
                type: 'addDon',
                player: 'self',
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lao-g-on-ko-add-don-rested-modify-power',
            text: "[On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it. Then, give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ever-white-main-rest-don-add-don-rested',
            text: '[Main] You may rest 2 of your DON!! cards: If your Leader has the {Donquixote Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ever-white-counter-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'penta-chromatic-string-counter-4000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 4000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'penta-chromatic-string-counter-add-don',
            text: 'Then, if your opponent has a Character with 6000 power or more, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: {
              type: 'activateCounter',
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMin: 6000,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bullet-string-counter-don-1-2000-battle',
            text: '[Counter] DON!! 1: If your Leader has the {Donquixote Pirates} type, up to 1 of your Leader or Character cards gains +2000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'bullet-string-counter-additional-2000-turn',
            text: 'Then, that card gains an additional +2000 power during this turn.',
            trigger: {
              type: 'activateCounter',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-079',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-079-special',
        },
      ],
    },
    {
      cardId: 'OP14-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gecko-moria-080-activate-main-ko-thriller-bark-plus-1000',
            text: '[Activate: Main] [Once Per Turn] You may K.O. 1 of your {Thriller Bark Pirates} type Characters: Your Leader and all of your Characters gain +1000 power during this turn.',
            trigger: {
              type: 'activateMain',
              optional: true,
              oncePerTurn: true,
            },
            costs: [
              {
                type: 'ko',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                },
                amount: 1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gecko-moria-080-when-attacking-trash-3-add-to-life',
            text: '[When Attacking] You may trash 3 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: {
              type: 'whenAttacking',
              optional: true,
            },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 3,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'addToLife',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spider-mice-on-play-trash-deck-3',
            text: '[On Play] Trash 3 cards from the top of your deck.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 3,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'spider-mice-on-ko-ko-base-cost-1',
            text: "[On K.O.] K.O. up to 1 of your opponent's Characters with a base cost of 1.",
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMax: 1,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'oinkchuck-on-ko-modify-cost-thriller-bark',
            text: "[On K.O.] All of your {Thriller Bark Pirates} type Characters gain +4 cost until the end of your opponent's next End Phase.",
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                  },
                },
                amount: 4,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ms-wednesday-activate-main-trash-self-buff-0-cost',
            text: "[Activate: Main] You may trash this Character: Give up to 1 of your opponent's 0 cost Characters 3000 power during this turn.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ms-all-sunday-on-play-play-baroque-works-from-trash',
            text: '[On Play] If your Leader\'s type includes "Baroque Works", play up to 1 Character card with a type including "Baroque Works" and a cost of 4 or less and up to 1 Character card with a type including "Baroque Works" and a cost of 1 from your trash.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Baroque Works'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Baroque Works'],
                    costMax: 1,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-goldenweek-on-ko-draw-2-trash-2',
            text: '[On K.O.] Draw 2 cards and trash 2 cards from your hand.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-086',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'miss-doublefinger-trash-7-plus-1000',
            text: 'If you have 7 or more cards in your trash, this Character gains +1000 power.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 1000,
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'miss-doublefinger-trash-7-baroque-cost-plus-2',
            text: 'If you have 7 or more cards in your trash, all of your Characters with a type including "Baroque Works" gain +2 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Baroque Works'],
                },
              },
              cost: 2,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP14-087',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-valentine-on-play-search-baroque-works',
            text: '[On Play] If your Leader\'s type includes "Baroque Works", look at 4 cards from the top of your deck; reveal up to 1 card with a type including "Baroque Works" other than [Miss.Valentine(Mikita)] and add it to your hand. Then, trash the rest.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Baroque Works'],
                  excludeName: ['Miss.Valentine(Mikita)'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-merry-christmas-on-ko-draw-ko-stage',
            text: '[On K.O.] If your Leader\'s type includes "Baroque Works", draw 1 card and K.O. up to 1 of your opponent\'s Stages with a cost of 1.',
            trigger: {
              type: 'onKo',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['stage'],
                  filter: {
                    cardCategory: ['Stage'],
                    costMax: 1,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-089',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ryuma-on-ko-draw-2-trash-2',
            text: '[On K.O.] Draw 2 cards and trash 2 cards from your hand.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ryuma-trigger-play-thriller-bark-rested',
            text: '[Trigger] Play up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your trash rested.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-090',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'mr-1-can-attack-characters-on-play-turn',
            text: 'If there is a Character with a cost of 0 or with a cost of 8 or more, this Character can attack Characters on the turn in which it is played.',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'mr-1-on-play-rest-cost-0',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 0.",
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 0,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-2-on-ko-play-baroque-works-from-hand',
            text: '[On K.O.] Play up to 1 Character card with a type including "Baroque Works" and a cost of 5 or less other than [Mr.2.Bon.Kurei.(Bentham)] from your hand.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Baroque Works'],
                    costMax: 5,
                    excludeName: ['Mr.2.Bon.Kurei.(Bentham)'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'mr-2-on-ko-play-baroque-works-from-trash',
            text: '[On K.O.] Play up to 1 Character card with a type including "Baroque Works" and a cost of 5 or less other than [Mr.2.Bon.Kurei.(Bentham)] from your trash.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Baroque Works'],
                    costMax: 5,
                    excludeName: ['Mr.2.Bon.Kurei.(Bentham)'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-092',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'mr-3-opponent-turn-ko-replacement',
            text: "[Opponent's Turn] [Once Per Turn] If this Character would be K.O.'d, you may place 3 cards from your trash at the bottom of your deck in any order instead.",
            event: 'wouldKoCharacter',
            optional: true,
            oncePerTurn: true,
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
            ],
            replacement: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: {
                    kind: 'exact',
                    value: 3,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-4-on-ko-recover-baroque-works-from-trash',
            text: '[On K.O.] Add up to 1 Character card with a type including "Baroque Works" and a cost of 8 or less from your trash to your hand.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Baroque Works'],
                  costMax: 8,
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-5-on-play-draw-2-trash-1-cost-condition',
            text: '[On Play] If there is a Character with a cost of 0 or with a cost of 8 or more, draw 2 cards and trash 1 card from your hand.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                },
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-095',
      effects: [],
    },
    {
      cardId: 'OP14-096',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-096-special',
        },
      ],
    },
    {
      cardId: 'OP14-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hurry-up-make-me-pirate-king-main-search',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 {Thriller Bark Pirates} type card other than [Hurry Up and Make Me the Pirate King!] and add it to your hand. Then, trash the rest.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Thriller Bark Pirates'],
                  excludeName: ['Hurry Up and Make Me the Pirate King!'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hurry-up-make-me-pirate-king-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP14-097',
                effectId: 'hurry-up-make-me-pirate-king-main-search',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crescent-cutlass-main-baroque-cost-3',
            text: '[Main] If there is a Character with a cost of 0 or with a cost of 8 or more, all of your Characters with a type including "Baroque Works" gain +3 cost until the end of your opponent\'s next End Phase.',
            trigger: {
              type: 'activateMain',
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
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
                    trait: ['Baroque Works'],
                  },
                },
                amount: 3,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'crescent-cutlass-counter-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'disappointed-main-search-baroque-works',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 card with a type including "Baroque Works" other than [Disappointed?] and add it to your hand. Then, trash the rest.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Baroque Works'],
                  excludeName: ['Disappointed?'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'disappointed-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP14-099',
                effectId: 'disappointed-main-search-baroque-works',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'absalom-on-ko-search-thriller-bark',
            text: '[On K.O.] Look at 3 cards from the top of your deck; reveal up to 1 {Thriller Bark Pirates} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Thriller Bark Pirates'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
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
            id: 'absalom-trigger-play-thriller-bark-rested',
            text: '[Trigger] Play up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your trash rested.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-101',
      effects: [],
    },
    {
      cardId: 'OP14-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kumacy-trigger-play-thriller-bark-rested',
            text: '[Trigger] Play up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your trash rested.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-103',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-103-special',
        },
      ],
    },
    {
      cardId: 'OP14-104',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-104-special',
        },
      ],
    },
    {
      cardId: 'OP14-105',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-105-special',
        },
      ],
    },
    {
      cardId: 'OP14-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'salome-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-107',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shakuyaku-on-play-opponent-life-3-draw-trash',
            text: '[On Play] If your opponent has 3 or less Life cards, draw 2 cards and trash 2 cards from your hand.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'opponent',
                value: 3,
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shakuyaku-trigger-play-kuja',
            text: '[Trigger] If your Leader has the {Kuja Pirates} type, play this card.',
            trigger: {
              type: 'trigger',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kuja Pirates',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'silvers-rayleigh-on-play-multicolor-ko-7000',
            text: "[On Play] If your Leader is multicolored and your opponent has 3 or less Life cards, K.O. up to 1 of your opponent's Characters with 7000 base power or less.",
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
              {
                type: 'playerHasLifeAtMost',
                player: 'opponent',
                value: 3,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 7000,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'silvers-rayleigh-trigger-activate-on-play',
            text: "[Trigger] Activate this card's [On Play] effect.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP14-108',
                effectId: 'silvers-rayleigh-on-play-multicolor-ko-7000',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'victoria-cindry-trigger-play-thriller-bark-rested',
            text: '[Trigger] Play up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your trash rested.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dr-hogback-on-ko-play-trigger-from-trash',
            text: '[On K.O.] Play up to 1 Character card with a cost of 4 or less and a [Trigger] other than [Dr. Hogback] from your trash.',
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    hasTrigger: true,
                    excludeName: ['Dr. Hogback'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'dr-hogback-trigger-play-thriller-bark-rested',
            text: '[Trigger] Play up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your trash rested.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-111',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-111-special',
        },
      ],
    },
    {
      cardId: 'OP14-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-112-on-play-add-to-life-take-life',
            text: "[On Play] If your Leader has the {The Seven Warlords of the Sea} type, add up to 1 card from the top of your deck to the top of your Life cards. Then, add up to 1 card from the top of your opponent's Life cards to the owner's hand.",
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'The Seven Warlords of the Sea',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-112-trigger-play-trigger-character',
            text: '[Trigger] Play up to 1 Character card with 6000 power or less and a [Trigger] from your hand.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                    hasTrigger: true,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marguerite-on-play-search-amazon-kuja',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Amazon Lily} or {Kuja Pirates} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order and trash 1 card from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Amazon Lily', 'Kuja Pirates'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'marguerite-trigger-play-kuja',
            text: '[Trigger] If your Leader has the {Kuja Pirates} type, play this card.',
            trigger: {
              type: 'trigger',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kuja Pirates',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ran-activate-main-don-attach-kuja',
            text: '[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your {Kuja Pirates} type Leader or Character cards.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    trait: ['Kuja Pirates'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ran-trigger-play-kuja',
            text: '[Trigger] If your Leader has the {Kuja Pirates} type, play this card.',
            trigger: {
              type: 'trigger',
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kuja Pirates',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-115',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-115-special',
        },
      ],
    },
    {
      cardId: 'OP14-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'salamander-counter-2000-play-amazon-kuja',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, play up to 1 {Amazon Lily} or {Kuja Pirates} type Character card with a cost of 4 or less from your hand.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Amazon Lily', 'Kuja Pirates'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'salamander-trigger-draw',
            text: '[Trigger] Draw 1 card.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brick-bat-counter-3000-thriller-bark',
            text: '[Counter] Up to 1 of your {Thriller Bark Pirates} type Leader or Character cards gains +3000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    trait: ['Thriller Bark Pirates'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 3000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'brick-bat-trigger-play-thriller-bark-rested',
            text: '[Trigger] Play up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your trash rested.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'youll-frighten-me-counter-prevent-attack',
            text: "[Counter] If you have 2 or less Life cards, up to 1 of your opponent's active Characters cannot attack during this turn.",
            trigger: {
              type: 'activateCounter',
            },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: false,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                keywords: ['cannotAttack'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'youll-frighten-me-trigger-play-trigger-character',
            text: '[Trigger] Play up to 1 Character card with 6000 power or less and a [Trigger] from your hand.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                    hasTrigger: true,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP14-119',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-119-special',
        },
      ],
    },
    {
      cardId: 'OP14-120',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-120-on-play-restrict-attack-draw',
            text: "[On Play] up to 1 of your opponent's Characters with a cost of 9 or less cannot attack until the end of your opponent's next End Phase. Then, if your opponent has a Character with a cost of 0 or with a cost of 8 or more, draw 1 card.",
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 9,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                turns: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-120-on-play-conditional-draw',
            text: 'Then, if your opponent has a Character with a cost of 0 or with a cost of 8 or more, draw 1 card.',
            trigger: {
              type: 'onPlay',
            },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                  },
                },
              },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-120-on-ko-trash-play-from-trash',
            text: '[On K.O.] You may trash 1 card from your hand: Play this Character card from your trash.',
            trigger: {
              type: 'onKo',
              optional: true,
            },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['trash'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP14-035 Yosaku
    // [Your Turn] When this Character becomes rested, up to 1 of your opponent's rested Characters with a cost of 4 or less will not become active in your opponent's next Refresh Phase.
    {
      cardId: 'OP14-035',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op14-035-special',
        },
      ],
    },
  ],
};
