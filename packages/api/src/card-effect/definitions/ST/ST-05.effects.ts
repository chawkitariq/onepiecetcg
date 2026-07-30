import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const st05EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-05',
  cards: [
    // ST05-001 Sakazuki
    // [Activate:Main] [Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'ST05-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-leader-activate-main-don-1-ko-cost-3-or-less',
            text: "[Activate:Main] [Once Per Turn] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // ST05-002 Sakazuki
    // [Rush] (This card can attack on the turn in which it is played.)
    // [When Attacking] K.O. all of your opponent's Characters with a cost of 0.
    {
      cardId: 'ST05-002',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sakazuki-has-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Sakazuki'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-when-attacking-ko-all-cost-0',
            text: "[When Attacking] K.O. all of your opponent's Characters with a cost of 0.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'koAllCharacters',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 0 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // ST05-003 Borsalino
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Block] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'ST05-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'borsalino-on-block-don-1-ko-cost-4-or-less',
            text: "[On Block] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onBlock' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // ST05-004 Kuzan
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 5 or less. Then, give this Character up to 1 rested DON!! card.
    {
      cardId: 'ST05-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-on-play-don-2-ko-cost-5-or-less-attach-1-rested-don',
            text: "[On Play] DON!! -2: K.O. up to 1 of your opponent's Characters with a cost of 5 or less. Then, give this Character up to 1 rested DON!! card.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
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
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kuzan'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // ST05-005 Rob Lucci
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On K.O.] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'ST05-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rob-lucci-on-ko-don-1-ko-cost-4-or-less',
            text: "[On K.O.] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onKo' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // ST05-006 Spandam
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Navy" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'ST05-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spandam-on-play-search-navy',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Navy" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Navy'] },
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
    // ST05-007 Koby
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST05-007',
      effects: [],
    },
    // ST05-008 Helmeppo
    {
      cardId: 'ST05-008',
      effects: [],
    },
    // ST05-009 Tashigi
    {
      cardId: 'ST05-009',
      effects: [],
    },
    // ST05-010 Smoker
    // [When Attacking] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'ST05-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'smoker-when-attacking-don-1-ko-cost-3-or-less',
            text: "[When Attacking] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // ST05-011 Garp
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'ST05-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'garp-on-play-don-1-ko-cost-5-or-less',
            text: "[On Play] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // ST05-012 Sengoku
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 7 or less.
    {
      cardId: 'ST05-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sengoku-on-play-don-2-ko-cost-7-or-less',
            text: "[On Play] DON!! -2: K.O. up to 1 of your opponent's Characters with a cost of 7 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
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
    // ST05-013 Hina
    {
      cardId: 'ST05-013',
      effects: [],
    },
    // ST05-014 White Chase
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if your Leader has the "Navy" type, add up to 1 DON!! card from your DON!! deck and rest it.
    // [Trigger] Play this card.
    {
      cardId: 'ST05-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'white-chase-counter-plus-4000-then-if-navy-leader-add-rested-don',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if your Leader has the "Navy" type, add up to 1 DON!! card from your DON!! deck and rest it.',
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
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'playerHasLeaderTrait',
                    player: 'self',
                    value: 'Navy',
                  },
                ],
                actions: [
                  { type: 'addDon', player: 'self', amount: 1, rested: true },
                ],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'white-chase-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['White Chase'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST05-015 Very Good
    // [Counter] Up to 1 of your "Navy" type Leader or Character cards gains +4000 power during this battle. Then, set up to 1 of your DON!! cards as active.
    // [Trigger] Play this card.
    {
      cardId: 'ST05-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'very-good-counter-navy-plus-4000-then-set-don-active',
            text: '[Counter] Up to 1 of your "Navy" type Leader or Character cards gains +4000 power during this battle. Then, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Navy'] },
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
            id: 'very-good-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Very Good'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST05-016 Navy HQ
    // [Activate:Main] You may rest this Stage: If your Leader has the "Navy" type, your "Navy" type Characters gain +1000 power during this turn.
    {
      cardId: 'ST05-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'navy-hq-activate-main-rest-if-navy-leader-navy-characters-plus-1000',
            text: '[Activate:Main] You may rest this Stage: If your Leader has the "Navy" type, your "Navy" type Characters gain +1000 power during this turn.',
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
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Navy',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Navy'] },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST05-017 Momonga
    {
      cardId: 'ST05-017',
      effects: [],
    },
  ],
};
