import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st06EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-06',
  cards: [
    // ST06-006 Tashigi
    // [Activate:Main] You may rest this Character: Give up to 1 of your opponent's Characters -2 cost during this turn.
    {
      cardId: 'ST06-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tashigi-activate-main-rest-self-modify-cost-2',
            text: "[Activate:Main] You may rest this Character: Give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Tashigi'], rested: false },
                  count: { kind: 'exact', value: 1 },
                },
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
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST06-014 Shockwave
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, K.O. up to 1 of your opponent's active Characters with a cost of 3 or less. [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'ST06-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shockwave-counter-plus-4000-then-ko-active-cost-3-or-less',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, K.O. up to 1 of your opponent's active Characters with a cost of 3 or less.",
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                    rested: false,
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
            id: 'shockwave-trigger-ko-cost-4-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
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
    // ST06-010 Helmeppo
    // [On Play] Give up to 1 of your opponent's Characters -3 cost during this turn.
    {
      cardId: 'ST06-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'helmeppo-on-play-modify-cost-3',
            text: "[On Play] Give up to 1 of your opponent's Characters -3 cost during this turn.",
            trigger: { type: 'onPlay' },
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
    // ST06-008 Hina
    // [On Play] Give up to 1 of your opponent's Characters -4 cost during this turn.
    {
      cardId: 'ST06-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hina-on-play-modify-cost-4',
            text: "[On Play] Give up to 1 of your opponent's Characters -4 cost during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -4,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST06-004 Smoker
    // This Character cannot be K.O.'d by effects. [DON!! x1] If there is a Character with a cost of 0, this Character gains [Double Attack]. (This card deals 2 damage.)
    {
      cardId: 'ST06-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'smoker-cannot-be-koed-by-effects',
            text: "This Character cannot be K.O.'d by effects.",
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Smoker'] },
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'smoker-don-x1-double-attack-if-cost-0',
            text: '[DON!! x1] If there is a Character with a cost of 0, this Character gains [Double Attack].',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Smoker'] },
              },
              keywords: ['doubleAttack'],
            },
          },
        },
      ],
    },
    // ST06-012 Monkey.D.Garp
    // [Activate:Main] You may trash 1 card from your hand and rest this Character: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'ST06-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'garp-activate-main-trash-1-and-rest-self-ko-cost-4-or-less',
            text: "[Activate:Main] You may trash 1 card from your hand and rest this Character: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
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
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Garp'], rested: false },
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
    // ST06-015 Great Eruption
    // [Main] Draw 1 card. Then, give up to 1 of your opponent's Characters -2 cost during this turn. [Trigger] Your opponent chooses 1 card from their hand and trashes it.
    {
      cardId: 'ST06-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'great-eruption-main-draw-1-then-modify-cost-2',
            text: "[Main] Draw 1 card. Then, give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
        {
          kind: 'standard',
          effect: {
            id: 'great-eruption-trigger-opponent-trash-1',
            text: '[Trigger] Your opponent chooses 1 card from their hand and trashes it.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST06-017 Navy HQ
    // [On Play] Give up to 1 of your opponent's Characters -1 cost during this turn. [Activate:Main] You may rest this Stage: If your Leader has the [Navy] type, give up to 1 of your opponent's Characters -1 cost during this turn.
    {
      cardId: 'ST06-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'navy-hq-on-play-modify-cost-1',
            text: "[On Play] Give up to 1 of your opponent's Characters -1 cost during this turn.",
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'navy-hq-activate-main-rest-if-navy-leader-modify-cost-1',
            text: "[Activate:Main] You may rest this Stage: If your Leader has the [Navy] type, give up to 1 of your opponent's Characters -1 cost during this turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Navy HQ'], rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
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
                amount: -1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST06-001 Sakazuki
    // [Activate:Main] [Once Per Turn] (3) (You may rest the specified number of DON!! cards in your cost area.) You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost of 0.
    {
      cardId: 'ST06-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-leader-activate-main-rest-3-don-trash-1-ko-cost-0',
            text: "[Activate:Main] [Once Per Turn] (3) You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost of 0.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 3 },
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
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
    // ST06-016 White Out
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. [Trigger] Draw 1 card and none of your Characters can be K.O.'d during this turn.
    {
      cardId: 'ST06-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'white-out-counter-plus-2000',
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
            id: 'white-out-trigger-draw-1-and-protect-ko',
            text: "[Trigger] Draw 1 card and none of your Characters can be K.O.'d during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                },
                keywords: ['cannotBeKoedByEffects', 'cannotBeKoedInBattle'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST06-005 Sengoku
    // [When Attacking] Give up to 1 of your opponent's Characters -4 cost during this turn.
    {
      cardId: 'ST06-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sengoku-when-attacking-modify-cost-4',
            text: "[When Attacking] Give up to 1 of your opponent's Characters -4 cost during this turn.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -4,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST06-002 Koby
    // [On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost of 0.
    {
      cardId: 'ST06-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koby-on-play-trash-1-ko-cost-0',
            text: "[On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a cost of 0.",
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
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
    // ST06-007 Tsuru
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST06-007',
      effects: [],
    },
  ],
};
