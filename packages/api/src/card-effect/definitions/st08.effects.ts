import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st08EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST08',
  cards: [
    // ST08-002 Uta
    // This Character cannot be K.O.'d in battle by Leaders. [Activate:Main] You may rest this Character: Give up to 1 of your opponent's Characters -2 cost during this turn.
    {
      cardId: 'ST08-002',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st08-002-cannot-be-koed-in-battle',
            text: "This Character cannot be K.O.'d in battle by Leaders.",
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Uta'] },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st08-002-activate-main-rest-modify-cost',
            text: "[Activate:Main] You may rest this Character: Give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Uta'] },
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
    // ST08-014 Gum-Gum Bell
    // [Main] You may add 1 card from the top of your Life cards to your hand: Give up to 1 of your opponent's Characters -7 cost during this turn. [Trigger] Add up to 1 black Character card with a cost of 2 or less from your trash to your hand.
    {
      cardId: 'ST08-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-014-main-life-cost-modify-cost',
            text: "[Main] You may add 1 card from the top of your Life cards to your hand: Give up to 1 of your opponent's Characters -7 cost during this turn.",
            trigger: { type: 'activateMain' },
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
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -7,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st08-014-trigger-search-trash-black-character',
            text: '[Trigger] Add up to 1 black Character card with a cost of 2 or less from your trash to your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  color: ['Black'],
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
    // ST08-005 Shanks
    // [On Play] You may trash 1 card from your hand: K.O. all Characters with a cost of 1 or less.
    {
      cardId: 'ST08-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-005-on-play-trash-hand-ko-all-cost-1-or-less',
            text: '[On Play] You may trash 1 card from your hand: K.O. all Characters with a cost of 1 or less.',
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
            actions: [
              {
                type: 'koAllCharacters',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // ST08-006 Shirahoshi
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] Give up to 1 of your opponent's Characters -4 cost during this turn.
    {
      cardId: 'ST08-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-006-on-play-modify-cost',
            text: "[On Play] Give up to 1 of your opponent's Characters -4 cost during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
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
    // ST08-001 Monkey.D.Luffy (001)
    // [Your Turn] When a Character is K.O.'d, give up to 1 rested DON!! card to this Leader.
    {
      cardId: 'ST08-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-001-leader-on-ko-attach-don',
            text: "[Your Turn] When a Character is K.O.'d, give up to 1 rested DON!! card to this Leader.",
            trigger: { type: 'onKo' },
            conditions: [{ type: 'controllerTurn', value: true }],
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
      ],
    },
    // ST08-007 Nefeltari Vivi
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [Trigger] Play this card.
    {
      cardId: 'ST08-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-007-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Nefeltari Vivi'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST08-015 Gum-Gum Pistol
    // [Main] K.O. up to 1 of your opponent's Characters with a cost of 2 or less. [Trigger] Draw 1 card.
    {
      cardId: 'ST08-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-015-main-ko-cost-2-or-less',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain' },
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
            id: 'st08-015-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST08-004 Koby
    // [Activate:Main] You may rest this Character: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'ST08-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-004-activate-main-rest-ko-cost-2-or-less',
            text: "[Activate:Main] You may rest this Character: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Koby'] },
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
                  filter: { cardCategory: ['Character'], costMax: 2 },
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
    // ST08-013 Mr.2.Bon.Kurei (Bentham)
    // [DON!! x1] At the end of a battle in which this Character battles your opponent's Character, you may K.O. the opponent's Character you battled with. If you do, K.O. this Character.
    {
      cardId: 'ST08-013',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st08-013-special',
        },
      ],
    },
    // ST08-009 Makino
    // [On Play] If there is a Character with a cost of 0, draw 1 card.
    {
      cardId: 'ST08-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-009-on-play-condition-cost-0-draw',
            text: '[On Play] If there is a Character with a cost of 0, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { costMax: 0 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST08-008 Higuma
    // [On Play] Give up to 1 of your opponent's Characters -2 cost during this turn.
    {
      cardId: 'ST08-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st08-008-on-play-modify-cost',
            text: "[On Play] Give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
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
  ],
};
