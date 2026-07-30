import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st04EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-04',
  cards: [
    // ST04-001 Kaido (001)
    // [Activate: Main] [Once Per Turn] DON!! -7 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Trash up to 1 of your opponent's Life cards.
    {
      cardId: 'ST04-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaido-leader-activate-main-trash-life',
            text: "[Activate: Main] [Once Per Turn] DON!! -7: Trash up to 1 of your opponent's Life cards.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 7 }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // ST04-002 Ulti
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [Page One] card with a cost of 4 or less from your hand.
    {
      cardId: 'ST04-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ulti-on-play-don-minus-1-play-page-one',
            text: '[On Play] DON!! -1: Play up to 1 [Page One] card with a cost of 4 or less from your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    name: ['Page One'],
                    costMax: 4,
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
    // ST04-003 Kaido (Wanted Poster)
    // [On Play] DON!! -5 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 6 or less. This Character gains [Rush] during this turn. (This card can attack on the turn in which it is played.)
    {
      cardId: 'ST04-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaido-wanted-on-play-don-minus-5-ko-cost-6-or-less',
            text: "[On Play] DON!! -5: K.O. up to 1 of your opponent's Characters with a cost of 6 or less. This Character gains [Rush] during this turn.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 5 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 6,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kaido (Wanted Poster)'] },
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
    // ST04-004 King
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'ST04-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'king-on-play-don-minus-1-ko-cost-4-or-less',
            text: "[On Play] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
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
    // ST04-005 Queen (SP)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'ST04-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'queen-sp-on-play-don-minus-1-draw-2-trash-1',
            text: '[On Play] DON!! -1: Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // ST04-006 Sasaki
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Draw 1 card.
    {
      cardId: 'ST04-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sasaki-on-play-don-minus-1-draw-1',
            text: '[On Play] DON!! -1: Draw 1 card.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST04-008 Jack
    // [On Play] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'ST04-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jack-on-play-trash-1-add-active-don',
            text: '[On Play] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and set it as active.',
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
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    // ST04-010 Who's.Who
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 3 or less. [Trigger] Play this card.
    {
      cardId: 'ST04-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'whoswho-on-play-don-minus-1-ko-cost-3-or-less',
            text: "[On Play] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
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
                    costMax: 3,
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
            id: 'whoswho-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ["Who's.Who"] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST04-011 Black Maria
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST04-011',
      effects: [],
    },
    // ST04-014 Lead Performer "Disaster"
    // [Main] Draw 1 card, then add up to 1 DON!! card from your DON!! deck and set it as active. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'ST04-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lead-performer-main-draw-add-don',
            text: '[Main] Draw 1 card, then add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'activateMain' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'lead-performer-trigger-draw-add-don',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    // ST04-015 Brachio Bomber
    // [Main] K.O. up to 1 of your opponent's Characters with a cost of 6 or less, then add up to 1 DON!! card from your DON!! deck and set it as active. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'ST04-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brachio-bomber-main-ko-cost-6-add-don',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost of 6 or less, then add up to 1 DON!! card from your DON!! deck and set it as active.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 6,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                upTo: true,
                reason: 'effect',
              },
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'brachio-bomber-trigger-add-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: false },
            ],
          },
        },
      ],
    },
    // ST04-016 Blast Breath (Jolly Roger Foil)
    // [Counter] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Up to 1 of your Leader or Character cards gains +4000 power during this battle.
    {
      cardId: 'ST04-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blast-breath-counter-plus-4000',
            text: '[Counter] DON!! -1: Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
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
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // ST04-017 Onigashima Island
    // [Activate: Main] You may rest this Stage: If your Leader has the {Animal Kingdom Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'ST04-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'onigashima-island-activate-main-rest-add-rested-don',
            text: '[Activate: Main] You may rest this Stage: If your Leader has the {Animal Kingdom Pirates} type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateMain', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Onigashima Island'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
  ],
};
