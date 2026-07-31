import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const st23EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-23',
  cards: [
    // ST23-001 Uta
    // If you have a Character with 10000 power or more, give this card in your hand -4 cost.
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST23-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st23-001-hand-cost-minus-4-if-character-10000-power',
            text: 'If you have a Character with 10000 power or more, give this card in your hand -4 cost.',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 10000 },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['hand'],
                filter: { name: ['Uta'] },
              },
              cost: -4,
            },
          },
        },
      ],
    },
    // ST23-002 Shanks
    // If your opponent has a Character with 8000 base power or more, give this card in your hand -3 cost.
    // [On Play] If your Leader has the "Red-Haired Pirates" type or is [Uta], your Leader gains +2000 power until the end of your opponent's next End Phase.
    {
      cardId: 'ST23-002',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st23-002-hand-cost-minus-3-if-opponent-character-8000-base-power',
            text: 'If your opponent has a Character with 8000 base power or more, give this card in your hand -3 cost.',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMin: 8000,
                  },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['hand'],
                filter: { name: ['Shanks'] },
              },
              cost: -3,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st23-002-on-play-leader-plus-2000-if-red-haired-pirates-or-uta',
            text: '[On Play] If your Leader has the "Red-Haired Pirates" type or is [Uta], your Leader gains +2000 power until the end of your opponent\'s next End Phase.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ifAnyConditionGroupMatches',
                conditionGroups: [
                  [
                    {
                      type: 'playerHasLeaderTrait',
                      player: 'self',
                      value: 'Red-Haired Pirates',
                    },
                  ],
                  [
                    {
                      type: 'playerHasLeaderName',
                      player: 'self',
                      value: 'Uta',
                    },
                  ],
                ],
                actions: [
                  {
                    type: 'modifyPower',
                    selector: {
                      player: 'self',
                      zones: ['leader'],
                      count: { kind: 'exact', value: 1 },
                    },
                    amount: 2000,
                    duration: { type: 'untilStartOfYourNextTurn' },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST23-003 Benn.Beckman
    // [On Play] You may trash 1 card from your hand: If your Leader has the "Red-Haired Pirates" type, K.O. up to 1 of your opponent's Characters with 4000 base power or less.
    {
      cardId: 'ST23-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st23-003-on-play-trash-hand-ko-base-power-4000-if-red-hair-leader',
            text: '[On Play] You may trash 1 card from your hand: If your Leader has the "Red-Haired Pirates" type, K.O. up to 1 of your opponent\'s Characters with 4000 base power or less.',
            trigger: { type: 'onPlay' },
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Red-Haired Pirates',
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
                    basePowerMax: 4000,
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
    // ST23-004 Monkey.D.Luffy
    // [Activate:Main] You may rest 1 of your DON!! cards and this Character: Give up to 1 of your opponent's Characters-1000 power during this turn.
    {
      cardId: 'ST23-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st23-004-activate-main-rest-don-and-self-minus-1000-power',
            text: "[Activate:Main] You may rest 1 of your DON!! cards and this Character: Give up to 1 of your opponent's Characters-1000 power during this turn.",
            trigger: { type: 'activateMain' },
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
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Luffy'], rested: false },
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
    // ST23-005 Yasopp
    // [Activate:Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST23-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st23-005-activate-main-once-per-turn-attach-rested-don',
            text: '[Activate:Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
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
  ],
};
