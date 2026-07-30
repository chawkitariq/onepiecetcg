import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st27EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-27',
  cards: [
    // ST27-005 Marshall.D.Teach (ST27-005)
    // [Activate:Main] You may rest this Character: K.O. up to 1 Character with a cost of 3 or less.
    // [On K.O.] Add up to 1 black card from your trash to your hand.
    {
      cardId: 'ST27-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st27-005-activate-main-ko-cost-3-or-less',
            text: '[Activate:Main] You may rest this Character: K.O. up to 1 Character with a cost of 3 or less.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st27-005-on-ko-add-black-from-trash-to-hand',
            text: '[On K.O.] Add up to 1 black card from your trash to your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { color: ['Black'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // ST27-003 Kuzan
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On K.O.] Play up to 1 "Blackbeard Pirates" type Character card with a cost of 5 or less from your trash rested.
    {
      cardId: 'ST27-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st27-003-on-ko-play-blackbeard-pirates-from-trash-rested',
            text: '[On K.O.] Play up to 1 "Blackbeard Pirates" type Character card with a cost of 5 or less from your trash rested.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Blackbeard Pirates'],
                    costMax: 5,
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
    // ST27-002 Catarina Devon
    // [Activate:Main] You may trash this Character: If your Leader has the "Blackbeard Pirates" type, give up to 1 of your opponent's Characters -1 cost during this turn.
    // [On K.O.] Draw 1 card.
    {
      cardId: 'ST27-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st27-002-activate-main-trash-self-minus-1-cost',
            text: '[Activate:Main] You may trash this Character: If your Leader has the "Blackbeard Pirates" type, give up to 1 of your opponent\'s Characters -1 cost during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
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
                amount: -1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st27-002-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST27-004 Sanjuan.Wolf
    // If your Leader has the "Blackbeard Pirates" type, this Character gains [Blocker] and +1 cost for every 4 cards in your trash.
    // [On Play] Trash 1 card from your hand.
    {
      cardId: 'ST27-004',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st27-004-special',
        },
        {
          kind: 'standard',
          effect: {
            id: 'st27-004-on-play-trash-1-from-hand',
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
      ],
    },
    // ST27-001 Avalo Pizarro
    // [Activate:Main] [Once Per Turn] You may rest 1 of your [Fullalead] cards: If your Leader has the "Blackbeard Pirates" type, this Character gains +4000 power during this turn.
    // [On K.O.] Draw 1 card.
    {
      cardId: 'ST27-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st27-001-activate-main-rest-fullalead-plus-4000',
            text: '[Activate:Main] [Once Per Turn] You may rest 1 of your [Fullalead] cards: If your Leader has the "Blackbeard Pirates" type, this Character gains +4000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters', 'stage'],
                  filter: { name: ['Fullalead'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 4000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st27-001-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
  ],
};
