import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op12EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-12',
  cards: [
    // OP12-001 Silvers Rayleigh
    // Under the rules of this game, you cannot include cards with a cost of 5 or more in your deck.
    // [Activate: Main] [Once Per Turn] You may reveal 2 Events from your hand: Up to 1 of your Characters with 4000 base power or less gains +2000 power during this turn.
    {
      cardId: 'OP12-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'silvers-rayleigh-001-activate-main-plus-2000',
            text: '[Activate: Main] [Once Per Turn] Up to 1 of your Characters with 4000 base power or less gains +2000 power during this turn.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    basePowerMax: 4000,
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
    // OP12-002 Edward.Newgate
    {
      cardId: 'OP12-002',
      effects: [],
    },
    // OP12-003 Crocus
    // [On K.O.] You may reveal 2 Events from your hand: Play up to 1 red Character card with 3000 power or less from your hand.
    {
      cardId: 'OP12-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocus-on-ko-play-red-3000-or-less',
            text: '[On K.O.] Play up to 1 red Character card with 3000 power or less from your hand.',
            trigger: {
              type: 'onKo',
              optional: true,
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
                    powerMax: 3000,
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
    // OP12-004 Kouzuki Oden
    // [Activate: Main] [Once Per Turn] You may reveal 2 Events from your hand: This Character gains +2000 power during this turn.
    {
      cardId: 'OP12-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-oden-activate-main-plus-2000',
            text: '[Activate: Main] [Once Per Turn] This Character gains +2000 power during this turn.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
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
    // OP12-005 Shiki
    {
      cardId: 'OP12-005',
      effects: [],
    },
    // OP12-006 Shakuyaku
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Monkey.D.Luffy] or 1 red Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shakuyaku-on-play-search-luffy-or-red-event',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Monkey.D.Luffy] or 1 red Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                  name: ['Monkey.D.Luffy'],
                  cardCategory: ['Event'],
                  color: ['Red'],
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
    // OP12-007 Shanks (007)
    // [On Play] Up to 1 of your Characters with a type including "Roger Pirates" other than [Shanks] gains [Rush] during this turn.
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP12-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shanks-007-on-play-rush-roger-pirates',
            text: '[On Play] Up to 1 of your Characters with a type including "Roger Pirates" other than [Shanks] gains [Rush] during this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    trait: ['Roger Pirates'],
                    excludeName: ['Shanks'],
                  },
                  count: {
                    kind: 'upTo',
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
    // OP12-008 Shanks (008)
    // [Blocker]
    // [On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 of your opponent's Leader or Character cards 2000 power during this turn.
    {
      cardId: 'OP12-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shanks-008-on-opponent-attack-minus-2000',
            text: "[On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 of your opponent's Leader or Character cards 2000 power during this turn.",
            trigger: {
              type: 'onAttacked',
              oncePerTurn: true,
              optional: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
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
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
            ],
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
          },
        },
      ],
    },
    // OP12-009 Jinbe
    // [On Play] You may reveal 2 Events from your hand: This Character gains [Rush] during this turn. Then, this Character gains +1000 power until the end of your opponent's next End Phase.
    {
      cardId: 'OP12-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-on-play-rush',
            text: '[On Play] This Character gains [Rush] during this turn.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
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
            id: 'jinbe-on-play-plus-1000-until-opponent-end-phase',
            text: "Then, this Character gains +1000 power until the end of your opponent's next End Phase.",
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 1000,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-010 Douglas Bullet
    {
      cardId: 'OP12-010',
      effects: [],
    },
    // OP12-011 Duval
    {
      cardId: 'OP12-011',
      effects: [],
    },
    // OP12-012 Buggy (012)
    // [On Play] Up to 1 of your Characters with a type including "Roger Pirates" other than [Buggy] gains [Blocker] until the end of your opponent's next End Phase.
    {
      cardId: 'OP12-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buggy-012-on-play-blocker-roger-pirates',
            text: '[On Play] Up to 1 of your Characters with a type including "Roger Pirates" other than [Buggy] gains [Blocker] until the end of your opponent\'s next End Phase.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    trait: ['Roger Pirates'],
                    excludeName: ['Buggy'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                keywords: ['mustBeAttackTarget'],
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-013 Hatchan
    // [Activate: Main] You may rest this Character and reveal 2 Events from your hand: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.
    {
      cardId: 'OP12-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hatchan-activate-main-attach-rested-don',
            text: '[Activate: Main] You may rest this Character: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: {
              type: 'activateMain',
              optional: true,
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
                amount: 2,
                rested: true,
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
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
    // OP12-014 Boa Hancock
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Monkey.D.Luffy] or red Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Activate: Main] You may trash this Character: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.
    {
      cardId: 'OP12-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-on-play-search-luffy-or-red-event',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Monkey.D.Luffy] or red Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                  name: ['Monkey.D.Luffy'],
                  cardCategory: ['Event'],
                  color: ['Red'],
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
            id: 'boa-hancock-activate-main-trash-self-attach-don',
            text: '[Activate: Main] You may trash this Character: Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: {
              type: 'activateMain',
              optional: true,
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
                amount: 2,
                rested: true,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP12-015 Monkey.D.Luffy
    // If you have a total of 2 or more given DON!! cards, this Character gains +2000 power.
    // [On Play] You may reveal 2 Events from your hand: Play up to 1 red Character card with 3000 power or less from your hand. Then, give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP12-015',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'monkey-d-luffy-015-don-2-plus-2000',
            text: 'If you have a total of 2 or more given DON!! cards, this Character gains +2000 power.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              power: 2000,
            },
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-015-on-play-red-3000-or-less',
            text: '[On Play] Play up to 1 red Character card with 3000 power or less from your hand.',
            trigger: {
              type: 'onPlay',
              optional: true,
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
                    powerMax: 3000,
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
            id: 'monkey-d-luffy-015-on-play-attach-rested-don',
            text: 'Then, give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: {
              type: 'onPlay',
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
    // OP12-016 To Never Doubt--That Is Power!
    // [Main] You may give 2 active DON!! cards to 1 of your [Silvers Rayleigh]: Your opponent cannot activate [Blocker] when the card given these DON!! cards attacks during this turn.
    // [Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle.
    {
      cardId: 'OP12-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'to-never-doubt-activate-main-ko-cost-4-or-less',
            text: '[Activate: Main] [Once Per Turn] If you have 1 or less Life, return up to 1 DON!! to deck: K.O. up to 1 opponent Character with cost <= 4.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
            },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 1,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'donDeck',
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
                    costMax: 4,
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
            id: 'to-never-doubt-counter-plus-2000',
            text: '[Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle.',
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
            ],
          },
        },
      ],
    },
    // OP12-017 Color of Observation Haki
    // [Main] You may give 1 active DON!! card to 1 of your [Silvers Rayleigh]: Look at 4 cards from the top of your deck; reveal up to 1 red Event or up to 1 Character card with a cost of 3 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'color-of-observation-haki-main-cannot-attack',
            text: '[Main] Up to 1 opponent Character cannot attack during this turn.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'grantKeywords',
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
            id: 'color-of-observation-haki-trigger-cannot-attack',
            text: '[Trigger] Up to 1 opponent Character cannot attack during this turn.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'grantKeywords',
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
                keywords: ['cannotAttack'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-018 Color of the Supreme King Haki
    // [Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle. Then, you may rest 1 of your DON!! cards. If you do, give your opponent's Leader and all of their Characters 1000 power during this turn.
    {
      cardId: 'OP12-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'color-of-supreme-king-haki-counter-plus-2000',
            text: '[Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle.',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'color-of-supreme-king-haki-counter-rest-don-minus-1000',
            text: "Then, you may rest 1 of your DON!! cards. If you do, give your opponent's Leader and all of their Characters 1000 power during this turn.",
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                },
                amount: -1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP12-019 Color of Arms Haki
    // [Main] You may give 1 active DON!! card to 1 of your [Silvers Rayleigh]: Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    // [Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle.
    {
      cardId: 'OP12-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'color-of-arms-haki-main-plus-1000',
            text: '[Main] Give 1 active DON!! card to 1 of your [Silvers Rayleigh]: Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: {
              type: 'activateMain',
              optional: true,
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
                amount: 1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    name: ['Silvers Rayleigh'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1,
                rested: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'color-of-arms-haki-counter-plus-2000',
            text: '[Counter] Up to 1 of your Characters or [Silvers Rayleigh] gains +2000 power during this battle.',
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
            ],
          },
        },
      ],
    },
    // OP12-020 Roronoa Zoro (020)
    // [DON!! x3] [Activate: Main] [Once Per Turn] If this Leader battles your opponent's Character during this turn, set this Leader as active. Then, this Leader cannot attack your opponent's Characters with a base cost of 7 or less during this turn.
    {
      cardId: 'OP12-020',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op12-020-special',
        },
      ],
    },
    // OP12-021 Ipponmatsu
    // If your Leader has the (Slash) attribute and you have 6 or more rested DON!! cards, this Character cannot be rested by your opponent's effects.[Blocker]
    {
      cardId: 'OP12-021',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'ipponmatsu-cannot-be-rested',
            text: "If your Leader has the (Slash) attribute and you have 6 or more rested DON!! cards, this Character cannot be rested by your opponent's effects.",
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              keywords: ['cannotBeRemovedByOpponentEffects'],
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Slash',
              },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: {
                    rested: true,
                  },
                },
                value: 6,
              },
            ],
          },
        },
      ],
    },
    // OP12-022 Inuarashi
    // [Activate: Main] You may rest this Character: Up to 1 of your opponent's rested Characters with a cost of 5 or less will not become active in your opponent's next Refresh Phase.
    {
      cardId: 'OP12-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inuarashi-activate-main-skip-refresh',
            text: "[Activate: Main] You may rest this Character: Up to 1 of your opponent's rested Characters with a cost of 5 or less will not become active in your opponent's next Refresh Phase.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    rested: true,
                    costMax: 5,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1,
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
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
    // OP12-023 Kawamatsu
    {
      cardId: 'OP12-023',
      effects: [],
    },
    // OP12-024 Gyukimaru
    // If this Character is active, this Character cannot be K.O.'d by your opponent's effects.
    // [When Attacking] If you have a total of 3 or more given DON!! cards, rest up to 1 of your opponent's Characters with a base cost of 6 or less.
    {
      cardId: 'OP12-024',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'gyukimaru-active-cannot-be-koed',
            text: "If this Character is active, this Character cannot be K.O.'d by your opponent's effects.",
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              keywords: ['cannotBeKoedByEffects'],
            },
            conditions: [
              {
                type: 'sourceIsRested',
                value: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gyukimaru-when-attacking-rest-cost-6-or-less',
            text: "[When Attacking] If you have a total of 3 or more given DON!! cards, rest up to 1 of your opponent's Characters with a base cost of 6 or less.",
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    baseCostMax: 6,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 3,
              },
            ],
          },
        },
      ],
    },
    // OP12-025 Kin'emon
    {
      cardId: 'OP12-025',
      effects: [],
    },
    // OP12-026 Kuina
    // [Activate: Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a base cost of 4 or less. Then, give up to 3 rested DON!! cards to your [Roronoa Zoro] Leader.
    {
      cardId: 'OP12-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuina-activate-main-rest-opponent-char-and-attach-don',
            text: "[Activate: Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a base cost of 4 or less. Then, give up to 3 rested DON!! cards to your [Roronoa Zoro] Leader.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    baseCostMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    name: ['Roronoa Zoro'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 3,
                rested: true,
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
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
    // OP12-027 Koushirou
    // If your (Slash) attribute Character with a cost of 5 or less other than this Character would be K.O.'d by your opponent's effect, you may rest this Character instead.
    // [Blocker]
    {
      cardId: 'OP12-027',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'koushirou-rest-instead-of-ko',
            text: "If your (Slash) attribute Character with a cost of 5 or less other than this Character would be K.O.'d by your opponent's effect, you may rest this Character instead.",
            event: 'wouldKoCharacter',
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            optional: true,
            conditions: [
              {
                type: 'eventReasonIs',
                value: 'effect',
              },
              {
                type: 'eventPlayerIs',
                player: 'opponent',
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    attribute: ['Slash'],
                    costMax: 5,
                    excludeName: ['Koushirou'],
                  },
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-028 Kouzuki Hiyori
    // [Activate: Main] You may rest 1 of your DON!! cards and this Character: If your Leader is [Roronoa Zoro], look at 5 cards from the top of your deck; reveal up to 1 (Slash) attribute card or green Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-activate-main-search-slash-or-green-event',
            text: '[Activate: Main] You may rest 1 of your DON!! cards and this Character: If your Leader is [Roronoa Zoro], look at 5 cards from the top of your deck; reveal up to 1 (Slash) attribute card or green Event and add it to your hand.',
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  attribute: ['Slash'],
                  cardCategory: ['Event'],
                  color: ['Green'],
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
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Roronoa Zoro',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
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
    // OP12-029 Shimotsuki Kouzaburou
    // [On Play] Rest up to 1 of your opponent's Characters with a cost of 2 or less. Then, K.O. up to 1 of your opponent's rested Characters with a base cost of 1 or less.
    {
      cardId: 'OP12-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shimotsuki-kouzaburou-on-play-rest-and-ko',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 2 or less. Then, K.O. up to 1 of your opponent's rested Characters with a base cost of 1 or less.",
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
                    costMax: 2,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    rested: true,
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
    // OP12-030 Dracule Mihawk
    // [Blocker]
    // [On Play] Set up to 4 of your DON!! cards as active. Then, you cannot play Character cards with a base cost of 7 or more during this turn.
    {
      cardId: 'OP12-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dracule-mihawk-030-on-play-unrest-don',
            text: '[On Play] Set up to 4 of your DON!! cards as active.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: {
                    rested: true,
                  },
                  count: {
                    kind: 'upTo',
                    value: 4,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'dracule-mihawk-030-on-play-cannot-play-7-or-more',
            text: 'Then, you cannot play Character cards with a base cost of 7 or more during this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'preventOwnEffectLifeToHand',
                player: 'self',
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-031 Tashigi
    // [On Play] Rest up to 1 of your opponent's Characters with a base cost of 6 or less. Then, give up to 3 rested DON!! cards to your [Roronoa Zoro] Leader.
    {
      cardId: 'OP12-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tashigi-on-play-rest-and-attach-don',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a base cost of 6 or less. Then, give up to 3 rested DON!! cards to your [Roronoa Zoro] Leader.",
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
                    baseCostMax: 6,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    name: ['Roronoa Zoro'],
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 3,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP12-032 Nekomamushi
    {
      cardId: 'OP12-032',
      effects: [],
    },
    // OP12-033 Helmeppo
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Block] Rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP12-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'helmeppo-on-block-rest-cost-5-or-less',
            text: "[On Block] Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: {
              type: 'onBlock',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    costMax: 5,
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
    // OP12-034 Perona
    // [On Play] If your Leader has the (Slash) attribute, look at 5 cards from the top of your deck; reveal up to 1 (Slash) attribute card or green Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'perona-034-on-play-search-slash-or-green-event',
            text: '[On Play] If your Leader has the (Slash) attribute, look at 5 cards from the top of your deck; reveal up to 1 (Slash) attribute card or green Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                  attribute: ['Slash'],
                  cardCategory: ['Event'],
                  color: ['Green'],
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Slash',
              },
            ],
          },
        },
      ],
    },
    // OP12-035 Morgan
    {
      cardId: 'OP12-035',
      effects: [],
    },
    // OP12-036 Roronoa Zoro (036)
    // This card in your hand cannot be played by effects.
    // If your Leader has the (Slash) attribute, this Character cannot be K.O.'d in battle by (Slash) attribute cards and gains +1000 power.
    {
      cardId: 'OP12-036',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'roronoa-zoro-036-cannot-be-koed-by-slash',
            text: "If your Leader has the (Slash) attribute, this Character cannot be K.O.'d in battle by (Slash) attribute cards and gains +1000 power.",
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              power: 1000,
              keywords: ['cannotBeKoedBySlashInBattle'],
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Slash',
              },
            ],
          },
        },
      ],
    },
    // OP12-037 Demon Aura Nine Sword Style Asura Blades Drawn Dead Man's Game
    // [Main] You may rest 3 of your DON!! cards: Rest up to a total of 2 of your opponent's Characters or DON!! cards.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP12-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'demon-aura-main-rest-don-and-opponent-cards',
            text: "[Main] You may rest 3 of your DON!! cards: Rest up to a total of 2 of your opponent's Characters or DON!! cards.",
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters', 'cost'],
                  count: {
                    kind: 'upTo',
                    value: 2,
                  },
                },
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 3,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'demon-aura-counter-leader-plus-3000',
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
    // OP12-038 Two-Sword Style Rashomon
    // [Main] You may rest 2 of your DON!! cards: K.O. up to 2 of your opponent's rested Characters with a base cost of 4 or less.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP12-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'two-sword-rashomon-main-ko-rested-4-or-less',
            text: "[Main] You may rest 2 of your DON!! cards: K.O. up to 2 of your opponent's rested Characters with a base cost of 4 or less.",
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    rested: true,
                    baseCostMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 2,
                  },
                },
                reason: 'effect',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'two-sword-rashomon-counter-leader-plus-3000',
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
    // OP12-039 Luffy Is the Man Who Will Become the King of Pirates!!!
    // [Main] Set your [Roronoa Zoro] Leader as active.
    // [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP12-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'luffy-king-of-pirates-main-unrest-zoro',
            text: '[Main] Set your [Roronoa Zoro] Leader as active.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    name: ['Roronoa Zoro'],
                  },
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
            id: 'luffy-king-of-pirates-trigger-plus-1000',
            text: '[Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: {
              type: 'trigger',
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
                amount: 1000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-040 Kuzan (040)
    // When a card is trashed from your hand by your "Navy" type card's effect, draw cards equal to the number of cards trashed.
    {
      cardId: 'OP12-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-040-when-attacking-opponent-trash-2',
            text: '[When Attacking] [Once Per Turn] If you have 5+ DON!! active, opponent trashes 2 from hand.',
            trigger: {
              type: 'whenAttacking',
              oncePerTurn: true,
            },
            conditions: [
              {
                type: 'playerHasActiveDonAtLeast',
                player: 'self',
                value: 5,
              },
            ],
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
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
    // OP12-041 Sanji (041)
    // [Activate: Main] [Once Per Turn] DON!! 1: Activate up to 1 "Straw Hat Crew" type Event with a base cost of 3 or less from your hand.
    // [When Attacking] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP12-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-041-on-ko-draw-up-to-3-then-trash-2',
            text: '[On K.O.] If you have 3 or less cards in hand, draw up to 3 cards. Then trash 2 from hand.',
            trigger: {
              type: 'onKo',
            },
            conditions: [
              {
                type: 'playerHasHandAtMost',
                player: 'self',
                value: 3,
              },
            ],
            actions: [
              {
                type: 'drawUntilHandSize',
                player: 'self',
                size: 3,
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
            id: 'sanji-041-when-attacking-add-rested-don',
            text: "[When Attacking] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and rest it.",
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
          },
        },
      ],
    },
    // OP12-042 Alvida
    // If you have 2 or more Characters with a base cost of 5 or more, this Character gains +1 cost.
    // [On Play] Place up to 1 of your opponent's Characters with a base cost of 1 or less at the bottom of the owner's deck.
    {
      cardId: 'OP12-042',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'alvida-plus-1-cost-if-2-chars-5-cost',
            text: 'If you have 2 or more Characters with a base cost of 5 or more, this Character gains +1 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 1,
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    baseCostMin: 5,
                  },
                },
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'alvida-on-play-bottom-deck-cost-1-or-less',
            text: "[On Play] Place up to 1 of your opponent's Characters with a base cost of 1 or less at the bottom of the owner's deck.",
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
                    baseCostMax: 1,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP12-043 Kuzan (043)
    // If you have 5 or more cards in your hand, this Character gains +1 cost.
    // [On Play] You may trash 1 card from your hand: Up to 1 of your opponent's Characters cannot attack until the end of your opponent's next End Phase.
    {
      cardId: 'OP12-043',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kuzan-043-plus-1-cost-if-5-cards-in-hand',
            text: 'If you have 5 or more cards in your hand, this Character gains +1 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 1,
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                },
                value: 5,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-043-on-play-restrict-attack',
            text: "[On Play] You may trash 1 card from your hand: Up to 1 of your opponent's Characters cannot attack until the end of your opponent's next End Phase.",
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                turns: 1,
              },
            ],
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
          },
        },
      ],
    },
    // OP12-044 Sakazuki
    // [On Play] If your Leader has the "Navy" type, draw 2 cards.
    // [Activate: Main] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP12-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-on-play-draw-2-if-navy-leader',
            text: '[On Play] If your Leader has the "Navy" type, draw 2 cards.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Navy',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-activate-main-trash-1-attach-rested-don',
            text: '[Activate: Main] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
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
          },
        },
      ],
    },
    // OP12-045 Jango
    {
      cardId: 'OP12-045',
      effects: [],
    },
    // OP12-046 Zephyr(Navy)
    // [On Play] Trash 2 cards from your hand.
    // [Activate: Main] You may trash this Character: Return up to 1 Character with a cost of 5 or less to the owner's hand.
    {
      cardId: 'OP12-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zephyr-on-play-trash-2-from-hand',
            text: '[On Play] Trash 2 cards from your hand.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
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
            id: 'zephyr-activate-main-trash-self-return-character',
            text: "[Activate: Main] You may trash this Character: Return up to 1 Character with a cost of 5 or less to the owner's hand.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
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
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP12-047 Sengoku
    // [On Play] You may trash 1 card from your hand: Look at 5 cards from the top of your deck; reveal up to 2 "Navy" type cards other than [Sengoku] and add them to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sengoku-on-play-search-navy',
            text: '[On Play] You may trash 1 card from your hand: Look at 5 cards from the top of your deck; reveal up to 2 "Navy" type cards other than [Sengoku] and add them to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Navy'],
                  excludeName: ['Sengoku'],
                },
                count: {
                  kind: 'upTo',
                  value: 2,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
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
          },
        },
      ],
    },
    // OP12-048 Donquixote Rosinante (048)
    // [Opponent's Turn] If your blue "Navy" type Character would be removed from the field by your opponent's effect, you may rest this Character and trash 1 card from your hand instead.
    {
      cardId: 'OP12-048',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'donquixote-rosinante-048-protect-navy',
            text: '[Opponent\'s Turn] If your blue "Navy" type Character would be removed from the field by your opponent\'s effect, you may rest this Character and trash 1 card from your hand instead.',
            event: 'wouldMoveCard',
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
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
            optional: true,
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'eventReasonIs',
                value: 'effect',
              },
              {
                type: 'eventPlayerIs',
                player: 'opponent',
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Blue'],
                    trait: ['Navy'],
                  },
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-049 Buggy (049)
    {
      cardId: 'OP12-049',
      effects: [],
    },
    // OP12-050 Jaguar.D.Saul
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP12-050',
      effects: [],
    },
    // OP12-051 Hina
    // [Activate: Main] You may rest this Character and trash 1 card from your hand: Up to 1 of your opponent's Characters with a base cost of 4 or less cannot activate [Blocker] during this turn.
    {
      cardId: 'OP12-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hina-activate-main-cannot-block',
            text: "[Activate: Main] You may rest this Character and trash 1 card from your hand: Up to 1 of your opponent's Characters with a base cost of 4 or less cannot activate [Blocker] during this turn.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    baseCostMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                keywords: ['cannotBlock'],
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
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
    // OP12-052 Fullbody
    {
      cardId: 'OP12-052',
      effects: [],
    },
    // OP12-053 Borsalino
    // [Once Per Turn] If this Character would be removed from the field by your opponent's effect, you may trash 1 card from your hand instead.
    // [Opponent's Turn] If your Leader has the "Navy" type, this Character gains [Blocker] and +1000 power.
    {
      cardId: 'OP12-053',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'borsalino-trash-instead-of-remove',
            text: "[Once Per Turn] If this Character would be removed from the field by your opponent's effect, you may trash 1 card from your hand instead.",
            event: 'wouldMoveCard',
            replacement: [
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
            optional: true,
            conditions: [
              {
                type: 'eventReasonIs',
                value: 'effect',
              },
              {
                type: 'eventPlayerIs',
                player: 'opponent',
              },
            ],
            oncePerTurn: true,
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'borsalino-opponent-turn-blocker-and-plus-1000',
            text: '[Opponent\'s Turn] If your Leader has the "Navy" type, this Character gains [Blocker] and +1000 power.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              power: 1000,
              keywords: ['mustBeAttackTarget'],
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Navy',
              },
            ],
          },
        },
      ],
    },
    // OP12-054 Marshall.D.Teach
    // [On Play] If your Leader has the "The Seven Warlords of the Sea" type, return up to 1 Character with a cost of 1 or less other than this Character to the owner's hand.
    {
      cardId: 'OP12-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marshall-d-teach-on-play-return-cost-1-or-less',
            text: '[On Play] If your Leader has the "The Seven Warlords of the Sea" type, return up to 1 Character with a cost of 1 or less other than this Character to the owner\'s hand.',
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
                    costMax: 1,
                    excludeName: ['Marshall.D.Teach'],
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'The Seven Warlords of the Sea',
              },
            ],
          },
        },
      ],
    },
    // OP12-055 Mohji & Cabaji
    {
      cardId: 'OP12-055',
      effects: [],
    },
    // OP12-056 Monkey.D.Garp
    // [On Play] You may trash 1 card from your hand: Play up to 1 blue "Navy" type Character card with 8000 power or less other than [Monkey.D.Garp] from your hand.
    {
      cardId: 'OP12-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-on-play-play-navy',
            text: '[On Play] You may trash 1 card from your hand: Play up to 1 blue "Navy" type Character card with 8000 power or less other than [Monkey.D.Garp] from your hand.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Blue'],
                    trait: ['Navy'],
                    powerMax: 8000,
                    excludeName: ['Monkey.D.Garp'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destination: 'characters',
              },
            ],
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
          },
        },
      ],
    },
    // OP12-057 Ice Block Pheasant Peck
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, trash 1 card from your hand.
    // [Trigger] You may trash 1 card from your hand: Draw 1 card.
    {
      cardId: 'OP12-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ice-block-pheasant-peck-counter-plus-4000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, trash 1 card from your hand.',
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
            id: 'ice-block-pheasant-peck-trigger-draw-1',
            text: '[Trigger] You may trash 1 card from your hand: Draw 1 card.',
            trigger: {
              type: 'trigger',
              optional: true,
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
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
          },
        },
      ],
    },
    // OP12-058 I Will Make Whitebeard the King of the Pirates
    // [Main] If your Leader's type includes "Whitebeard Pirates", reveal 1 card from the top of your deck. If that card is a Character card with a type including "Whitebeard Pirates" and a cost of 9 or less, you may play that card. If you do, that Character gains [Rush] during this turn.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP12-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'whitebeard-king-main-reveal-and-play',
            text: '[Main] If your Leader\'s type includes "Whitebeard Pirates", reveal 1 card from the top of your deck. If that card is a Character card with a type including "Whitebeard Pirates" and a cost of 9 or less, you may play that card. If you do, that Character gains [Rush] during this turn.',
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Whitebeard Pirates'],
                  costMax: 9,
                },
                destination: 'characters',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'whitebeard-king-trigger-draw-1',
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
    // OP12-059 Concasser
    // [Main] If your Leader is [Sanji], draw 1 card.
    // [Counter] If you have 4 or more Events in your trash, up to 1 of your Leader gains +4000 power during this battle.
    {
      cardId: 'OP12-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'concasser-main-draw-if-sanji',
            text: '[Main] If your Leader is [Sanji], draw 1 card.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'concasser-counter-leader-plus-4000',
            text: '[Counter] If you have 4 or more Events in your trash, up to 1 of your Leader gains +4000 power during this battle.',
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
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Event'],
                  },
                },
                value: 4,
              },
            ],
          },
        },
      ],
    },
    // OP12-060 Boeuf Burst
    // [Main] If your Leader is multicolored, choose one:
    // • Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand.
    // • If you have 6 or less cards in your hand, draw 2 cards.
    {
      cardId: 'OP12-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boeuf-burst-main-choose',
            text: "[Main] If your Leader is multicolored, choose one: Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand. OR If you have 6 or less cards in your hand, draw 2 cards.",
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose one:',
                choices: [
                  {
                    id: 'return-character',
                    label:
                      "Return up to 1 of your opponent's Characters with a cost of 4 or less to the owner's hand.",
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
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
                  {
                    id: 'draw-2',
                    label:
                      'If you have 6 or less cards in your hand, draw 2 cards.',
                    actions: [
                      {
                        type: 'draw',
                        player: 'self',
                        amount: 2,
                      },
                    ],
                  },
                ],
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
          },
        },
      ],
    },
    // OP12-061 Donquixote Rosinante (061) (Alternate Art)
    // [Once Per Turn] If your [Trafalgar Law] would be K.O.'d, you may add 1 card from the top of your Life cards to your hand instead.
    // [Activate: Main] [Once Per Turn] DON!! 1: The next time you play [Trafalgar Law] with a cost of 4 or more from your hand during this turn, the cost will be reduced by 2.
    {
      cardId: 'OP12-061',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'donquixote-rosinante-061-protect-law',
            text: "[Once Per Turn] If your [Trafalgar Law] would be K.O.'d, you may add 1 card from the top of your Life cards to your hand instead.",
            event: 'wouldKoCharacter',
            replacement: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            optional: true,
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    name: ['Trafalgar Law'],
                  },
                },
              },
            ],
            oncePerTurn: true,
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-rosinante-061-activate-main-cost-reduction',
            text: '[Activate: Main] [Once Per Turn] DON!! 1: The next time you play [Trafalgar Law] with a cost of 4 or more from your hand during this turn, the cost will be reduced by 2.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
            },
            actions: [
              {
                type: 'registerNextPlayCostModifier',
                player: 'self',
                filter: {
                  name: ['Trafalgar Law'],
                  cardCategory: ['Character'],
                  costMin: 4,
                },
                sourceZone: 'hand',
                amount: -2,
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP12-062 Vinsmoke Sora
    // [On Play] If your Leader is [Sanji] and the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and rest it. Then, draw 1 card.
    {
      cardId: 'OP12-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-sora-on-play-add-don-and-draw',
            text: "[On Play] If your Leader is [Sanji] and the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and rest it. Then, draw 1 card.",
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
          },
        },
      ],
    },
    // OP12-063 Vinsmoke Reiju
    // If you have 4 or more Events in your trash, this Character gains +2000 power and +5 cost.
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP12-063',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'vinsmoke-reiju-power-and-cost-per-events',
            text: 'If you have 4 or more Events in your trash, this Character gains +2000 power and +5 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              power: 2000,
              cost: 5,
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Event'],
                  },
                },
                value: 4,
              },
            ],
          },
        },
      ],
    },
    // OP12-064 Vergo
    {
      cardId: 'OP12-064',
      effects: [],
    },
    // OP12-065 Emporio.Ivankov (065)
    // If you have 4 or more Events in your trash, this Character gains [Blocker].
    // [On K.O.] Add up to 1 Event from your trash to your hand.
    {
      cardId: 'OP12-065',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'emporio-ivankov-065-blocker-if-events',
            text: 'If you have 4 or more Events in your trash, this Character gains [Blocker].',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              keywords: ['mustBeAttackTarget'],
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Event'],
                  },
                },
                value: 4,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'emporio-ivankov-065-on-ko-add-event-from-trash',
            text: '[On K.O.] Add up to 1 Event from your trash to your hand.',
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
                  cardCategory: ['Event'],
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
    // OP12-066 Carne
    // If you have 4 or more Events in your trash, this Character gains [Blocker].
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP12-066',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'carne-blocker-if-events',
            text: 'If you have 4 or more Events in your trash, this Character gains [Blocker].',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              keywords: ['mustBeAttackTarget'],
            },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Event'],
                  },
                },
                value: 4,
              },
            ],
          },
        },
      ],
    },
    // OP12-067 Carmen
    {
      cardId: 'OP12-067',
      effects: [],
    },
    // OP12-068 Gin
    {
      cardId: 'OP12-068',
      effects: [],
    },
    // OP12-069 Crocodile
    // [On Your Opponent's Attack] [Once Per Turn] DON!! 1: If your Leader's type includes "Baroque Works", up to 1 of your Leader or Character cards gains +2000 power during this battle.
    {
      cardId: 'OP12-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-069-on-opponent-attack-plus-2000',
            text: '[On Your Opponent\'s Attack] [Once Per Turn] DON!! 1: If your Leader\'s type includes "Baroque Works", up to 1 of your Leader or Character cards gains +2000 power during this battle.',
            trigger: {
              type: 'onAttacked',
              oncePerTurn: true,
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
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP12-070 Sanji (070)
    // This Character gains +1000 power for every 5 Events in your trash.
    // If this Character would be removed from the field by your opponent's effect, you may return 1 DON!! card from your field to your DON!! deck instead.
    {
      cardId: 'OP12-070',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sanji-070-power-per-5-events',
            text: 'This Character gains +1000 power for every 5 Events in your trash.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              powerPerCount: {
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Event'],
                  },
                },
                amount: 1000,
                divisor: 5,
              },
            },
          },
        },
        {
          kind: 'replacement',
          effect: {
            id: 'sanji-070-don-instead-of-remove',
            text: "If this Character would be removed from the field by your opponent's effect, you may return 1 DON!! card from your field to your DON!! deck instead.",
            event: 'wouldMoveCard',
            replacement: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
            optional: true,
            conditions: [
              {
                type: 'eventReasonIs',
                value: 'effect',
              },
              {
                type: 'eventPlayerIs',
                player: 'opponent',
              },
            ],
          },
        },
      ],
    },
    // OP12-071 Charlotte Pudding
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 [Sanji] or Event card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-on-play-search-sanji-or-event',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 [Sanji] or Event card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  name: ['Sanji'],
                  cardCategory: ['Event'],
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
    // OP12-072 Zeff
    // When a DON!! card on your field is returned to your DON!! deck, if your Leader is [Sanji], this Character gains [Rush] during this turn.
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP12-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zeff-on-don-returned-rush',
            text: 'When a DON!! card on your field is returned to your DON!! deck, if your Leader is [Sanji], this Character gains [Rush] during this turn.',
            trigger: {
              type: 'onDonReturned',
            },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
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
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
            ],
          },
        },
      ],
    },
    // OP12-073 Trafalgar Law (073)
    // [On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and set it as active. Then, all of your [Donquixote Rosinante] and "Heart Pirates" type Characters gain +1000 power until the end of your opponent's next End Phase.
    {
      cardId: 'OP12-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-073-on-play-add-active-don',
            text: "[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and set it as active.",
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
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-073-on-play-plus-1000-heart-pirates',
            text: 'Then, all of your [Donquixote Rosinante] and "Heart Pirates" type Characters gain +1000 power until the end of your opponent\'s next End Phase.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    name: ['Donquixote Rosinante'],
                    trait: ['Heart Pirates'],
                  },
                },
                amount: 1000,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
          },
        },
      ],
    },
    // OP12-074 Patty
    // [On Play] You may trash 1 Event from your hand: If your Leader is [Sanji], add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP12-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'patty-on-play-trash-event-add-active-don',
            text: '[On Play] You may trash 1 Event from your hand: If your Leader is [Sanji], add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
            ],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Event'],
                  },
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
    // OP12-075 Ms. All Sunday
    // [On Play] K.O. up to 1 of your opponent's Characters with a cost of 3 or less. Then, your opponent may add 1 DON!! card from their DON!! deck and set it as active.
    // [Trigger] DON!! 1: Play this card.
    {
      cardId: 'OP12-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ms-all-sunday-on-play-ko-and-opponent-add-don',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with a cost of 3 or less. Then, your opponent may add 1 DON!! card from their DON!! deck and set it as active.",
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    costMax: 3,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
              {
                type: 'addDon',
                player: 'opponent',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ms-all-sunday-trigger-play',
            text: '[Trigger] DON!! 1: Play this card.',
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
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP12-076 Monet
    {
      cardId: 'OP12-076',
      effects: [],
    },
    // OP12-077 The "Extinguishes All Sound Created by Your Influence" Technique
    // [Main] Select up to 1 of your [Trafalgar Law] cards and that card gains +2000 power during this turn. Then, if the selected card attacks during this turn, your opponent cannot activate [Blocker].
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP12-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'extinguishes-all-sound-main-power-and-cannot-block',
            text: '[Main] Select up to 1 of your [Trafalgar Law] cards and that card gains +2000 power during this turn. Then, if the selected card attacks during this turn, your opponent cannot activate [Blocker].',
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
                    name: ['Trafalgar Law'],
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
        {
          kind: 'standard',
          effect: {
            id: 'extinguishes-all-sound-trigger-draw-1',
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
    // OP12-078 Brochette Blow
    // [Main] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card. Then, give up to 1 of your opponent's Characters 3000 power during this turn.
    {
      cardId: 'OP12-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brochette-blow-main-draw-and-minus-3000',
            text: "[Main] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card. Then, give up to 1 of your opponent's Characters 3000 power during this turn.",
            trigger: {
              type: 'activateMain',
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
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: -3000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
          },
        },
      ],
    },
    // OP12-079 Luffy Is the Man Who Will Be King of the Pirates!!!
    // [Main] If your Leader is [Sanji], look at 3 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'luffy-will-be-king-main-search',
            text: '[Main] If your Leader is [Sanji], look at 3 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {},
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
            ],
          },
        },
      ],
    },
    // OP12-080 Baratie
    // [Activate: Main] You may place this Stage at the bottom of the owner's deck: If your Leader is [Sanji], look at 3 cards from the top of your deck; reveal up to 1 Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Play this card.
    {
      cardId: 'OP12-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baratie-activate-main-place-bottom-search-event',
            text: "[Activate: Main] You may place this Stage at the bottom of the owner's deck: If your Leader is [Sanji], look at 3 cards from the top of your deck; reveal up to 1 Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.",
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  cardCategory: ['Event'],
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
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'baratie-trigger-play',
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
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // OP12-081 Koala (081)
    // When this Leader attacks your opponent's Leader, if you have 2 or more Characters with a cost of 8 or more, draw 1 card.
    // [Once Per Turn] This effect can be activated when your opponent plays a Character with a base cost of 8 or more, or when your opponent plays a Character using a Character's effect. Your opponent adds 1 card from the top of their Life cards to their hand.
    {
      cardId: 'OP12-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-081-when-attacking-draw-1',
            text: "When this Leader attacks your opponent's Leader, if you have 2 or more Characters with a cost of 8 or more, draw 1 card.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'eventTargetMatchesFilter',
                filter: {
                  cardCategory: ['Leader'],
                  owner: 'opponent',
                },
              },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { costMin: 8 },
                },
                value: 2,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'koala-081-opponent-plays-character-life-to-hand',
            text: "[Once Per Turn] This effect can be activated when your opponent plays a Character with a base cost of 8 or more, or when your opponent plays a Character using a Character's effect. Your opponent adds 1 card from the top of their Life cards to their hand.",
            trigger: { type: 'onCharacterPlayed', oncePerTurn: true },
            conditions: [{ type: 'eventPlayerIs', player: 'opponent' }],
            actions: [
              {
                type: 'ifAnyConditionGroupMatches',
                conditionGroups: [
                  [
                    {
                      type: 'eventTargetMatchesFilter',
                      filter: {
                        cardCategory: ['Character'],
                        baseCostMin: 8,
                      },
                    },
                  ],
                  [
                    {
                      type: 'eventTargetMatchesFilter',
                      filter: {
                        cardCategory: ['Character'],
                      },
                    },
                    {
                      type: 'eventPlayedByEffect',
                      value: true,
                    },
                  ],
                ],
                actions: [
                  {
                    type: 'moveFirstCard',
                    selector: {
                      player: 'opponent',
                      zones: ['life'],
                      count: { kind: 'exact', value: 1 },
                    },
                    destinationPlayer: 'opponent',
                    destinationZone: 'hand',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP12-082 Issho
    {
      cardId: 'OP12-082',
      effects: [],
    },
    // OP12-083 Inazuma
    {
      cardId: 'OP12-083',
      effects: [],
    },
    // OP12-084 Emporio.Ivankov (084)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If your Leader has the "Revolutionary Army" type, trash 3 cards from the top of your deck.
    {
      cardId: 'OP12-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emporio-ivankov-084-on-play-trash-3-from-deck',
            text: '[On Play] If your Leader has the "Revolutionary Army" type, trash 3 cards from the top of your deck.',
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
      ],
    },
    // OP12-085 Karasu
    // If your Leader has the "Revolutionary Army" type, this Character gains +3 cost.
    // [When Attacking] If your Leader has the "Revolutionary Army" type and your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand.
    {
      cardId: 'OP12-085',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'karasu-plus-3-cost-if-rev-army',
            text: 'If your Leader has the "Revolutionary Army" type, this Character gains +3 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 3,
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'karasu-when-attacking-opponent-trash-1',
            text: '[When Attacking] If your Leader has the "Revolutionary Army" type and your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand.',
            trigger: {
              type: 'whenAttacking',
            },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  chooser: 'opponent',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                },
                value: 5,
              },
            ],
          },
        },
      ],
    },
    // OP12-086 Koala (086)
    // [On Play] If your Leader has the "Revolutionary Army" type, look at 3 cards from the top of your deck; reveal up to 1 "Revolutionary Army" type card other than [Koala] or up to 1 [Nico Robin] and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP12-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-086-on-play-search-rev-army',
            text: '[On Play] If your Leader has the "Revolutionary Army" type, look at 3 cards from the top of your deck; reveal up to 1 "Revolutionary Army" type card other than [Koala] or up to 1 [Nico Robin] and add it to your hand. Then, trash the rest.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Revolutionary Army'],
                  name: ['Nico Robin'],
                  excludeName: ['Koala'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
      ],
    },
    // OP12-087 Nico Robin
    // If your Leader is [Koala] or [Monkey.D.Luffy], this Character gains [Blocker] and +3 cost.
    // [On Play] You may trash 1 card from your hand: If your opponent has 5 or more cards in their hand, your opponent trashes 2 cards from their hand.
    {
      cardId: 'OP12-087',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nico-robin-087-blocker-and-cost-if-koala-or-luffy',
            text: 'If your Leader is [Koala] or [Monkey.D.Luffy], this Character gains [Blocker] and +3 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 3,
              keywords: ['mustBeAttackTarget'],
            },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Koala',
              },
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Monkey.D.Luffy',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-087-on-play-opponent-trash-2',
            text: '[On Play] You may trash 1 card from your hand: If your opponent has 5 or more cards in their hand, your opponent trashes 2 cards from their hand.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  chooser: 'opponent',
                  count: {
                    kind: 'exact',
                    value: 2,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                },
                value: 5,
              },
            ],
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
          },
        },
      ],
    },
    // OP12-088 Bastille
    {
      cardId: 'OP12-088',
      effects: [],
    },
    // OP12-089 Hack
    // If your Leader has the "Revolutionary Army" type, this Character gains [Blocker] and +4 cost.
    // [On K.O.] If your Leader has the "Revolutionary Army" type, K.O. up to 1 of your opponent's Characters with a base cost of 4 or less.
    {
      cardId: 'OP12-089',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'hack-blocker-and-cost-if-rev-army',
            text: 'If your Leader has the "Revolutionary Army" type, this Character gains [Blocker] and +4 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 4,
              keywords: ['mustBeAttackTarget'],
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hack-on-ko-ko-cost-4-or-less',
            text: '[On K.O.] If your Leader has the "Revolutionary Army" type, K.O. up to 1 of your opponent\'s Characters with a base cost of 4 or less.',
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
                    baseCostMax: 4,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
      ],
    },
    // OP12-090 Belo Betty
    // [When Attacking] You may trash 2 cards from the top of your deck: Give up to 1 of your opponent's Characters 2 cost during this turn.
    {
      cardId: 'OP12-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'belo-betty-when-attacking-plus-cost',
            text: "[When Attacking] You may trash 2 cards from the top of your deck: Give up to 1 of your opponent's Characters 2 cost during this turn.",
            trigger: {
              type: 'whenAttacking',
              optional: true,
            },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
      ],
    },
    // OP12-091 Poker
    // [Activate: Main] [Once Per Turn] You may place 3 cards from your trash at the bottom of your deck in any order: Up to 2 of your "SMILE" type Characters gain +2000 power during this turn.
    {
      cardId: 'OP12-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'poker-activate-main-place-trash-at-bottom',
            text: '[Activate: Main] [Once Per Turn] You may place 3 cards from your trash at the bottom of your deck in any order: Up to 2 of your "SMILE" type Characters gain +2000 power during this turn.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    trait: ['SMILE'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 2,
                  },
                },
                amount: 2000,
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            costs: [
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
    // OP12-092 Mizerka
    {
      cardId: 'OP12-092',
      effects: [],
    },
    // OP12-093 Morley
    // If your Leader has the "Revolutionary Army" type, this Character gains +4 cost.
    {
      cardId: 'OP12-093',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'morley-plus-4-cost-if-rev-army',
            text: 'If your Leader has the "Revolutionary Army" type, this Character gains +4 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 4,
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
      ],
    },
    // OP12-094 Monkey.D.Dragon
    // [On Play] You may place 3 "Revolutionary Army" type cards from your trash at the bottom of your deck in any order: If your Leader has the "Revolutionary Army" type, play up to 1 Character card with a cost of 6 or less from your trash.
    {
      cardId: 'OP12-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-dragon-on-play-place-trash-play-from-trash',
            text: '[On Play] You may place 3 "Revolutionary Army" type cards from your trash at the bottom of your deck in any order: If your Leader has the "Revolutionary Army" type, play up to 1 Character card with a cost of 6 or less from your trash.',
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    trait: ['Revolutionary Army'],
                  },
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
    // OP12-095 Lindbergh
    // If your Leader has the "Revolutionary Army" type, this Character gains +4 cost.
    // [On Play] Draw 1 card and trash 1 card from your hand.
    {
      cardId: 'OP12-095',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'lindbergh-plus-4-cost-if-rev-army',
            text: 'If your Leader has the "Revolutionary Army" type, this Character gains +4 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 4,
            },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'lindbergh-on-play-draw-and-trash',
            text: '[On Play] Draw 1 card and trash 1 card from your hand.',
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
    // OP12-096 Ursa Shock
    // [Main] K.O. up to 1 of your opponent's Characters with a cost of 4 or less. If you have a Character with a cost of 8 or more, you may select your opponent's Character with a cost of 6 or less instead.
    // [Trigger] Draw 1 card and trash 1 card from the top of your deck.
    {
      cardId: 'OP12-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ursa-shock-activate-main-set-up-to-2-don-active',
            text: '[Activate: Main] [Once Per Turn] Trash 2 from hand: Set up to 2 DON!! active.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
            },
            costs: [
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
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 2,
                rested: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ursa-shock-trigger-draw-and-trash',
            text: '[Trigger] Draw 1 card and trash 1 card from the top of your deck.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP12-097 Captains Assembled
    // [Main] Look at 3 cards from the top of your deck; reveal up to 1 "Revolutionary Army" type card other than [Captains Assembled] and add it to your hand. Then, trash the rest.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP12-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'captains-assembled-main-search-rev-army',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 "Revolutionary Army" type card other than [Captains Assembled] and add it to your hand. Then, trash the rest.',
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
                  trait: ['Revolutionary Army'],
                  excludeName: ['Captains Assembled'],
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
            id: 'captains-assembled-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP12-097',
                effectId: 'captains-assembled-main-search-rev-army',
              },
            ],
          },
        },
      ],
    },
    // OP12-098 Hair Removal Fist
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have a "Revolutionary Army" type Character with a cost of 8 or more, that card gains an additional +2000 power during this battle.
    // [Trigger] Draw 1 card and trash 1 card from the top of your deck.
    {
      cardId: 'OP12-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hair-removal-fist-counter-plus-2000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have a "Revolutionary Army" type Character with a cost of 8 or more, that card gains an additional +2000 power during this battle.',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hair-removal-fist-counter-additional-plus-2000',
            text: 'Then, if you have a "Revolutionary Army" type Character with a cost of 8 or more, that card gains an additional +2000 power during this battle.',
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
            ],
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                    costMin: 8,
                  },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hair-removal-fist-trigger-draw-and-trash',
            text: '[Trigger] Draw 1 card and trash 1 card from the top of your deck.',
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP12-099 Kalgara
    // [Your Turn] When a card is removed from your or your opponent's Life cards, draw 1 card. Then, you cannot draw cards using your own effects during this turn.
    {
      cardId: 'OP12-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kalgara-on-life-removed-draw',
            text: "[Your Turn] When a card is removed from your or your opponent's Life cards, draw 1 card.",
            trigger: {
              type: 'onLifeDamageDealt',
            },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kalgara-cannot-draw-this-turn',
            text: 'Then, you cannot draw cards using your own effects during this turn.',
            trigger: {
              type: 'onLifeDamageDealt',
            },
            actions: [
              {
                type: 'preventOwnEffectLifeToHand',
                player: 'self',
                duration: {
                  type: 'untilEndOfTurn',
                },
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
            ],
          },
        },
      ],
    },
    // OP12-100 Sabo
    // If you have 3 or less Life cards, this Character gains [Blocker] and +3 cost.
    // [On Play] You may add 1 card from the top of your Life cards to your hand: Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP12-100',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sabo-100-blocker-and-cost-if-3-life-or-less',
            text: 'If you have 3 or less Life cards, this Character gains [Blocker] and +3 cost.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              cost: 3,
              keywords: ['mustBeAttackTarget'],
            },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 3,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sabo-100-on-play-life-to-hand-draw-and-trash',
            text: '[On Play] You may add 1 card from the top of your Life cards to your hand: Draw 2 cards and trash 1 card from your hand.',
            trigger: {
              type: 'onPlay',
              optional: true,
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
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP12-101 Jewelry Bonney (101)
    // [Activate: Main] You may rest this Character: Your "Supernovas" type Leader gains +1000 power until the end of your opponent's next turn.
    {
      cardId: 'OP12-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-101-activate-main-leader-plus-1000',
            text: '[Activate: Main] You may rest this Character: Your "Supernovas" type Leader gains +1000 power until the end of your opponent\'s next turn.',
            trigger: {
              type: 'activateMain',
              optional: true,
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    trait: ['Supernovas'],
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 1000,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
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
    // OP12-102 Shirahoshi
    // If your Character with a base cost of 6 or less would be removed from the field by your opponent's effect, you may turn 1 card from the top of your Life cards face-up instead.[Opponent's Turn] If you have no other [Shirahoshi] with a base cost of 2, all of your "Neptunian" type Characters gain +2000 power.
    {
      cardId: 'OP12-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirahoshi-on-play-search-cost-6-or-more',
            text: '[On Play] Look at 5 cards from top of deck; reveal up to 1 cost 6+ and add to hand. Then place rest at bottom.',
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
                  costMin: 6,
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
          kind: 'continuous',
          effect: {
            id: 'shirahoshi-neptunian-plus-2000',
            text: '[Opponent\'s Turn] If you have no other [Shirahoshi] with a base cost of 2, all of your "Neptunian" type Characters gain +2000 power.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  trait: ['Neptunian'],
                },
              },
              power: 2000,
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    name: ['Shirahoshi'],
                    baseCostMax: 2,
                  },
                },
                value: 1,
              },
            ],
          },
        },
      ],
    },
    // OP12-103 Seto
    {
      cardId: 'OP12-103',
      effects: [],
    },
    // OP12-104 Sentomaru
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP12-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sentomaru-trigger-ko-cost-4-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    costMax: 4,
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
    // OP12-105 Trafalgar Lammy
    // [Your Turn] [On Play] Up to 1 of your [Trafalgar Law] cards gains +2000 power during this turn.
    {
      cardId: 'OP12-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-lammy-on-play-law-plus-2000',
            text: '[Your Turn] [On Play] Up to 1 of your [Trafalgar Law] cards gains +2000 power during this turn.',
            trigger: {
              type: 'onPlay',
            },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: {
                    name: ['Trafalgar Law'],
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
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
            ],
          },
        },
      ],
    },
    // OP12-106 Trafalgar Law (106)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP12-106',
      effects: [],
    },
    // OP12-107 Donquixote Doflamingo
    // If you have 2 or less Life cards, this Character gains [Rush].
    // (This card can attack on the turn in which it is played.)
    // [Opponent's Turn] [On K.O.] Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP12-107',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'donquixote-doflamingo-107-rush-if-2-life-or-less',
            text: 'If you have 2 or less Life cards, this Character gains [Rush].',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                source: 'effectSource',
              },
              keywords: ['rush'],
            },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-107-on-ko-deck-to-life',
            text: "[Opponent's Turn] [On K.O.] Add up to 1 card from the top of your deck to the top of your Life cards.",
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
            ],
          },
        },
      ],
    },
    // OP12-108 Donquixote Rosinante (108)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Trafalgar Law] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP12-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-rosinante-108-on-play-search-law',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Trafalgar Law] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                  name: ['Trafalgar Law'],
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
    // OP12-109 Pacifista
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 1 or less and add this card to your hand.
    {
      cardId: 'OP12-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pacifista-trigger-ko-and-add-to-hand',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 1 or less and add this card to your hand.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    costMax: 1,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP12-110 Buffalo
    {
      cardId: 'OP12-110',
      effects: [],
    },
    // OP12-111 Baby 5 (111)
    {
      cardId: 'OP12-111',
      effects: [],
    },
    // OP12-112 Baby 5 (112)
    // [Trigger] If your Leader is multicolored, draw 2 cards.
    {
      cardId: 'OP12-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-112-trigger-draw-2',
            text: '[Trigger] If your Leader is multicolored, draw 2 cards.',
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
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
          },
        },
      ],
    },
    // OP12-113 Roronoa Zoro (113)
    // [On K.O.] If your Leader has the "Supernovas" type, play up to 1 "Supernovas" type Character card with a cost of 4 or less from your hand rested.
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 1 or less and add this card to your hand.
    {
      cardId: 'OP12-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-113-on-ko-play-supernovas',
            text: '[On K.O.] If your Leader has the "Supernovas" type, play up to 1 "Supernovas" type Character card with a cost of 4 or less from your hand rested.',
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
                    trait: ['Supernovas'],
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-113-trigger-ko-and-add-to-hand',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 1 or less and add this card to your hand.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    costMax: 1,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP12-114 Wyper
    {
      cardId: 'OP12-114',
      effects: [],
    },
    // OP12-115 I Love You!!
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 2 or less Life cards, add up to 1 [Trafalgar Law] from your trash to your hand.
    {
      cardId: 'OP12-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'i-love-you-counter-plus-2000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle.',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'i-love-you-counter-add-law-from-trash',
            text: 'Then, if you have 2 or less Life cards, add up to 1 [Trafalgar Law] from your trash to your hand.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  name: ['Trafalgar Law'],
                },
                count: {
                  kind: 'upTo',
                  value: 1,
                },
                destination: 'hand',
              },
            ],
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
          },
        },
      ],
    },
    // OP12-116 We'll Ring the Bell Waiting for You!!
    // [Main] Look at 5 cards from the top of your deck; reveal a total of up to 2 "Shandian Warrior" type Character cards or [Mont Blanc Noland] and add them to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP12-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ring-the-bell-main-search',
            text: '[Main] Look at 5 cards from the top of your deck; reveal a total of up to 2 "Shandian Warrior" type Character cards or [Mont Blanc Noland] and add them to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Shandian Warrior'],
                  name: ['Mont Blanc Noland'],
                },
                count: {
                  kind: 'upTo',
                  value: 2,
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
            id: 'ring-the-bell-trigger-draw-1',
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
    // OP12-117 Slam Gibson
    // [Main] You may rest 5 of your DON!! cards: If your Leader has the "Supernovas" type, add up to 1 Character with a cost of 9 or less to the top or bottom of the owner's Life cards face-down.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP12-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'slam-gibson-main-add-to-life',
            text: '[Main] You may rest 5 of your DON!! cards: If your Leader has the "Supernovas" type, add up to 1 Character with a cost of 9 or less to the top or bottom of the owner\'s Life cards face-down.',
            trigger: {
              type: 'activateMain',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters', 'hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 9,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                faceDown: true,
                chooseDestinationPosition: true,
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
              },
            ],
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 5,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'slam-gibson-counter-leader-plus-3000',
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
    // OP12-118 Jewelry Bonney (118)
    // [Blocker]
    // [On Play] If you have 8 or more rested cards, draw 2 cards and trash 1 card from your hand. Then, set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP12-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-118-on-play-draw-and-unrest-don',
            text: '[On Play] If you have 8 or more rested cards, draw 2 cards and trash 1 card from your hand. Then, set up to 1 of your DON!! cards as active.',
            trigger: {
              type: 'onPlay',
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
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: {
                    rested: true,
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['hand', 'characters', 'cost', 'stage'],
                  filter: {
                    rested: true,
                  },
                },
                value: 8,
              },
            ],
          },
        },
      ],
    },
    // OP12-119 Bartholomew Kuma
    // [On Play] You may trash 1 card from your hand: Add up to 1 card from the top of your deck to the top of your Life cards. Then, this Character gains +2 cost until the end of your opponent's next End Phase.
    // [Opponent's Turn] [On K.O.] Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP12-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-on-play-deck-to-life',
            text: "[On Play] You may trash 1 card from your hand: Add up to 1 card from the top of your deck to the top of your Life cards. Then, this Character gains +2 cost until the end of your opponent's next End Phase.",
            trigger: {
              type: 'onPlay',
              optional: true,
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                amount: 2,
                duration: {
                  type: 'untilStartOfYourNextTurn',
                },
              },
            ],
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
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-on-ko-deck-to-life',
            text: "[Opponent's Turn] [On K.O.] Add up to 1 card from the top of your deck to the top of your Life cards.",
            trigger: {
              type: 'onKo',
            },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
            conditions: [
              {
                type: 'controllerTurn',
                value: false,
              },
            ],
          },
        },
      ],
    },
  ],
};
