import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const eb02EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'EB-02',
  cards: [
    // EB02-002 Sabo
    // [Activate: Main] You may rest this Character: Up to 1 of your "Revolutionary Army" type Characters other than [Sabo] gains +2000 power during this turn.
    {
      cardId: 'EB02-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sabo-activate-main-rest-revolutionary-army-plus-2000',
            text: '[Activate: Main] You may rest this Character: Up to 1 of your "Revolutionary Army" type Characters other than [Sabo] gains +2000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Sabo'] },
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
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                    excludeName: ['Sabo'],
                  },
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
    // EB02-003 Tony Tony.Chopper
    // [DON!! x2] [Opponent's Turn] This Character gains +2000 power.
    // [On Play] If your Leader has the "Straw Hat Crew" type, give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'EB02-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'tony-tony-chopper-opponents-turn-plus-2000',
            text: "[DON!! x2] [Opponent's Turn] This Character gains +2000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'controllerTurn', value: false },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Tony Tony.Chopper'] },
              },
              power: 2000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-on-play-give-rested-don',
            text: '[On Play] If your Leader has the "Straw Hat Crew" type, give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
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
    // EB02-005 Fake Straw Hat Crew
    // [Your Turn] This Character gains +2000 power.
    // [Opponent's Turn] Give this Character 2000 power.
    {
      cardId: 'EB02-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'fake-straw-hat-crew-your-turn-plus-2000',
            text: '[Your Turn] This Character gains +2000 power.',
            conditions: [{ type: 'controllerTurn', value: true }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Fake Straw Hat Crew'] },
              },
              power: 2000,
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'fake-straw-hat-crew-opponents-turn-plus-2000',
            text: "[Opponent's Turn] Give this Character 2000 power.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Fake Straw Hat Crew'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // EB02-006 Yamato
    // [Activate: Main] [Once Per Turn] If your Leader has the "Land of Wano" type or is [Portgas.D.Ace], give up to 1 rested DON!! card to 1 of your Leader. Then, this Character gains [Rush] during this turn.
    {
      cardId: 'EB02-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yamato-activate-main-land-of-wano-leader-attach-don-and-rush',
            text: '[Activate: Main] [Once Per Turn] If your Leader has the "Land of Wano" type, give up to 1 rested DON!! card to 1 of your Leader. Then, this Character gains [Rush] during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Land of Wano',
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Yamato'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'yamato-activate-main-portgas-d-ace-leader-attach-don-and-rush',
            text: '[Activate: Main] [Once Per Turn] If your Leader is [Portgas.D.Ace], give up to 1 rested DON!! card to 1 of your Leader. Then, this Character gains [Rush] during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Portgas.D.Ace',
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Yamato'] },
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
    // EB02-007 Cloven Rose Blizzard
    // [Main] Up to a total of 3 of your Leader and Character cards gain +1000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 3000 power or less.
    // [Trigger] K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'EB02-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cloven-rose-blizzard-main-plus-1000-then-ko-3000',
            text: "[Main] Up to a total of 3 of your Leader and Character cards gain +1000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 3 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 3000,
                  },
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
            id: 'cloven-rose-blizzard-trigger-ko-4000',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 4000,
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
    // EB02-008 The Peak
    // [Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB02-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'the-peak-main-search-cost-4-or-more',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: { costMin: 4 },
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
            id: 'the-peak-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB02-008',
                effectId: 'the-peak-main-search-cost-4-or-more',
              },
            ],
          },
        },
      ],
    },
    // EB02-009 Thousand Sunny
    // [Activate: Main] You may rest this Stage: Give up to 1 of your currently given DON!! cards to 1 of your "Straw Hat Crew" type Characters.
    {
      cardId: 'EB02-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thousand-sunny-activate-main-rest-attach-don',
            text: '[Activate: Main] You may rest this Stage: Give up to 1 of your currently given DON!! cards to 1 of your "Straw Hat Crew" type Characters.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Thousand Sunny'] },
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
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Straw Hat Crew'],
                  },
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
    // EB02-010 Monkey.D.Luffy (010)
    // [Activate: Main] [Once Per Turn] DON!! 2: If the only Characters on your field are "Straw Hat Crew" type Characters, set up to 2 of your DON!! cards as active. Then, this Leader gains +1000 power until the end of your opponent's next turn.
    {
      cardId: 'EB02-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-010-activate-main-don-2-only-straw-hat-unrest-and-power',
            text: '[Activate: Main] [Once Per Turn] DON!! 2: If the only Characters on your field are "Straw Hat Crew" type Characters, set up to 2 of your DON!! cards as active. Then, this Leader gains +1000 power until the end of your opponent\'s next turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            conditions: [
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'Straw Hat Crew',
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 2 },
                },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB02-011 Arlong
    // [On Play] If your Leader has the "Fish-Man" or "East Blue" type, give up to 1 rested DON!! card to 1 of your Leader. Then, up to 1 of your opponent's Characters with a cost of 5 or less cannot be rested until the end of your opponent's next turn.
    {
      cardId: 'EB02-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'arlong-on-play-fish-man-leader-attach-don-and-restrict-rest',
            text: '[On Play] If your Leader has the "Fish-Man" type, give up to 1 rested DON!! card to 1 of your Leader. Then, up to 1 of your opponent\'s Characters with a cost of 5 or less cannot be rested until the end of your opponent\'s next turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
              },
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'arlong-on-play-east-blue-leader-attach-don-and-restrict-rest',
            text: '[On Play] If your Leader has the "East Blue" type, give up to 1 rested DON!! card to 1 of your Leader. Then, up to 1 of your opponent\'s Characters with a cost of 5 or less cannot be rested until the end of your opponent\'s next turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
              },
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 1,
              },
            ],
          },
        },
      ],
    },
    // EB02-012 Gaimon
    // If you have a [Sarfunkel], this Character gains [Blocker].
    {
      cardId: 'EB02-012',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'gaimon-has-sarfunkel-gains-blocker',
            text: 'If you have a [Sarfunkel], this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Sarfunkel'] },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Gaimon'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // EB02-013 Carrot
    // [On Play] If you have 3 or more DON!! cards on your field, look at 7 cards from the top of your deck; reveal up to 1 [Zou] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Zou] from your hand.
    {
      cardId: 'EB02-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carrot-on-play-3-don-search-zou-and-play',
            text: '[On Play] If you have 3 or more DON!! cards on your field, look at 7 cards from the top of your deck; reveal up to 1 [Zou] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Zou] from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'self',
                value: 3,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 7,
                filter: { name: ['Zou'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
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
    // EB02-014 Sarfunkel
    // [On Play] Play up to 1 [Gaimon] from your hand.
    {
      cardId: 'EB02-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sarfunkel-on-play-play-gaimon',
            text: '[On Play] Play up to 1 [Gaimon] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Gaimon'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB02-015 Jewelry Bonney
    // [On Play] Up to 1 of your opponent's rested Characters will not become active in your opponent's next Refresh Phase. Then, set up to 1 of your DON!! cards as active at the end of this turn.
    {
      cardId: 'EB02-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-on-play-skip-refresh-and-active-don',
            text: "[On Play] Up to 1 of your opponent's rested Characters will not become active in your opponent's next Refresh Phase. Then, set up to 1 of your DON!! cards as active at the end of this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
              {
                type: 'scheduleActionsAtTurnEnd',
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
            ],
          },
        },
      ],
    },
    // EB02-016 Chopperman
    // Also treat this card's name as [Tony Tony.Chopper] according to the rules.
    // [On Play] Play up to 1 "Animal" type Character card with a cost of 3 or less from your hand.
    {
      cardId: 'EB02-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chopperman-on-play-play-animal-cost-3-or-less',
            text: '[On Play] Play up to 1 "Animal" type Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Animal'],
                    costMax: 3,
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
    // EB02-017 Nami
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card other than [Nami] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB02-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-017-on-play-search-straw-hat-crew',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card other than [Nami] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Straw Hat Crew'],
                  excludeName: ['Nami'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // EB02-018 Buggy
    // [On Play] If you have no other [Buggy] Characters, up to 1 of your Leader gains [Double Attack] during this turn.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'EB02-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buggy-on-play-no-other-buggy-leader-double-attack',
            text: '[On Play] If you have no other [Buggy] Characters, up to 1 of your Leader gains [Double Attack] during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Buggy'] },
                },
                value: 1,
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
            id: 'buggy-trigger-rest-cost-4-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB02-019 Roronoa Zoro
    // If your opponent has 2 or more Characters, this Character can attack Characters on the turn in which it is played.
    // [On Play] If your Leader has the "Straw Hat Crew" type, rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'EB02-019',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'roronoa-zoro-019-opponent-2-characters-rush',
            text: 'If your opponent has 2 or more Characters, this Character can attack Characters on the turn in which it is played.',
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Roronoa Zoro'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-019-on-play-rest-cost-4-or-less',
            text: '[On Play] If your Leader has the "Straw Hat Crew" type, rest up to 1 of your opponent\'s Characters with a cost of 4 or less.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB02-020 We Are!
    // [Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB02-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'we-are-main-search-cost-4-or-more',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: { costMin: 4 },
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
            id: 'we-are-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB02-020',
                effectId: 'we-are-main-search-cost-4-or-more',
              },
            ],
          },
        },
      ],
    },
    // EB02-021 Gum-Gum Giant Pistol
    // [Main] Up to 1 of your "Straw Hat Crew" type Characters gains +6000 power during this turn. Then, the selected Character will not become active in your next Refresh Phase.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'EB02-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-giant-pistol-main-plus-6000-skip-refresh',
            text: '[Main] Up to 1 of your "Straw Hat Crew" type Characters gains +6000 power during this turn. Then, the selected Character will not become active in your next Refresh Phase.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Straw Hat Crew'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 6000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Straw Hat Crew'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-giant-pistol-trigger-rest-cost-4-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB02-022 Usopp
    // [On Play] If you have 2 or less Characters with 5000 power or more, play up to 1 Character card with 6000 power or less and no base effect from your hand.
    {
      cardId: 'EB02-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopp-022-on-play-2-or-less-5000-power-play-no-base-effect',
            text: '[On Play] If you have 2 or less Characters with 5000 power or more, play up to 1 Character card with 6000 power or less and no base effect from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMin: 5000,
                  },
                },
                value: 2,
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
    // EB02-023 Crocodile
    // [Your Turn] [Once Per Turn] When your opponent's Character is returned to the owner's hand by your effect, look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'EB02-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-023-your-turn-on-bounce-arrange-top-3',
            text: "[Your Turn] [Once Per Turn] When your opponent's Character is returned to the owner's hand by your effect, look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.",
            trigger: { type: 'onCardRemovedByEffect', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventDestinationZoneIs', value: 'hand' },
            ],
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 3 }],
          },
        },
      ],
    },
    // EB02-024 Sogeking
    // Also treat this card's name as [Usopp] according to the rules.
    // [On Play] Draw 2 cards and place 2 cards from your hand at the bottom of your deck in any order. Then, return up to 1 Character with a cost of 1 or less to the owner's hand.
    {
      cardId: 'EB02-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sogeking-on-play-draw-2-bottom-2-bounce-cost-1-or-less',
            text: "[On Play] Draw 2 cards and place 2 cards from your hand at the bottom of your deck in any order. Then, return up to 1 Character with a cost of 1 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 1,
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
    // EB02-025 Donquixote Rosinante
    // [Activate: Main] You may rest 1 of your DON!! cards and this Character: If your Leader is [Donquixote Rosinante], look at 5 cards from the top of your deck; play up to 1 Character card with a cost of 2 or less rested. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB02-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-rosinante-activate-main-rest-don-and-self-play-cost-2',
            text: '[Activate: Main] You may rest 1 of your DON!! cards and this Character: If your Leader is [Donquixote Rosinante], look at 5 cards from the top of your deck; play up to 1 Character card with a cost of 2 or less rested. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Donquixote Rosinante'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Donquixote Rosinante',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  costMax: 2,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // EB02-026 Nefeltari Vivi
    // [On Play] If your Leader is multicolored and you have 5 or less cards in your hand, draw 2 cards.
    {
      cardId: 'EB02-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nefeltari-vivi-on-play-multicolor-leader-hand-5-draw-2',
            text: '[On Play] If your Leader is multicolored and you have 5 or less cards in your hand, draw 2 cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 5,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB02-027 Vista
    // [On Play] Place up to 1 of your opponent's Characters with 1000 power or less at the bottom of the owner's deck.
    {
      cardId: 'EB02-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vista-on-play-bottom-deck-power-1000-or-less',
            text: "[On Play] Place up to 1 of your opponent's Characters with 1000 power or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 1000,
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
    // EB02-028 Portgas.D.Ace
    // [On Play] If your Leader's type includes "Whitebeard Pirates", look at 5 cards from the top of your deck; reveal up to 1 Character card with a cost of 2 and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 Character card with a cost of 2 from your hand rested.
    {
      cardId: 'EB02-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-on-play-whitebeard-pirates-search-and-play-cost-2',
            text: '[On Play] If your Leader\'s type includes "Whitebeard Pirates", look at 5 cards from the top of your deck; reveal up to 1 Character card with a cost of 2 and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 Character card with a cost of 2 from your hand rested.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  costMin: 2,
                  costMax: 2,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 2,
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
    // EB02-030 And That's When Somebody Makes Fun of Their Friend's Dream!!!!
    // [Counter] If any of your Characters would be K.O.'d in battle during this turn, you may trash 1 card from your hand instead.
    // [Trigger] Draw 1 card.
    {
      cardId: 'EB02-030',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'and-that-s-when-somebody-makes-fun-of-their-friends-dream-counter',
            text: "[Counter] If any of your Characters would be K.O.'d in battle during this turn, you may trash 1 card from your hand instead.",
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [{ type: 'eventReasonIs', value: 'battle' }],
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
            id: 'and-that-s-when-somebody-makes-fun-of-their-friends-dream-trigger-draw',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB02-031 Hope
    // [Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB02-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hope-main-search-cost-4-or-more',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: { costMin: 4 },
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
            id: 'hope-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB02-031',
                effectId: 'hope-main-search-cost-4-or-more',
              },
            ],
          },
        },
      ],
    },
    // EB02-032 Iceburg
    // [On Play] If you have 3 or more DON!! cards on your field, look at 7 cards from the top of your deck; reveal up to 1 [Galley-La Company] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Galley-La Company] from your hand.
    {
      cardId: 'EB02-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'iceburg-on-play-3-don-search-galley-la-and-play',
            text: '[On Play] If you have 3 or more DON!! cards on your field, look at 7 cards from the top of your deck; reveal up to 1 [Galley-La Company] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Galley-La Company] from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'self',
                value: 3,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 7,
                filter: { trait: ['Galley-La Company'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Galley-La Company'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB02-033 Klabautermann
    // If you have [Merry Go] on your field, this Character gains [Blocker].
    {
      cardId: 'EB02-033',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'klabautermann-has-merry-go-gains-blocker',
            text: 'If you have [Merry Go] on your field, this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters', 'stage'],
                  filter: { name: ['Merry Go'] },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Klabautermann'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // EB02-035 Sanji & Pudding
    // [Your Turn] [Once Per Turn] When 2 or more DON!! cards on your field are returned to your DON!! deck, add up to 1 DON!! card from your DON!! deck and set it as active.
    // [On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card.
    {
      cardId: 'EB02-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-and-pudding-your-turn-on-don-returned-add-active-don',
            text: '[Your Turn] [Once Per Turn] When 2 or more DON!! cards on your field are returned to your DON!! deck, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sanji-and-pudding-on-play-don-less-equal-draw-1',
            text: "[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, draw 1 card.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 0,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB02-036 Nico Robin
    // [Blocker]
    // [On K.O.] DON!! 1: Look at 3 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB02-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-036-on-ko-don-1-search-straw-hat',
            text: '[On K.O.] DON!! 1: Look at 3 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onKo' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Straw Hat Crew'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // EB02-037 Franky
    // [On Play]/[When Attacking] If your Leader has the "Straw Hat Crew" type and the number of DON!! cards on your field is equal to or less than the number on your opponent's field, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'EB02-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'franky-037-on-play-don-less-equal-add-rested-don',
            text: '[On Play] If your Leader has the "Straw Hat Crew" type and the number of DON!! cards on your field is equal to or less than the number on your opponent\'s field, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 0,
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
            id: 'franky-037-when-attacking-don-less-equal-add-rested-don',
            text: '[When Attacking] If your Leader has the "Straw Hat Crew" type and the number of DON!! cards on your field is equal to or less than the number on your opponent\'s field, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 0,
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    // EB02-038 Magellan
    // [On Play] Play up to 1 "Impel Down" type Character card with a cost of 2 or less from your hand.
    {
      cardId: 'EB02-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'magellan-on-play-play-impel-down-cost-2-or-less',
            text: '[On Play] Play up to 1 "Impel Down" type Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Impel Down'],
                    costMax: 2,
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
    // EB02-039 GERMA 66
    // [Main] You may trash 1 "GERMA 66" type Character card with 4000 power or less from your hand: If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, play up to 1 Character card with 5000 to 7000 power and the same card name as the trashed card from your trash.
    {
      cardId: 'EB02-039',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'germa-66-main-trash-germa-play-same-name',
        },
      ],
    },
    // EB02-040 BRAND NEW WORLD
    // [Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB02-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brand-new-world-main-search-cost-4-or-more',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: { costMin: 4 },
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
            id: 'brand-new-world-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB02-040',
                effectId: 'brand-new-world-main-search-cost-4-or-more',
              },
            ],
          },
        },
      ],
    },
    // EB02-041 Merry Go (041)
    // [On Play] If your Leader has the "Straw Hat Crew" type, draw 1 card.
    // [Activate: Main] You may rest this Stage: If the number of DON!! cards on your field is equal to or less than the number on your opponent's field, up to 1 of your "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent's next turn.
    {
      cardId: 'EB02-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'merry-go-041-on-play-straw-hat-leader-draw-1',
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
        {
          kind: 'standard',
          effect: {
            id: 'merry-go-041-activate-main-don-less-equal-plus-cost',
            text: '[Activate: Main] You may rest this Stage: If the number of DON!! cards on your field is equal to or less than the number on your opponent\'s field, up to 1 of your "Straw Hat Crew" type Characters gains +2 cost until the end of your opponent\'s next turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Merry Go'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
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
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
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
    // EB02-044 Sengoku
    // [Blocker]
    // [On Play] Play up to 1 black "Navy" type Character card with a cost of 4 or less from your trash rested.
    {
      cardId: 'EB02-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sengoku-on-play-play-black-navy-from-trash-rested',
            text: '[On Play] Play up to 1 black "Navy" type Character card with a cost of 4 or less from your trash rested.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
                    trait: ['Navy'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // EB02-045 Trafalgar Law
    // [Blocker]
    // [On Play] You may place 2 cards from your trash at the bottom of your deck in any order: Choose one:
    // • Draw 1 card.
    // • If your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand.
    {
      cardId: 'EB02-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-045-on-play-place-2-trash-to-bottom-choose',
            text: '[On Play] You may place 2 cards from your trash at the bottom of your deck in any order: Choose one: \u2022 Draw 1 card. \u2022 If your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message:
                  'Choose one: \u2022 Draw 1 card. \u2022 If your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand.',
                choices: [
                  {
                    id: 'eb02-045-draw-1',
                    label: 'Draw 1 card',
                    actions: [{ type: 'draw', player: 'self', amount: 1 }],
                  },
                  {
                    id: 'eb02-045-opponent-trash',
                    label:
                      'If your opponent has 5 or more cards in their hand, your opponent trashes 1 card from their hand',
                    actions: [
                      {
                        type: 'ifConditionsMatch',
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
                        actions: [
                          {
                            type: 'trashFromHand',
                            selector: {
                              player: 'opponent',
                              chooser: 'opponent',
                              zones: ['hand'],
                              count: { kind: 'exact', value: 1 },
                            },
                          },
                        ],
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
    // EB02-046 Hildon
    // [On Play] Trash 2 cards from the top of your deck and give up to 1 of your opponent's Characters 1 cost during this turn.
    {
      cardId: 'EB02-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hildon-on-play-trash-2-deck-plus-cost',
            text: "[On Play] Trash 2 cards from the top of your deck and give up to 1 of your opponent's Characters 1 cost during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'trashFromDeck', player: 'self', amount: 2 },
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB02-047 Blueno
    // [Activate: Main] You may trash 1 card from your hand and trash this Character: Play up to 1 Character card with a type including "CP" and a cost of 5 or less other than [Blueno] from your trash.
    {
      cardId: 'EB02-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blueno-activate-main-trash-hand-and-self-play-cp-from-trash',
            text: '[Activate: Main] You may trash 1 card from your hand and trash this Character: Play up to 1 Character card with a type including "CP" and a cost of 5 or less other than [Blueno] from your trash.',
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
                  filter: { name: ['Blueno'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  traitIncludes: ['CP'],
                  costMax: 5,
                  excludeName: ['Blueno'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB02-048 Brook
    // [On Play] Add up to 1 [Laboon] from your trash to your hand.
    // [On K.O.] Play up to 1 [Laboon] with a cost of 4 or less from your hand.
    {
      cardId: 'EB02-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-048-on-play-recover-laboon',
            text: '[On Play] Add up to 1 [Laboon] from your trash to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { name: ['Laboon'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'brook-048-on-ko-play-laboon',
            text: '[On K.O.] Play up to 1 [Laboon] with a cost of 4 or less from your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Laboon'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB02-049 Monkey.D.Garp
    // [On Play] Give up to 2 rested DON!! cards to 1 of your Leader.
    // [Activate: Main] You may rest this Character: If your Leader is [Monkey.D.Garp], K.O. up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'EB02-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-on-play-attach-2-don-to-leader',
            text: '[On Play] Give up to 2 rested DON!! cards to 1 of your Leader.',
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
                amount: 2,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-activate-main-rest-ko-cost-1-or-less',
            text: "[Activate: Main] You may rest this Character: If your Leader is [Monkey.D.Garp], K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Garp'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Monkey.D.Garp',
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
                    costMax: 1,
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
    // EB02-050 Kokoro no Chizu
    // [Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB02-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kokoro-no-chizu-main-search-cost-4-or-more',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: { costMin: 4 },
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
            id: 'kokoro-no-chizu-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB02-050',
                effectId: 'kokoro-no-chizu-main-search-cost-4-or-more',
              },
            ],
          },
        },
      ],
    },
    // EB02-051 Three-Pace Hum Soul Notch Slash
    // [Main] Choose one:
    // • K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    // • Give up to 1 of your opponent's Characters 4 cost during this turn.
    {
      cardId: 'EB02-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'three-pace-hum-soul-notch-slash-main-choose',
            text: "[Main] Choose one: \u2022 K.O. up to 1 of your opponent's Characters with a cost of 2 or less. \u2022 Give up to 1 of your opponent's Characters 4 cost during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'chooseActionBranch',
                message:
                  "Choose one: \u2022 K.O. up to 1 of your opponent's Characters with a cost of 2 or less. \u2022 Give up to 1 of your opponent's Characters 4 cost during this turn.",
                choices: [
                  {
                    id: 'eb02-051-ko-cost-2-or-less',
                    label:
                      "K.O. up to 1 of your opponent's Characters with a cost of 2 or less",
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
                  {
                    id: 'eb02-051-give-4-cost',
                    label:
                      "Give up to 1 of your opponent's Characters 4 cost during this turn",
                    actions: [
                      {
                        type: 'modifyCost',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
                            cardCategory: ['Character'],
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                        amount: 4,
                        duration: { type: 'untilEndOfTurn' },
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
    // EB02-052 Enel
    // If your Leader has the "Sky Island" type, this Character gains [Rush].
    // [When Attacking] You may trash 1 card from your hand: If you have 1 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards. Then, this Character gains +1000 power during this turn.
    {
      cardId: 'EB02-052',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'enel-sky-island-leader-gains-rush',
            text: 'If your Leader has the "Sky Island" type, this Character gains [Rush].',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Sky Island',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Enel'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'enel-when-attacking-trash-1-life-1-add-to-life-and-plus-1000',
            text: '[When Attacking] You may trash 1 card from your hand: If you have 1 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards. Then, this Character gains +1000 power during this turn.',
            trigger: { type: 'whenAttacking', optional: true },
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
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 1,
              },
            ],
            actions: [
              {
                type: 'addToLife',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Enel'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB02-053 Myskina Olga
    // [On Play]/[On K.O.] Look at up to 1 card from the top of your or your opponent's Life cards and place it at the top or bottom of the Life cards.
    {
      cardId: 'EB02-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'myskina-olga-on-play-look-at-life',
            text: "[On Play] Look at up to 1 card from the top of your or your opponent's Life cards and place it at the top or bottom of the Life cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose whose life to look at',
                choices: [
                  {
                    id: 'eb02-053-on-play-own-life',
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
                    id: 'eb02-053-on-play-opponent-life',
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
        {
          kind: 'standard',
          effect: {
            id: 'myskina-olga-on-ko-look-at-life',
            text: "[On K.O.] Look at up to 1 card from the top of your or your opponent's Life cards and place it at the top or bottom of the Life cards.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose whose life to look at',
                choices: [
                  {
                    id: 'eb02-053-on-ko-own-life',
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
                    id: 'eb02-053-on-ko-opponent-life',
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
    // EB02-054 Sanji
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If you have 2 or less Life cards, draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'EB02-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-054-on-play-life-2-or-less-draw-2-trash-1',
            text: '[On Play] If you have 2 or less Life cards, draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
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
    // EB02-055 Jinbe
    // [Trigger] If your Leader has the "Fish-Man" or "Merfolk" type and you have 2 or less Life cards, play this card.
    {
      cardId: 'EB02-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-055-trigger-fish-man-leader-play',
            text: '[Trigger] If your Leader has the "Fish-Man" type and you have 2 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
              },
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Jinbe'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-055-trigger-merfolk-leader-play',
            text: '[Trigger] If your Leader has the "Merfolk" type and you have 2 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Merfolk',
              },
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Jinbe'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB02-056 Vegapunk
    // [Blocker][On Play] Look at 5 cards from the top of your deck; play up to 1 "Scientist" type Character card with a cost of 5 or less other than [Vegapunk]. Then, place the rest at the bottom of your deck in any order and if your opponent has 2 or less Characters, trash 1 card from your hand.[Trigger] Draw 1 card.
    {
      cardId: 'EB02-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vegapunk-on-play-search-scientist-play-and-conditional-trash',
            text: '[On Play] Look at 5 cards from the top of your deck; play up to 1 "Scientist" type Character card with a cost of 5 or less other than [Vegapunk]. Then, place the rest at the bottom of your deck in any order and if your opponent has 2 or less Characters, trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Scientist'],
                  costMax: 5,
                  excludeName: ['Vegapunk'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'targetCountAtMost',
                    selector: {
                      player: 'opponent',
                      zones: ['characters'],
                      filter: { cardCategory: ['Character'] },
                    },
                    value: 2,
                  },
                ],
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'vegapunk-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB02-057 Mad Treasure
    // [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up.
    {
      cardId: 'EB02-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mad-treasure-when-attacking-life-to-hand-opponent-char-to-life',
            text: "[When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up.",
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
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
                    costMax: 3,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                faceDown: false,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // EB02-058 UUUUUS!
    // [Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB02-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uuuuus-main-search-cost-4-or-more',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 4 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: { costMin: 4 },
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
            id: 'uuuuus-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB02-058',
                effectId: 'uuuuus-main-search-cost-4-or-more',
              },
            ],
          },
        },
      ],
    },
    // EB02-059 Without Your Help I Can't Become the King of the Pirates!!!!
    // [Counter] Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, if you have 1 or less Life cards, play up to 1 of your yellow "Straw Hat Crew" type Character cards or [Sanji] with a cost of 5 or less from your hand.
    {
      cardId: 'EB02-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'without-your-help-counter-plus-1000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +1000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'without-your-help-life-1-or-less-play-yellow-straw-hat',
            text: '[Counter] Then, if you have 1 or less Life cards, play up to 1 of your yellow "Straw Hat Crew" type Character cards with a cost of 5 or less from your hand.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 1,
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
                    color: ['Yellow'],
                    trait: ['Straw Hat Crew'],
                    costMax: 5,
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
            id: 'without-your-help-life-1-or-less-play-sanji',
            text: '[Counter] Then, if you have 1 or less Life cards, play up to 1 [Sanji] with a cost of 5 or less from your hand.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 1,
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
                    name: ['Sanji'],
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
    // EB02-060 Merry Go (060)
    // [Activate: Main] You may rest this Stage and turn 1 card from the top of your Life cards face-up: Up to 1 of your "Straw Hat Crew" type Characters gains +1000 power until the end of your opponent's next turn.
    {
      cardId: 'EB02-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'merry-go-060-activate-main-rest-and-reveal-life-plus-1000',
            text: '[Activate: Main] You may rest this Stage and turn 1 card from the top of your Life cards face-up: Up to 1 of your "Straw Hat Crew" type Characters gains +1000 power until the end of your opponent\'s next turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Merry Go'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: false,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Straw Hat Crew'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB02-061 Monkey.D.Luffy (061)
    // If your Leader is multicolored and your opponent has 5 or more DON!! cards on their field, this Character gains [Rush].
    // [When Attacking] [Once Per Turn] You may return 2 of your active DON!! cards to your DON!! deck: Set this Character as active. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'EB02-061',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'monkey-d-luffy-061-multicolor-leader-opponent-5-don-rush',
            text: 'If your Leader is multicolored and your opponent has 5 or more DON!! cards on their field, this Character gains [Rush].',
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
            id: 'monkey-d-luffy-061-when-attacking-return-2-don-restand-life-to-hand',
            text: '[When Attacking] [Once Per Turn] You may return 2 of your active DON!! cards to your DON!! deck: Set this Character as active. Then, add 1 card from the top of your Life cards to your hand.',
            trigger: {
              type: 'whenAttacking',
              oncePerTurn: true,
              optional: true,
            },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                  filter: { zonePosition: 'top' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
  ],
};
