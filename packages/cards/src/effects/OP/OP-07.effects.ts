import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const op07EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-07',
  cards: [
    {
      cardId: 'OP07-015',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'monkey-d-dragon-015-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Monkey.D.Dragon 015'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-dragon-015-on-play-attach-don',
            text: '[On Play] Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
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
      cardId: 'OP07-107',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'franky-107-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'franky-107-trigger-play-if-life-1',
            text: 'If you have 1 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-045-on-play-seven-warlords-cost-4',
            text: '[On Play] Play up to 1 [The Seven Warlords of the Sea] type Character card with a cost of 4 or less other than [Jinbe] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['The Seven Warlords of the Sea'],
                    costMax: 4,
                    excludeName: ['Jinbe 045'],
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
    {
      cardId: 'OP07-064',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sanji-064-don-at-least-2-less-minus-3-cost',
            text: 'If the number of DON!! cards on your field is at least 2 less than the number on your opponent’s field, give this card in your hand -3 cost.',
            conditions: [
              {
                type: 'playerHasAtLeastTotalDonLessThan',
                player: 'self',
                thanPlayer: 'opponent',
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['hand'],
              },
              cost: -3,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP07-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-109-activate-main-trash-self-ko-draw',
            text: '[Activate: Main] You may trash this Character: If you have 2 or less Life cards, K.O. up to 1 of your opponent’s Characters with a cost of 4 or less. Then, draw 1 card.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
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
              { type: 'draw', player: 'self', amount: 1 },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-109-trigger-ko-cost-4',
            text: '[Trigger] K.O. up to 1 of your opponent’s Characters with a cost of 4 or less.',
            trigger: { type: 'trigger' },
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
    {
      cardId: 'OP07-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'claim-the-one-piece-main-search-animal-kingdom-big-mom',
            text: '[Main] If your Leader has the [Animal Kingdom Pirates] or [Big Mom Pirates] type, look at 5 cards from the top of your deck; reveal up to 1 [Animal Kingdom Pirates] or [Big Mom Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Animal Kingdom Pirates', 'Big Mom Pirates'],
                },
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
            id: 'claim-the-one-piece-trigger-activate-main',
            text: '[Trigger] Activate this card’s [Main] effect.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP07-077',
                effectId:
                  'claim-the-one-piece-main-search-animal-kingdom-big-mom',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'porche-on-play-don-1-search-foxy-pirates-play-purple-4000',
            text: '[On Play] DON!! -1: Look at 5 cards from the top of your deck; reveal up to 1 [Foxy Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 purple Character card with 4000 power or less from your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Foxy Pirates'] },
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
                    color: ['Purple'],
                    powerMax: 4000,
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
    {
      cardId: 'OP07-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-051-on-play-cannot-attack-bottom-cost-1',
            text: '[On Play] Up to 1 of your opponent’s Characters other than [Monkey.D.Luffy] cannot attack until the end of your opponent’s next turn. Then, place up to 1 Character with a cost of 1 or less at the bottom of the owner’s deck.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    excludeName: ['Monkey.D.Luffy'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
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
    {
      cardId: 'OP07-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-026-on-play-skip-refresh-rested',
            text: '[On Play] Up to 1 of your opponent’s rested Character or DON!! cards will not become active in your opponent’s next Refresh Phase.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters', 'cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sengoku-on-play-search-seven-warlords',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {The Seven Warlords of the Sea} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['The Seven Warlords of the Sea'] },
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
    {
      cardId: 'OP07-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tonny-chopper-066-on-play-don-less-equal-add-don-rested',
            text: '[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent’s field, add up to 1 DON!! card from your DON!! deck and rest it.',
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
      ],
    },
    {
      cardId: 'OP07-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blaze-slice-main-plus-1000',
            text: '[Main] Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'activateMain' },
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
        {
          kind: 'standard',
          effect: {
            id: 'blaze-slice-main-rest-if-opp-life-2',
            text: '[Main] If your opponent has 2 or less Life cards, rest up to 1 of your opponent’s Characters with a cost of 4 or less.',
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 2 },
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
        {
          kind: 'standard',
          effect: {
            id: 'blaze-slice-counter-plus-1000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
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
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'blaze-slice-counter-rest-if-opp-life-2',
            text: '[Counter] If your opponent has 2 or less Life cards, rest up to 1 of your opponent’s Characters with a cost of 4 or less.',
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 2 },
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
        {
          kind: 'standard',
          effect: {
            id: 'blaze-slice-trigger-rest-cost-4-or-less',
            text: '[Trigger] Rest up to 1 of your opponent’s Characters with a cost of 4 or less.',
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
    {
      cardId: 'OP07-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-047-activate-main-bounce-self-bottom-opp-hand',
            text: '[Activate: Main] You may return this Character to the owner’s hand: If your opponent has 6 or more cards in their hand, your opponent places 1 card from their hand at the bottom of their deck.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['hand'] },
                value: 6,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                  chooser: 'opponent',
                },
                destinationPlayer: 'opponent',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'stussy-on-play-trash-1-char-ko-1',
            text: '[On Play] You may trash 1 of your Characters: K.O. up to 1 of your opponent’s Characters.',
            trigger: { type: 'onPlay', optional: true },
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
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
    {
      cardId: 'OP07-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lilith-on-play-search-egghead',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Egghead] type card other than [Lilith] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Egghead'], excludeName: ['Lilith'] },
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
            id: 'lilith-trigger-vegapunk-play',
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
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-029',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'basil-hawkins-029-supernovas-blocker',
            text: 'If your Leader has the [Supernovas] type, this Character gains [Blocker].',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Basil Hawkins 029'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
        { kind: 'special-ref', specialHandlerId: 'op07-029-special' },
      ],
    },
    {
      cardId: 'OP07-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-119-on-play-deck-to-life',
            text: '[On Play] Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-119-rush-if-life-2',
            text: '[On Play] If you have 2 or less Life cards, this Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-040-on-play-don-1-bounce-cost-2',
            text: '[On Play] (1) (You may rest the specified number of DON!! cards in your cost area.): Return up to 1 Character with a cost of 2 or less to the owner’s hand.',
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
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
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
    {
      cardId: 'OP07-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tempest-kick-main-draw-1',
            text: '[Main] Draw 1 card.',
            trigger: { type: 'activateMain' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'tempest-kick-main-minus-cost-if-10-trash',
            text: 'If you have 10 or more cards in your trash, give up to 1 of your opponent’s Characters -3 cost during this turn.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -3,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'tempest-kick-trigger-ko-cost-3-or-less',
            text: '[Trigger] K.O. up to 1 of your opponent’s Characters with a cost of 3 or less.',
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
    {
      cardId: 'OP07-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sabo-118-on-play-trash-1-ko-cost-5-and-cost-3',
            text: '[On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent’s Characters with a cost of 5 or less and up to 1 of your opponent’s Characters with a cost of 3 or less.',
            trigger: { type: 'onPlay', optional: true },
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
    {
      cardId: 'OP07-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'perfume-femur-main-plus-2000-seven-warlords',
            text: '[Main] Select up to 1 of your [The Seven Warlords of the Sea] type Leader or Character cards and that card gains +2000 power during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['The Seven Warlords of the Sea'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'perfume-femur-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marguerite-on-play-draw-1',
            text: '[On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gina-on-play-foxy-don-less-equal-add-don-active',
            text: '[On Play] If your Leader has the [Foxy Pirates] type and the number of DON!! cards on your field is equal to or less than the number on your opponent’s field, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Foxy Pirates',
              },
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'urouge-end-of-turn-restand-don',
            text: '[End of Your Turn] Set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
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
    {
      cardId: 'OP07-091',
      effects: [{ kind: 'special-ref', specialHandlerId: 'op07-091-special' }],
    },
    {
      cardId: 'OP07-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'snake-dance-counter-plus-4000-bounce-self',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, return up to 1 of your Characters to the owner’s hand.',
            trigger: { type: 'activateCounter' },
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
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
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
            id: 'snake-dance-trigger-bounce-self-bounce-opp',
            text: '[Trigger] You may return 1 of your Characters to the owner’s hand: Return up to 1 of your opponent’s Characters with a cost of 5 or less to the owner’s hand.',
            trigger: { type: 'trigger', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
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
    {
      cardId: 'OP07-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'otama-on-play-search-green-land-of-wano',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 green [Land of Wano] type card other than [Otama] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  color: ['Green'],
                  trait: ['Land of Wano'],
                  excludeName: ['Otama'],
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
    {
      cardId: 'OP07-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-053-on-play-draw-2-arrange-2',
            text: '[On Play] Draw 2 cards and place 2 cards from your hand at the top or bottom of your deck in any order.',
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
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gloriosa-on-play-search-amazon-lily-kuja',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Amazon Lily] or [Kuja Pirates] type card other than [Gloriosa (Grandma Nyon)] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Amazon Lily', 'Kuja Pirates'],
                  excludeName: ['Gloriosa (Grandma Nyon)'],
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
    {
      cardId: 'OP07-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shaka-trigger-vegapunk-play',
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
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-trigger-egghead-draw-2',
            text: '[Trigger] If your Leader has the {Egghead} type, draw 2 cards.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Egghead',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'asura-main-plus-3000',
            text: '[Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn.',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'asura-main-rest-self-cost-3-rest-opp-cost-5',
            text: 'You may rest 1 of your Characters with a cost of 3 or more. If you do, rest up to 1 of your opponent’s Characters with a cost of 5 or less.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 3,
                    rested: false,
                  },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'asura-trigger-rest-cost-4-or-less',
            text: '[Trigger] Rest up to 1 of your opponent’s Characters with a cost of 4 or less.',
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
    {
      cardId: 'OP07-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaku-on-play-bottom-2-cp-minus-cost-3',
            text: '[On Play] You may place 2 cards with a type including “CP” from your trash at the bottom of your deck in any order: Give up to 1 of your opponent’s Characters -3 cost during this turn.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['CP'] },
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -3,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 're-quasar-helllp-counter-life-2-plus-3000',
            text: '[Counter] If you have 2 or less Life cards, up to 1 of your Leader or Character cards gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
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
            id: 're-quasar-helllp-trigger-play-egghead-trash',
            text: '[Trigger] Play up to 1 of your [Egghead] type Character cards with a cost of 5 or less from your trash.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Egghead'],
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
    {
      cardId: 'OP07-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baccarat-on-attacked-trash-1-plus-2000',
            text: '[On Your Opponent’s Attack][Once Per Turn] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +2000 power during this battle.',
            trigger: { type: 'onAttacked', oncePerTurn: true, optional: true },
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
    {
      cardId: 'OP07-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edison-on-play-life-2-or-less-draw-2-trash-2',
            text: '[On Play] If you have 2 or less Life cards, draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'edison-trigger-vegapunk-play',
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
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brilliant-mind-main-search-egghead',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 [Egghead] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Egghead'] },
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
            id: 'brilliant-mind-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-098',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'atlas-less-life-cannot-be-koed-in-battle',
            text: "If you have less Life cards than your opponent, this Character cannot be K.O.'d in battle.",
            conditions: [
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Atlas'] },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'atlas-trigger-vegapunk-play',
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
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-sanji-on-play-don-1-vinsmoke-family-draw',
            text: '[On Play] DON!! -1: If your Leader has the [The Vinsmoke Family] type, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'The Vinsmoke Family',
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-sandersonia-on-play-2-amazon-or-kuja-bounce',
            text: '[On Play] If you have 2 or more [Amazon Lily] or [Kuja Pirates] type Characters on your field, return up to 1 of your opponent’s Characters with a cost of 3 or less to the owner’s hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Amazon Lily', 'Kuja Pirates'],
                  },
                },
                value: 2,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
    {
      cardId: 'OP07-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartolomeo-your-turn-on-effect-rest-draw-trash',
            text: '[Your Turn] [Once Per Turn] If a Character is rested by your effect, draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
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
    {
      cardId: 'OP07-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pythagoras-on-ko-life-2-or-less-play-egghead-rested',
            text: '[On K.O.] If you have 2 or less Life cards, play up to 1 {Egghead} type Character card with a cost of 4 or less from your trash rested.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Egghead'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'pythagoras-trigger-vegapunk-play',
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
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-019-on-attacked-don-1-rest-leader-or-char',
            text: '[On Your Opponent’s Attack] [Once Per Turn] (1) (You may rest the specified number of DON!! cards in your cost area.): Rest up to 1 of your opponent’s Leader or Character cards.',
            trigger: { type: 'onAttacked', oncePerTurn: true },
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
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-071',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'foxy-071-opponent-turn-minus-1000-all',
            text: '[Opponent’s Turn] If your Leader has the [Foxy Pirates] type, give all of your opponent’s Characters -1000 power.',
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Foxy Pirates',
              },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              power: -1000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'foxy-071-activate-main-add-don-rested',
            text: '[Activate: Main] [Once Per Turn] Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'slow-slow-beam-sword-counter-don-1-plus-2000-rest',
            text: '[Counter] DON!! -1: Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, rest up to 1 of your opponent’s Characters.',
            trigger: { type: 'activateCounter' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'slow-slow-beam-sword-trigger-add-don-active',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-032',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'fisher-tiger-can-attack-characters-on-turn-played',
            text: 'This Character can attack Characters on the turn in which it is played.',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Fisher Tiger'] },
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'fisher-tiger-on-play-rest-cost-6-or-less',
            text: '[On Play] If your Leader has the [Fish-Man] or [Merfolk] type, rest up to 1 of your opponent’s Characters with a cost of 6 or less.',
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
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-033',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'monkey-d-luffy-033-protect-cost-3-or-less',
            text: "If you have 3 or more Characters, your Characters with a cost of 3 or less other than [Monkey.D.Luffy] cannot be K.O.'d by your opponent's effects.",
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 3,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  costMax: 3,
                  excludeName: ['Monkey.D.Luffy 033'],
                },
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP07-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lucy-when-attacking-life-to-hand-rest-char',
            text: '[When Attacking] [Once Per Turn] You may add 1 card from the top or bottom of your Life cards to your hand: You may rest up to 1 of your opponent’s Characters with a cost of 4 or less.',
            trigger: {
              type: 'whenAttacking',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'topOrBottom' },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
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
        {
          kind: 'standard',
          effect: {
            id: 'lucy-when-attacking-add-deck-to-life',
            text: '[When Attacking] If you have 1 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
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
    {
      cardId: 'OP07-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'more-pizza-main-search-supernovas',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 [Supernovas] type card other than [More Pizza!!] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Supernovas'],
                  excludeName: ['More Pizza!!'],
                },
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
            id: 'more-pizza-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-113-trigger-egghead-rest',
            text: '[Trigger] If your Leader has the [Egghead] type, rest up to 1 of your opponent’s Leader or Character cards.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Egghead',
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rob-lucci-079-when-attacking-trash-2-from-deck-minus-cost',
            text: '[When Attacking] You may trash 2 cards from the top of your deck: Give up to 1 of your opponent’s Characters -1 cost during this turn.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [{ type: 'trashFromDeck', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopp-trigger-plus-2000-egghead',
            text: '[Trigger] Up to 1 of your {Egghead} type Leader or Character cards gains +2000 power until the end of your next turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Egghead'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carina-on-play-minus-2000',
            text: '[On Play] Give up to 1 of your opponent’s Characters -2000 power during this turn.',
            trigger: { type: 'onPlay' },
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
    {
      cardId: 'OP07-097',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'vegapunk-cannot-attack',
            text: 'This Leader cannot attack.',
            modifier: {
              selector: { player: 'self', zones: ['leader'] },
              keywords: ['cannotAttack'],
            },
          },
        },
        { kind: 'special-ref', specialHandlerId: 'op07-097-special' },
      ],
    },
    {
      cardId: 'OP07-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-038-your-turn-on-remove-draw',
            text: '[Your Turn] [Once Per Turn] This effect can be activated when a Character is removed from the field by your effect. If you have 5 or less cards in your hand, draw 1 card.',
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 5,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rob-lucci-093-on-play-bottom-3-trash-opp-bottom',
            text: '[On Play] You may place 3 cards from your trash at the bottom of your deck in any order: Your opponent trashes 1 card from their hand. Then, you may place up to 1 card from your opponent’s trash at the bottom of their deck.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 3 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                  chooser: 'opponent',
                },
                destinationPlayer: 'opponent',
                destinationZone: 'trash',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['trash'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tonny-chopper-103-trigger-egghead-blocker-add',
            text: '[Trigger] Up to 1 of your {Egghead} type Characters gains [Blocker] during this turn. Then, add this card to your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Egghead'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['mustBeAttackTarget'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ain-on-play-set-power-0',
            text: '[On Play] Set the power of up to 1 of your opponent’s Characters to 0 during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 0,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-073-activate-main-don-3-restand',
            text: '[Activate: Main][Once Per Turn] DON!! -3: If your opponent has 3 or more Characters, set this Character as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 3,
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 3 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-activate-main-don-2-reveal-play',
            text: '[Activate:Main] [Once Per Turn] (2): Reveal 1 card from the top of your deck. If that card is a [The Seven Warlords of the Sea] type Character card with a cost of 4 or less, you may play that card rested. Then, place the rest at the bottom of your deck.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: {
                  cardCategory: ['Character'],
                  trait: ['The Seven Warlords of the Sea'],
                  costMax: 4,
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
      cardId: 'OP07-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'slave-arrow-counter-bounce-self-cost-2-plus-4000',
            text: '[Counter] You may return 1 of your Characters with a cost of 2 or more to the owner’s hand: Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 2 },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
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
            id: 'slave-arrow-trigger-draw-2-bottom-2',
            text: '[Trigger] Draw 2 cards and place 2 cards from your hand at the bottom of your deck in any order.',
            trigger: { type: 'trigger' },
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
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'foxy-059-when-attacking-don-3-skip-refresh',
            text: '[When Attacking] DON!! 3: If you have 3 or more “Foxy Pirates” type Characters, select your opponent’s rested Leader and up to 1 Character card. The selected cards will not become active in your opponent’s next Refresh Phase.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Foxy Pirates'],
                  },
                },
                value: 3,
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 3 }],
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['leader'],
                  filter: { rested: true },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
              },
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
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'york-on-play-life-to-hand-ko-cost-2',
            text: '[On Play] You may add 1 card from the top or bottom of your Life cards to your hand: K.O. up to 1 of your opponent’s Characters with a cost of 2 or less.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                  filter: { zonePosition: 'topOrBottom' },
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
                  filter: { cardCategory: ['Character'], costMax: 2 },
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
            id: 'york-trigger-vegapunk-play',
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
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-dragon-001-activate-main-attach-don',
            text: '[Activate: Main] [Once Per Turn] Give up to 2 total of your currently given DON!! cards to 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                rested: false,
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'slow-slow-beam-counter-don-1-minus-2000-leader-char',
            text: '[Counter] DON!! -1: Give up to 1 each of your opponent’s Leader and Character cards -2000 power during this turn.',
            trigger: { type: 'activateCounter' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
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
    {
      cardId: 'OP07-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'itomimizu-activate-main-foxy-pirates-add-don-rested',
            text: '[Activate: Main][Once Per Turn] If your Leader has the [Foxy Pirates] type and you have no other [Itomimizu], add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Foxy Pirates',
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Itomimizu'] },
                },
                value: 1,
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-weevil-when-attacking-don-1-arrange-3',
            text: '[DON!! x1] [When Attacking] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 3 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-102-trigger-bounce-opp-add-self',
            text: '[Trigger] Return up to 1 of your opponent’s Characters with a cost of 4 or less to the owner’s hand and add this card to your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'megaton-nine-tails-main-don-less-equal-restand-foxy',
            text: '[Main] If the number of DON!! cards on your field is equal to or less than the number on your opponent’s field, set up to 1 of your [Foxy] cards as active.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters', 'stage'],
                  filter: { name: ['Foxy'], rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'megaton-nine-tails-trigger-add-don-active',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-reiju-062-on-play-don-less-equal-bounce',
            text: '[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent’s field, return up to 1 of your [The Vinsmoke Family] type Characters with a cost of 1 to the owner’s hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['The Vinsmoke Family'],
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
    {
      cardId: 'OP07-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'curly-dadan-on-play-trash-1-search-power-2000-or-less',
            text: '[On Play] You may trash 1 card from your hand: Look at 5 cards from the top of your deck; reveal up to 1 Character card with 2000 power or less and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay', optional: true },
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
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { cardCategory: ['Character'], powerMax: 2000 },
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
    {
      cardId: 'OP07-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-034-when-attacking-3-chars-plus-2000',
            text: '[When Attacking] If you have 3 or more Characters, this Character gains +2000 power during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 3,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'capote-on-play-don-1-foxy-cannot-attack',
            text: '[On Play] DON!! -1: If your Leader has the [Foxy Pirates] type, up to 1 of your opponent’s Characters with a cost of 6 or less cannot attack until the end of your opponent’s next turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Foxy Pirates',
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
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
    {
      cardId: 'OP07-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dracule-mihawk-on-play-draw-1',
            text: '[On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    {
      cardId: 'OP07-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'galaxy-wink-main-plus-2000-revolutionary-minus-1000',
            text: '[Main] Up to 1 of your [Revolutionary Army] type Characters gains +2000 power during this turn. Then, give up to 1 of your opponent’s Characters -1000 power during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
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
        {
          kind: 'standard',
          effect: {
            id: 'galaxy-wink-trigger-activate-main',
            text: '[Trigger] Activate this card’s [Main] effect.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP07-016',
                effectId: 'galaxy-wink-main-plus-2000-revolutionary-minus-1000',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'captain-john-on-play-trash-2-deck-minus-cost-1',
            text: '[On Play] Trash 2 cards from the top of your deck and give up to 1 of your opponent’s Characters -1 cost during this turn.',
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
                amount: -1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gecko-moria-083-activate-main-bottom-4-thriller-banish-plus-1000',
            text: '[Activate: Main] You may place 4 [Thriller Bark Pirates] type cards from your trash at the bottom of your deck in any order: This Character gains [Banish] and +1000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['Thriller Bark Pirates'] },
                  count: { kind: 'exact', value: 4 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buckin-on-play-edward-weevil-rested',
            text: '[On Play] Play up to 1 [Edward Weevil] with a cost of 4 or less from your hand rested.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Edward Weevil'], costMax: 4 },
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
    {
      cardId: 'OP07-081',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kalifa-don-1-your-turn-minus-cost-all',
            text: '[DON!! x1] [Your Turn] Give all of your opponent’s Characters -1 cost.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              cost: -1,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP07-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'outlook-iii-activate-main-trash-self-minus-2000-up-to-2',
            text: '[Activate:Main] You may trash this Character: Give up to 2 of your opponent’s Characters -2000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 2 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'big-bun-on-play-don-less-equal-play-foxy-pirates',
            text: '[On Play] If the number of DON!! cards on your field is equal to or less than the number on your opponent’s field, play up to 1 [Foxy Pirates] type card with a cost of 4 or less from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Foxy Pirates'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hattori-on-play-rob-lucci-plus-2000',
            text: '[Your Turn] [On Play] Up to 1 of your [Rob Lucci] cards gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Rob Lucci'] },
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
    {
      cardId: 'OP07-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'masked-deuce-on-play-search-portgas-d-ace-or-red-event',
            text: '[On Play] If your Leader is [Portgas.D.Ace], look at 5 cards from the top of your deck; reveal up to 1 [Portgas.D.Ace] or red Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Portgas.D.Ace',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { name: ['Portgas.D.Ace'] },
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
    {
      cardId: 'OP07-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hamburg-when-attacking-don-1-don-less-equal-add-don-rested',
            text: '[DON!! x1] [When Attacking] If the number of DON!! cards on your field is equal to or less than the number on your opponent’s field, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
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
    {
      cardId: 'OP07-069',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'pickles-don-less-equal-protect-foxy-pirates',
            text: 'If the number of DON!! cards on your field is equal to or less than the number on your opponent’s field, your [Foxy Pirates] type Characters other than [Pickles] cannot be K.O.’d by your opponent’s effects.',
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Foxy Pirates'],
                  excludeName: ['Pickles'],
                },
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP07-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monda-activate-main-trash-self-foxy-pirates-add-don-rested',
            text: '[Activate: Main] You may trash this Character: If your Leader has the [Foxy Pirates] type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Foxy Pirates',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'keep-out-counter-plus-2000-revolutionary',
            text: '[Counter] Up to 1 of your [Revolutionary Army] type Characters gains +2000 power until the end of your next turn.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'keep-out-trigger-activate-counter',
            text: '[Trigger] Activate this card’s [Counter] effect.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP07-018',
                effectId: 'keep-out-counter-plus-2000-revolutionary',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'aladine-on-ko-play-fish-man-or-merfolk',
            text: '[On K.O.] If your Leader has the [Fish-Man] type, play up to 1 [Fish-Man] or [Merfolk] type Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
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
                    trait: ['Fish-Man', 'Merfolk'],
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
    {
      cardId: 'OP07-030',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'pappag-camie-blocker',
            text: 'If you have a [Camie] Character, this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Camie'] },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Pappag'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    {
      cardId: 'OP07-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'salome-on-play-boa-hancock-plus-2000',
            text: '[Your Turn] [On Play] Up to 1 of your [Boa Hancock] cards gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Boa Hancock'] },
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
    {
      cardId: 'OP07-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-marigold-on-play-2-amazon-or-kuja-bottom-cost-2',
            text: '[On Play] If you have 2 or more [Amazon Lily] or [Kuja Pirates] type Characters on your field, place up to 1 Character with a cost of 2 or less at the bottom of the owner’s deck.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Amazon Lily', 'Kuja Pirates'],
                  },
                },
                value: 2,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
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
    {
      cardId: 'OP07-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dragon-breath-main-ko-3000-or-less-and-stage-cost-1',
            text: '[Main] K.O. up to 1 of your opponent’s Characters with 3000 power or less and up to 1 of your opponent’s Stages with a cost of 1 or less.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 3000 },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['stage'],
                  filter: { cardCategory: ['Stage'], costMax: 1 },
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
            id: 'dragon-breath-trigger-activate-main',
            text: '[Trigger] Activate this card’s [Main] effect.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP07-017',
                effectId: 'dragon-breath-main-ko-3000-or-less-and-stage-cost-1',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'karmic-punishment-counter-plus-2000',
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
            id: 'karmic-punishment-counter-additional-1000-if-3-chars',
            text: 'Then, if you have 3 or more Characters, that card gains an additional +1000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 3,
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
                amount: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'karmic-punishment-trigger-ko-rested-cost-4-or-less',
            text: '[Trigger] K.O. up to 1 of your opponent’s rested Characters with a cost of 4 or less.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
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
    {
      cardId: 'OP07-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shave-counter-plus-2000',
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
            id: 'shave-counter-bounce-cp-if-10-trash',
            text: 'Then, if you have 10 or more cards in your trash, return up to 1 of your Characters with a type including “CP” to the owner’s hand.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['CP'] },
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
            id: 'shave-trigger-bounce-1',
            text: '[Trigger] Return up to 1 of your Characters to the owner’s hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
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
    {
      cardId: 'OP07-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'morgans-on-play-opp-trash-reveal-draw',
            text: '[On Play] Your opponent trashes 1 card from their hand and reveals their hand. Then, your opponent draws 1 card.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                  chooser: 'opponent',
                },
                destinationPlayer: 'opponent',
                destinationZone: 'trash',
              },
              { type: 'reveal', player: 'opponent', zone: 'hand', amount: 99 },
              { type: 'draw', player: 'opponent', amount: 1 },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'moda-on-play-portgas-d-ace-plus-2000',
            text: '[Your Turn][On Play] Up to 1 of your [Portgas.D.Ace] cards gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Portgas.D.Ace'] },
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
    {
      cardId: 'OP07-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'joseph-on-play-bottom-2-cp-ko-cost-1-or-less',
            text: '[On Play] You may place 2 cards with a type including “CP” from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent’s Characters with a cost of 1 or less.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['CP'] },
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
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
    {
      cardId: 'OP07-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'iron-body-counter-plus-4000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
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
            id: 'iron-body-counter-additional-2000-if-10-trash',
            text: 'Then, if you have 10 or more cards in your trash, that card gains an additional +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
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
        {
          kind: 'standard',
          effect: {
            id: 'iron-body-trigger-plus-1000',
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
    {
      cardId: 'OP07-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bluejam-when-attacking-don-1-ko-2000-or-less',
            text: '[DON!! x1][When Attacking] K.O. up to 1 of your opponent’s Characters with 2000 power or less.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
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
    {
      cardId: 'OP07-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fuza-when-attacking-don-1-life-1-ko-cost-3',
            text: '[DON!! x1] [When Attacking] If you have 1 or less Life cards, K.O. up to 1 of your opponent’s Characters with a cost of 3 or less.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
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
      ],
    },
    {
      cardId: 'OP07-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spandam-on-play-trash-2-deck-minus-cost-2',
            text: '[On Play] Trash 2 cards from the top of your deck and give up to 1 of your opponent’s Characters -2 cost during this turn.',
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
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-023',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'caribou-023-6-rested-don-plus-1000',
            text: 'If you have 6 or more rested DON!! cards, this Character gains +1000 power.',
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                },
                value: 6,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Caribou 023'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP07-042',
      effects: [{ kind: 'special-ref', specialHandlerId: 'op07-042-special' }],
    },
    {
      cardId: 'OP07-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-tanaka-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-084',
    },
    {
      cardId: 'OP07-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dogura-magura-on-play-double-attack-red-cost-1',
            text: '[On Play] Up to 1 of your red Characters with a cost of 1 gains [Double Attack] during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    costMax: 1,
                  },
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
    {
      cardId: 'OP07-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'coribou-on-play-caribou-rested',
            text: '[On Play] Play up to 1 [Caribou] with a cost of 4 or less from your hand rested.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Caribou'], costMax: 4 },
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
    {
      cardId: 'OP07-087',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'baskerville-your-turn-opp-cost-0-plus-3000',
            text: '[Your Turn] If your opponent has a Character with a cost of 0, this Character gains +3000 power.',
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Baskerville'] },
              },
              power: 3000,
            },
          },
        },
      ],
    },
    {
      cardId: 'OP07-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'egghead-end-of-turn-restand-egghead',
            text: '[End of Your Turn] If you have 3 or less Life cards, set up to 1 [Egghead] type Character with a cost of 5 or less as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 3 },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Egghead'],
                    costMax: 5,
                    rested: true,
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
            id: 'egghead-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
                  source: 'effectSource',
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'island-of-women-activate-main-trash-1-rest-stage-bounce',
            text: '[Activate:Main] You may trash 1 card from your hand and rest this Stage: If your Leader has the [Kuja Pirates] type, return up to 1 of your [Amazon Lily] or [Kuja Pirates] type Characters to the owner’s hand.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kuja Pirates',
              },
            ],
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
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Amazon Lily', 'Kuja Pirates'] },
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
    {
      cardId: 'OP07-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-on-attacked-rest-self-grant-blocker-fish-man',
            text: '[On Your Opponent’s Attack] You may rest this Character: Up to 1 of your [Fish-Man] type Characters with a cost of 5 or less gains [Blocker] during this turn.',
            trigger: { type: 'onAttacked', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Fish-Man'],
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['mustBeAttackTarget'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP07-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'porchemy-on-play-minus-1000',
            text: '[On Play] Give up to 1 of your opponent’s Characters -1000 power during this turn.',
            trigger: { type: 'onPlay' },
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
    {
      cardId: 'OP07-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sterry-on-play-leader-minus-5000-draw-trash',
            text: '[On Play] You may give your 1 active Leader -5000 power during this turn: Draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -5000,
                duration: { type: 'untilEndOfTurn' },
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
