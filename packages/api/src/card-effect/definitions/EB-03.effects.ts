import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const eb03EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'EB-03',
  cards: [
    // EB03-001 Nefeltari Vivi (001)
    // [Once Per Turn] If your Character with a base cost of 4 or more would be K.O.'d, you may trash 1 card from your hand instead.
    // [Activate: Main] You may rest this Leader: Give up to 1 of your opponent's Characters 2000 power during this turn. Then, up to 1 of your Characters without a [When Attacking] effect gains [Rush] during this turn.
    {
      cardId: 'EB03-001',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'nefeltari-vivi-once-per-turn-prevent-ko-trash-hand',
            text: "[Once Per Turn] If your Character with a base cost of 4 or more would be K.O.'d, you may trash 1 card from your hand instead.",
            event: 'wouldKoCharacter',
            optional: true,
            oncePerTurn: true,
            conditions: [
              {
                type: 'eventTargetMatchesFilter',
                filter: { cardCategory: ['Character'], baseCostMin: 4 },
              },
            ],
            replacement: [
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
        {
          kind: 'standard',
          effect: {
            id: 'nefeltari-vivi-activate-main-give-opponent-2000-and-give-rush',
            text: "[Activate: Main] You may rest this Leader: Give up to 1 of your opponent's Characters 2000 power during this turn. Then, up to 1 of your Characters without a [When Attacking] effect gains [Rush] during this turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { hasNoBaseEffect: true },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-003 Uta (003) (Alternate Art)
    // [On Play] If your Leader is [Uta], draw 2 cards. Then, play up to 1 Character card with 6000 power or less and no base effect from your hand.
    {
      cardId: 'EB03-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uta-on-play-draw-2-play-weak-no-base-effect',
            text: '[On Play] If your Leader is [Uta], draw 2 cards. Then, play up to 1 Character card with 6000 power or less and no base effect from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Uta' },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                    hasNoBaseEffect: true,
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
    // EB03-004 Carina
    // [Blocker]
    // [Opponent's Turn] If your Leader is multicolored and you have no Characters with 6000 base power or more, this Character gains +4000 power.
    {
      cardId: 'EB03-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'carina-opponents-turn-plus-4000-if-multicolor-and-no-strong-characters',
            text: "[Opponent's Turn] If your Leader is multicolored and you have no Characters with 6000 base power or more, this Character gains +4000 power.",
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMin: 6000 },
                },
                value: 0,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Carina'] },
              },
              power: 4000,
            },
          },
        },
      ],
    },
    // EB03-005 Sugar
    // [On Play] If your Leader is [Sugar], play up to 1 {Donquixote Pirates} type Character card with 6000 power or less from your hand rested.
    {
      cardId: 'EB03-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sugar-on-play-play-donquixote-pirates-rested',
            text: '[On Play] If your Leader is [Sugar], play up to 1 {Donquixote Pirates} type Character card with 6000 power or less from your hand rested.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Sugar' },
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
                    powerMax: 6000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // EB03-006 Nami (006)
    // [On Play] You may give your active Leader 5000 power during this turn: Draw 1 card.
    // [Activate: Main] [Once Per Turn] If your Leader has the {Alabasta} type, give up to 1 of your opponent's Characters 1000 power during this turn.
    {
      cardId: 'EB03-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-006-on-play-give-leader-5000-draw-1',
            text: '[On Play] You may give your active Leader 5000 power during this turn: Draw 1 card.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nami-006-activate-main-opponent-1000',
            text: "[Activate: Main] [Once Per Turn] If your Leader has the {Alabasta} type, give up to 1 of your opponent's Characters 1000 power during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Alabasta',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-007 Baccarat
    // [Blocker] [On K.O.] Play up to 1 Character card with 6000 power or less and no base effect from your hand.
    {
      cardId: 'EB03-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baccarat-on-ko-play-weak-no-base-effect',
            text: '[Blocker] [On K.O.] Play up to 1 Character card with 6000 power or less and no base effect from your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                    hasNoBaseEffect: true,
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
    // EB03-008 Hibari
    // [On Play]/[When Attacking] Up to 1 of your {SWORD} type Leader or Character cards can also attack active Characters during this turn.
    // [Activate: Main] [Once Per Turn] Give up to 1 of your opponent's Characters 1000 power during this turn.
    {
      cardId: 'EB03-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hibari-on-play-attack-active',
            text: '[On Play] Up to 1 of your {SWORD} type Leader or Character cards can also attack active Characters during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['SWORD'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hibari-when-attacking-attack-active',
            text: '[When Attacking] Up to 1 of your {SWORD} type Leader or Character cards can also attack active Characters during this turn.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['SWORD'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hibari-activate-main-opponent-1000',
            text: "[Activate: Main] [Once Per Turn] Give up to 1 of your opponent's Characters 1000 power during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-009 Makino
    // [Activate: Main] You may rest this Character: Up to 1 of your Characters with no base effect gains +2000 power during this turn.
    {
      cardId: 'EB03-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'makino-activate-main-rest-give-2000-to-no-base-effect',
            text: '[Activate: Main] You may rest this Character: Up to 1 of your Characters with no base effect gains +2000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Makino'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { hasNoBaseEffect: true },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-010 Monet
    // [Blocker] [On Play] Look at 5 cards from the top of your deck; reveal up to 1 Character card with 1000 power or less or up to 1 Event card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB03-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monet-on-play-search-character-or-event',
            text: '[Blocker] [On Play] Look at 5 cards from the top of your deck; reveal up to 1 Character card with 1000 power or less or up to 1 Event card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character', 'Event'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // EB03-011 But If We Ever See Each Other Again... Will You Call Me Your Shipmate?!!
    // [Counter] If your Leader is [Nefeltari Vivi], up to 1 of your Leader or Character cards gains +4000 power during this battle.
    // [Trigger] Give up to 1 of your opponent's Characters 2000 power during this turn.
    {
      cardId: 'EB03-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'call-me-your-shipmate-counter-plus-4000',
            text: '[Counter] If your Leader is [Nefeltari Vivi], up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nefeltari Vivi',
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
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'call-me-your-shipmate-trigger-opponent-2000',
            text: "[Trigger] Give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'trigger' },
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
    // EB03-012 Otama
    // [Activate: Main] You may rest this Character: Rest up to 1 of your opponent's DON!! cards or {Animal} or {SMILE} type Characters with a cost of 3 or less.
    {
      cardId: 'EB03-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'otama-activate-main-rest-don-or-animal-smile',
            text: "[Activate: Main] You may rest this Character: Rest up to 1 of your opponent's DON!! cards or {Animal} or {SMILE} type Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Otama'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB03-013 Carrot
    // [Activate: Main] [Once Per Turn] If this Character was played on this turn, K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less. Then, play up to 1 [Zou] from your hand.
    {
      cardId: 'EB03-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carrot-activate-main-ko-rested-cost-5-play-zou',
            text: "[Activate: Main] [Once Per Turn] If this Character was played on this turn, K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less. Then, play up to 1 [Zou] from your hand.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'eventPlayedByEffect', value: false }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Zou'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB03-014 Kuina
    // [Activate: Main] You may rest this Character: Give up to 2 rested DON!! cards to your attribute Leader.
    {
      cardId: 'EB03-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuina-activate-main-rest-attach-don-to-leader',
            text: '[Activate: Main] You may rest this Character: Give up to 2 rested DON!! cards to your attribute Leader.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kuina'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // EB03-015 Camie
    // [Activate: Main] You may rest this Character: Give up to 1 rested DON!! card to 1 of your {Fish-Man} or {Merfolk} type Leader or Character cards. Then, rest up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'EB03-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'camie-activate-main-rest-attach-don-and-rest-opponent',
            text: "[Activate: Main] You may rest this Character: Give up to 1 rested DON!! card to 1 of your {Fish-Man} or {Merfolk} type Leader or Character cards. Then, rest up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Camie'] },
                  count: { kind: 'exact', value: 1 },
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
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 2,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB03-016 Kouzuki Hiyori
    // [On Play] If your Leader is [Kouzuki Oden], draw 1 card.
    // [Activate: Main] You may trash this Character: Give up to 1 rested DON!! card to your {Land of Wano} type Leader.
    {
      cardId: 'EB03-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-on-play-draw-if-oden',
            text: '[On Play] If your Leader is [Kouzuki Oden], draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Kouzuki Oden',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-activate-main-trash-attach-don-to-leader',
            text: '[Activate: Main] You may trash this Character: Give up to 1 rested DON!! card to your {Land of Wano} type Leader.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kouzuki Hiyori'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { trait: ['Land of Wano'] },
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
    // EB03-017 Jewelry Bonney
    // [On Play] If your Leader has the {Supernovas} type, set up to 1 of your DON!! cards as active. Then, up to 1 of your opponent's Characters with a cost of 8 or less cannot be rested until the end of your opponent's next End Phase.
    {
      cardId: 'EB03-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-on-play-unrest-don',
            text: '[On Play] If your Leader has the {Supernovas} type, set up to 1 of your DON!! cards as active.',
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
                type: 'unrest',
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
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-on-play-cannot-rest-opponent',
            text: "Then, up to 1 of your opponent's Characters with a cost of 8 or less cannot be rested until the end of your opponent's next End Phase.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 8 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 2,
              },
            ],
          },
        },
      ],
    },
    // EB03-018 Tashigi
    // [Opponent's Turn] This Character cannot be K.O.'d by your opponent's effects and gains [Blocker].
    // [End of Your Turn] You may rest 1 of your DON!! cards and trash 1 card from your hand: Set this Character as active.
    {
      cardId: 'EB03-018',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'tashigi-opponents-turn-cannot-be-koed-by-effects',
            text: "[Opponent's Turn] This Character cannot be K.O.'d by your opponent's effects and gains [Blocker].",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Tashigi'] },
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'tashigi-end-of-turn-unrest-self',
            text: '[End of Your Turn] You may rest 1 of your DON!! cards and trash 1 card from your hand: Set this Character as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'controllerTurn', value: true }],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Tashigi'], rested: true },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB03-019 Wanda
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'EB03-019',
      effects: [],
    },
    // EB03-020 There You Are, Sore Loser!
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 2 or more {FILM} type Characters, that card gains an additional +2000 power during this battle.
    {
      cardId: 'EB03-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'there-you-are-sore-loser-counter-plus-2000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle.',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'there-you-are-sore-loser-counter-extra-2000-if-film',
            text: 'Then, if you have 2 or more {FILM} type Characters, that card gains an additional +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['FILM'] },
                },
                value: 2,
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
                amount: 2000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB03-021 Alvida
    // [On Play] You may trash 1 card from your hand: Place up to 1 of your opponent's Characters with 4000 base power or less and up to 1 Character with a base cost of 3 or less at the bottom of the owner's deck.
    {
      cardId: 'EB03-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'alvida-on-play-trash-1-bottom-deck-two-characters',
            text: "[On Play] You may trash 1 card from your hand: Place up to 1 of your opponent's Characters with 4000 base power or less and up to 1 Character with a base cost of 3 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 4000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMax: 3,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
            ],
          },
        },
      ],
    },
    // EB03-022 Isuka
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Place up to 1 Character with a cost of 4 or less at the bottom of the owner's deck.
    {
      cardId: 'EB03-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'isuka-on-play-bottom-deck-cost-4-or-less',
            text: "[On Play] Place up to 1 Character with a cost of 4 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
            ],
          },
        },
      ],
    },
    // EB03-023 Kaya
    // [On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'EB03-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaya-on-play-arrange-top-5',
            text: '[On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 5 }],
          },
        },
      ],
    },
    // EB03-024 Nefeltari Vivi (024)
    // [Blocker]
    // [On Play] Play up to 1 {Alabasta} or {Straw Hat Crew} type Character card with a cost of 5 or less from your hand. Then, you cannot play any Character cards on your field during this turn.
    {
      cardId: 'EB03-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nefeltari-vivi-024-on-play-play-alabasta-or-straw-hat',
            text: '[On Play] Play up to 1 {Alabasta} or {Straw Hat Crew} type Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Alabasta', 'Straw Hat Crew'],
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
    // EB03-025 Hina
    // [On Play] You may trash 1 card from your hand: Return up to 1 Character with 6000 base power to the owner's hand.
    {
      cardId: 'EB03-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hina-on-play-trash-1-bounce-6000-base-power',
            text: "[On Play] You may trash 1 card from your hand: Return up to 1 Character with 6000 base power to the owner's hand.",
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMin: 6000,
                    basePowerMax: 6000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // EB03-026 Boa Hancock
    // [On Play] If your opponent has 5 or more cards in their hand, your opponent places 1 card from their hand at the bottom of their deck.
    // [Activate: Main] [Once Per Turn] You may place 1 of your Characters at the bottom of the owner's deck: Give your Leader and 1 Character up to 1 rested DON!! card each.
    {
      cardId: 'EB03-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-on-play-opponent-bottom-deck-from-hand',
            text: '[On Play] If your opponent has 5 or more cards in their hand, your opponent places 1 card from their hand at the bottom of their deck.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['hand'] },
                value: 5,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-activate-main-place-character-bottom-attach-don',
            text: "[Activate: Main] [Once Per Turn] You may place 1 of your Characters at the bottom of the owner's deck: Give your Leader and 1 Character up to 1 rested DON!! card each.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
                rested: true,
              },
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
    // EB03-027 Marguerite
    // [On Play] Return up to 1 Character with 7000 base power to the owner's hand.
    {
      cardId: 'EB03-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marguerite-on-play-bounce-7000-base-power',
            text: "[On Play] Return up to 1 Character with 7000 base power to the owner's hand.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMin: 7000,
                    basePowerMax: 7000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // EB03-028 Yu
    // [On Play] Trash 1 card from your hand. [Activate: Main] You may trash this Character: If you have 4 or less cards in your hand, draw 2 cards.
    {
      cardId: 'EB03-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yu-on-play-trash-1',
            text: '[On Play] Trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
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
        {
          kind: 'standard',
          effect: {
            id: 'yu-activate-main-trash-self-draw-2',
            text: '[Activate: Main] You may trash this Character: If you have 4 or less cards in your hand, draw 2 cards.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 4,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Yu'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB03-029 Insolent Fool!! Stand Down!!
    // [Main] You may rest 4 of your DON!! cards: If your Leader is [Boa Hancock], play up to 1 {Amazon Lily} or {Kuja Pirates} type Character card with a cost of 6 or less from your hand. [Counter] Up to 1 of your [Boa Hancock] cards gains +3000 power during this battle.
    {
      cardId: 'EB03-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'insolent-fool-main-rest-4-don-play-amazon-or-kuja',
            text: '[Main] You may rest 4 of your DON!! cards: If your Leader is [Boa Hancock], play up to 1 {Amazon Lily} or {Kuja Pirates} type Character card with a cost of 6 or less from your hand.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Boa Hancock',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 4 },
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
                    trait: ['Amazon Lily', 'Kuja Pirates'],
                    costMax: 6,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'insolent-fool-counter-boa-hancock-plus-3000',
            text: '[Counter] Up to 1 of your [Boa Hancock] cards gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Boa Hancock'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB03-031 Vinsmoke Reiju
    // [Your Turn] [On Play] DON!! 1: If your Leader is [Sanji], activate the [Main] effect of up to 1 Event card with a cost of 7 or less in your trash.
    {
      cardId: 'EB03-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-reiju-on-play-activate-event-from-trash',
            text: '[Your Turn] [On Play] DON!! 1: If your Leader is [Sanji], activate the [Main] effect of up to 1 Event card with a cost of 7 or less in your trash.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Sanji',
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Event'],
                    costMax: 7,
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
    // EB03-032 Charlotte Flampe
    // [Your Turn] [On Play] Up to 1 of your [Charlotte Katakuri] cards gains +2000 power during this turn.
    {
      cardId: 'EB03-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-flampe-on-play-katakuri-plus-2000',
            text: '[Your Turn] [On Play] Up to 1 of your [Charlotte Katakuri] cards gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Charlotte Katakuri'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-033 Charlotte Brulee
    // [Opponent's Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck by your effect, if your Leader has the {Big Mom Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'EB03-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-brulee-on-don-returned-add-rested-don',
            text: "[Opponent's Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck by your effect, if your Leader has the {Big Mom Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.",
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'eventEffectControllerIs', player: 'self' },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Big Mom Pirates',
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
    // EB03-034 Charlotte Linlin
    // [On Play] Draw 1 card and place 1 card from your hand at the top of your deck. Then, add up to 1 DON!! card from your DON!! deck and set it as active.
    // [On K.O.] DON!! 1: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'EB03-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-linlin-on-play-draw-1-top-deck-1-add-active-don',
            text: '[On Play] Draw 1 card and place 1 card from your hand at the top of your deck. Then, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
              },
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
            id: 'charlotte-linlin-on-ko-add-to-life',
            text: '[On K.O.] DON!! 1: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onKo' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
      ],
    },
    // EB03-035 Charlotte Pudding
    // [Blocker]
    // [On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'EB03-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-on-play-add-rested-don-if-less-don',
            text: "[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and rest it.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 0,
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
    // EB03-036 Baby 5
    // [On Play] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 2 of your opponent's Characters with a base cost of 3 or less.
    {
      cardId: 'EB03-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-on-play-don-1-ko-up-to-2-base-cost-3-or-less',
            text: "[On Play] DON!! 1: K.O. up to 2 of your opponent's Characters with a base cost of 3 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMax: 3,
                  },
                  count: { kind: 'upTo', value: 2 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // EB03-037 Lim
    // [On Play] If you have 7 or more DON!! cards on your field, all of your {ODYSSEY} type Leader and Character cards gain +1000 power until the end of your opponent's next End Phase.
    {
      cardId: 'EB03-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lim-on-play-odyssey-plus-1000-until-opponent-end',
            text: "[On Play] If you have 7 or more DON!! cards on your field, all of your {ODYSSEY} type Leader and Character cards gain +1000 power until the end of your opponent's next End Phase.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 7 },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['ODYSSEY'] },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-038 Thanks for the Treat.
    // [Main] You may rest 1 of your DON!! cards: If the number of DON!! cards on your field is equal to or less than the number on your opponent's field and you only have Characters with a type including "GERMA", add up to 2 DON!! cards from your DON!! deck and rest them. [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'EB03-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thanks-for-the-treat-main-add-2-rested-don',
            text: '[Main] You may rest 1 of your DON!! cards: If the number of DON!! cards on your field is equal to or less than the number on your opponent\'s field and you only have Characters with a type including "GERMA", add up to 2 DON!! cards from your DON!! deck and rest them.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 0,
              },
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'GERMA',
              },
            ],
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
              {
                type: 'addDon',
                player: 'self',
                amount: 2,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'thanks-for-the-treat-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB03-039 Ulti
    // [On Play] If your Leader has the {Animal Kingdom Pirates} type, draw 1 card and trash 1 card from your hand. Then, play up to 1 Character card with 6000 power or less and no base effect from your trash.
    {
      cardId: 'EB03-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ulti-on-play-draw-trash-play-from-trash',
            text: '[On Play] If your Leader has the {Animal Kingdom Pirates} type, draw 1 card and trash 1 card from your hand. Then, play up to 1 Character card with 6000 power or less and no base effect from your trash.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
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
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
                    hasNoBaseEffect: true,
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
    // EB03-041 Kujyaku
    // [Opponent's Turn] All of your {SWORD} type Characters with a cost of 6 or less gain +2000 power.
    // [On Play] You may trash 1 {Navy} type card from your hand: Draw 2 cards.
    {
      cardId: 'EB03-041',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kujyaku-opponents-turn-sword-plus-2000',
            text: "[Opponent's Turn] All of your {SWORD} type Characters with a cost of 6 or less gain +2000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  trait: ['SWORD'],
                  costMax: 6,
                },
              },
              power: 2000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kujyaku-on-play-trash-navy-draw-2',
            text: '[On Play] You may trash 1 {Navy} type card from your hand: Draw 2 cards.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Navy'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB03-042 Koala
    // If your Leader has the {Revolutionary Army} type, this Character gains +4 cost.
    // [Opponent's Turn] [On K.O.] Play up to 1 {Revolutionary Army} type Character card with a cost of 6 or less other than [Koala] or up to 1 [Nico Robin] with a cost of 6 or less from your hand or trash.
    {
      cardId: 'EB03-042',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'koala-plus-4-cost-if-revolutionary-army-leader',
            text: 'If your Leader has the {Revolutionary Army} type, this Character gains +4 cost.',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Koala'] },
              },
              cost: 4,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'koala-on-ko-play-revolutionary-army-or-nico-robin',
            text: "[Opponent's Turn] [On K.O.] Play up to 1 {Revolutionary Army} type Character card with a cost of 6 or less other than [Koala] or up to 1 [Nico Robin] with a cost of 6 or less from your hand or trash.",
            trigger: { type: 'onKo' },
            conditions: [{ type: 'controllerTurn', value: false }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 6,
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
    // EB03-043 Stussy
    // [Blocker] [On Play] You may place 2 cards with a type including "CP" from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'EB03-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'stussy-on-play-bottom-cp-from-trash-ko-cost-4-or-less',
            text: '[Blocker] [On Play] You may place 2 cards with a type including "CP" from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent\'s Characters with a cost of 4 or less.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { traitIncludes: ['CP'] },
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
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
    // EB03-044 Black Maria
    // If your Leader is multicolored, this Character gains [Blocker]. [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Onigashima Island] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Onigashima Island] from your hand.
    {
      cardId: 'EB03-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'black-maria-on-play-search-onigashima-island',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Onigashima Island] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Onigashima Island] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { name: ['Onigashima Island'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Onigashima Island'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // EB03-045 Perona (045)
    // [Blocker]
    // [On Play] Give up to 1 rested DON!! card to your Leader or 1 of your Characters. Then, if you have 10 or more cards in your trash, play up to 1 {Thriller Bark Pirates} type Character card with a cost of 2 or less from your trash rested.
    {
      cardId: 'EB03-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'perona-045-on-play-attach-rested-don',
            text: '[On Play] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'perona-045-on-play-thriller-bark-from-trash-if-10-trash',
            text: 'Then, if you have 10 or more cards in your trash, play up to 1 {Thriller Bark Pirates} type Character card with a cost of 2 or less from your trash rested.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
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
                    trait: ['Thriller Bark Pirates'],
                    costMax: 2,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // EB03-046 Miss Doublefinger(Zala)
    // [On Play] If there is a Character with a cost of 0 or with a cost of 8 or more, draw 1 card. [On K.O.] Trash 2 cards from the top of your deck.
    {
      cardId: 'EB03-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-doublefinger-on-play-draw-if-cost-0-or-8plus',
            text: '[On Play] If there is a Character with a cost of 0 or with a cost of 8 or more, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 0,
                    costMax: 0,
                  },
                },
                value: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'miss-doublefinger-on-play-draw-if-cost-8-or-more',
            text: '[On Play] If there is a Character with a cost of 8 or more, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 8,
                  },
                },
                value: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'miss-doublefinger-on-ko-trash-2-from-deck',
            text: '[On K.O.] Trash 2 cards from the top of your deck.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB03-047 Miss.Valentine(Mikita)
    // [On Play] Trash 3 cards from the top of your deck.
    // [On K.O.] Draw 1 card.
    {
      cardId: 'EB03-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-valentine-on-play-trash-3-from-deck',
            text: '[On Play] Trash 3 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'miss-valentine-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB03-048 Rebecca
    // [Blocker] [On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Dressrosa} type Stage card and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 {Dressrosa} type Stage card with a cost of 1 from your hand.
    {
      cardId: 'EB03-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rebecca-on-play-search-dressrosa-stage',
            text: '[Blocker] [On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Dressrosa} type Stage card and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 {Dressrosa} type Stage card with a cost of 1 from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Stage'],
                  trait: ['Dressrosa'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Stage'],
                    trait: ['Dressrosa'],
                    costMin: 1,
                    costMax: 1,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // EB03-049 I Knew You People Were Behind This.
    // [Main] You may rest 7 of your DON!! cards: If your Leader is [Perona], play up to 1 {Thriller Bark Pirates} type Character card with a cost of 6 or less and up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your hand or trash. [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'EB03-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'i-knew-you-people-were-behind-this-main-play-thriller-bark',
            text: '[Main] You may rest 7 of your DON!! cards: If your Leader is [Perona], play up to 1 {Thriller Bark Pirates} type Character card with a cost of 6 or less and up to 1 {Thriller Bark Pirates} type Character card with a cost of 4 or less from your hand or trash.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Perona',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 7 },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 6,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Thriller Bark Pirates'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'i-knew-you-people-were-behind-this-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // EB03-050 Conis
    // [On Play] Up to 1 of your {Sky Island} type Characters gains [Double Attack] during this turn.
    // (This card deals 2 damage.)
    {
      cardId: 'EB03-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'conis-on-play-sky-island-double-attack',
            text: '[On Play] Up to 1 of your {Sky Island} type Characters gains [Double Attack] during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Sky Island'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['doubleAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-051 Charlotte Smoothie
    // [On Play] If you have a face-up Life card, K.O. up to 1 of your opponent's Characters with a cost of 2 or less. Then, turn all of your Life cards face-down.
    {
      cardId: 'EB03-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-smoothie-on-play-ko-cost-2-or-less',
            text: "[On Play] If you have a face-up Life card, K.O. up to 1 of your opponent's Characters with a cost of 2 or less. Then, turn all of your Life cards face-down.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 2,
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
    // EB03-052 Shirahoshi
    // [Activate: Main] You may trash this Character: If your Leader is [Shirahoshi], add 1 card from the top of your deck to the top of your Life cards. Then, all of your {Neptunian} type Characters gain +1000 power during this turn.
    {
      cardId: 'EB03-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirahoshi-activate-main-trash-add-to-life-and-neptunian-buff',
            text: '[Activate: Main] You may trash this Character: If your Leader is [Shirahoshi], add 1 card from the top of your deck to the top of your Life cards. Then, all of your {Neptunian} type Characters gain +1000 power during this turn.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Shirahoshi'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'exact', value: 1 },
                },
                player: 'self',
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Neptunian'] },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-053 Nami (053)
    // [On Play] Give up to 1 rested DON!! card to your Leader. Then, if your opponent has 3 or more Life cards, add up to 1 card from the top of your opponent's Life cards to the owner's hand.
    // [On K.O.] You may turn 1 card from the top of your Life cards face-up: Play up to 1 Character card with 6000 power or less from your hand.
    {
      cardId: 'EB03-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-053-on-play-attach-don-to-leader',
            text: '[On Play] Give up to 1 rested DON!! card to your Leader.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
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
            id: 'nami-053-on-play-opponent-life-to-hand',
            text: "Then, if your opponent has 3 or more Life cards, add up to 1 card from the top of your opponent's Life cards to the owner's hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['life'] },
                value: 3,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
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
            id: 'nami-053-on-ko-play-from-hand',
            text: '[On K.O.] You may turn 1 card from the top of your Life cards face-up: Play up to 1 Character card with 6000 power or less from your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 6000,
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
    // EB03-054 Nico Robin (054)
    // [On Play] You may trash 1 card from the top of your Life cards: Add up to 1 card from the top of your deck to the top of your Life cards. [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'EB03-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-054-on-play-trash-life-add-to-life',
            text: '[On Play] You may trash 1 card from the top of your Life cards: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-054-trigger-play-this-card',
            text: '[Trigger] You may trash 1 card from your hand: Play this card.',
            trigger: { type: 'trigger' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Nico Robin'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB03-055 Nico Robin (055)
    // [On Play] You may trash 1 card from the top of your Life cards: If your Leader has the {Straw Hat Crew} type, add up to 2 cards from the top of your deck to the top of your Life cards.
    // [Opponent's Turn] [On K.O.] You may deal 1 damage to your opponent.
    {
      cardId: 'EB03-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-055-on-play-trash-life-add-2-to-life',
            text: '[On Play] You may trash 1 card from the top of your Life cards: If your Leader has the {Straw Hat Crew} type, add up to 2 cards from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 2 },
                },
                player: 'self',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-055-on-ko-deal-damage',
            text: "[Opponent's Turn] [On K.O.] You may deal 1 damage to your opponent.",
            trigger: { type: 'onKo' },
            conditions: [{ type: 'controllerTurn', value: false }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // EB03-056 Belo Betty
    // [On Play] You may turn 1 card from the top of your Life cards face-up: K.O. up to 1 of your opponent's Characters with a base cost of 3 or less.
    {
      cardId: 'EB03-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'belo-betty-on-play-ko-base-cost-3-or-less',
            text: "[On Play] You may turn 1 card from the top of your Life cards face-up: K.O. up to 1 of your opponent's Characters with a base cost of 3 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMax: 3,
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
    // EB03-057 Yamato
    // [On Play] Give up to 3 rested DON!! cards to your {Land of Wano} type Leader.
    // [On K.O.] Trash up to 1 card from the top of your opponent's Life cards.
    {
      cardId: 'EB03-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yamato-on-play-attach-3-don-to-land-of-wano-leader',
            text: '[On Play] Give up to 3 rested DON!! cards to your {Land of Wano} type Leader.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 3,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'yamato-on-ko-trash-opponent-life',
            text: "[On K.O.] Trash up to 1 card from the top of your opponent's Life cards.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // EB03-058 Lilith
    // [Your Turn] [On Play] If you have 2 or less Life cards, draw 1 card.
    // [Trigger] If your Leader is [Vegapunk], play this card.
    {
      cardId: 'EB03-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lilith-on-play-draw-if-2-or-less-life',
            text: '[Your Turn] [On Play] If you have 2 or less Life cards, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'lilith-trigger-play-this-card',
            text: '[Trigger] If your Leader is [Vegapunk], play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Vegapunk',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Lilith'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB03-059 S-Snake
    // [On Play] If your Leader has the {Egghead} type and you have 2 or more Life cards, add up to 1 Character card with a [Trigger] from your hand to the top of your Life cards face-up.
    // [Trigger] Up to 1 of your opponent's Characters with a cost of 6 or less other than [Monkey.D.Luffy] cannot attack during this turn.
    {
      cardId: 'EB03-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 's-snake-on-play-add-trigger-character-to-life',
            text: '[On Play] If your Leader has the {Egghead} type and you have 2 or more Life cards, add up to 1 Character card with a [Trigger] from your hand to the top of your Life cards face-up.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Egghead',
              },
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['life'] },
                value: 2,
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    hasTrigger: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 's-snake-trigger-cannot-attack',
            text: "[Trigger] Up to 1 of your opponent's Characters with a cost of 6 or less other than [Monkey.D.Luffy] cannot attack during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 6,
                    excludeName: ['Monkey.D.Luffy'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB03-060 Will You Be My Servant?
    // [Main] If your Leader is [Nami], look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 2 to 8 and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB03-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'will-you-be-my-servant-main-search',
            text: '[Main] If your Leader is [Nami], look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 2 to 8 and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nami',
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
                  costMax: 8,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'will-you-be-my-servant-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB03-060',
                effectId: 'will-you-be-my-servant-main-search',
              },
            ],
          },
        },
      ],
    },
    // EB03-061 Uta (061) (Alternate Art)
    // [Activate: Main] [Once Per Turn] Set up to 1 of your DON!! cards as active. Then, rest up to 1 of your opponent's DON!! cards or Characters with a cost of 4 or less.
    // [End of Your Turn] You may rest 1 of your DON!! cards: Set up to 1 of your {FILM} type Characters as active.
    {
      cardId: 'EB03-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uta-061-activate-main-unrest-don-rest-opponent',
            text: "[Activate: Main] [Once Per Turn] Set up to 1 of your DON!! cards as active. Then, rest up to 1 of your opponent's DON!! cards or Characters with a cost of 4 or less.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'uta-061-end-of-your-turn-rest-don-unrest-film',
            text: '[End of Your Turn] You may rest 1 of your DON!! cards: Set up to 1 of your {FILM} type Characters as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'controllerTurn', value: true }],
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
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['FILM'], rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB03-062 Trafalgar Law (Alternate Art)
    // [Rush]
    // [Activate: Main] You may trash 1 card from your hand and trash this Character: Add up to 1 card from the top of your deck to the top of your Life cards. Then, play up to 1 [Trafalgar Law] with a cost of 7 or less from your hand.
    {
      cardId: 'EB03-062',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'trafalgar-law-has-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Trafalgar Law'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-activate-main-trash-add-to-life-and-play',
            text: '[Activate: Main] You may trash 1 card from your hand and trash this Character: Add up to 1 card from the top of your deck to the top of your Life cards. Then, play up to 1 [Trafalgar Law] with a cost of 7 or less from your hand.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Trafalgar Law'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Trafalgar Law'], costMax: 7 },
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
