import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const st19EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-19',
  cards: [
    // ST19-001 Smoker (ST19-001)
    // [On Play] You may trash 1 black "Navy" type card from your hand: Up to 2 of your opponent's Characters with a cost of 4 or less cannot attack until the end of your opponent's next turn.
    {
      cardId: 'ST19-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st19-001-on-play-trash-hand-restrict-attack',
            text: '[On Play] You may trash 1 black "Navy" type card from your hand: Up to 2 of your opponent\'s Characters with a cost of 4 or less cannot attack until the end of your opponent\'s next turn.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { color: ['Black'], trait: ['Navy'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 2 },
                },
                turns: 1,
              },
            ],
          },
        },
      ],
    },
    // ST19-002 Sengoku - ST19-002 (Pirate Foil)
    // [On Play] You may trash 2 black "Navy" type cards from your hand: If your Leader has the "Navy" type, draw 3 cards.
    {
      cardId: 'ST19-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st19-002-on-play-trash-hand-leader-navy-draw-3',
            text: '[On Play] You may trash 2 black "Navy" type cards from your hand: If your Leader has the "Navy" type, draw 3 cards.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { color: ['Black'], trait: ['Navy'] },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 3 }],
          },
        },
      ],
    },
    // ST19-003 Tashigi
    // [On Play] If your Leader is [Smoker], give up to 1 of your opponent's Characters -4 cost during this turn.
    // [Activate: Main] [Once Per Turn] If this Character was played on this turn, trash up to 1 of your opponent's Characters with a cost of 0.
    {
      cardId: 'ST19-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st19-003-on-play-condition-leader-smoker-modify-cost-minus-4',
            text: "[On Play] If your Leader is [Smoker], give up to 1 of your opponent's Characters -4 cost during this turn.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Smoker' },
            ],
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
        {
          kind: 'standard',
          effect: {
            id: 'st19-003-activate-main-once-per-turn-trash-cost-0',
            text: "[Activate: Main] [Once Per Turn] If this Character was played on this turn, trash up to 1 of your opponent's Characters with a cost of 0.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            // NOTE: The condition "If this Character was played on this turn" is
            // not expressible in the current DSL. The engine should gate this
            // effect through an external check (e.g. tracking when the card
            // entered play) or a future `cardPlayedThisTurn` condition type.
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
    // ST19-004 Hina
    // [DON!! x1] [Opponent's Turn] This Character gains +4 cost.
    // [Activate: Main] [Once Per Turn] You may place 1 card from your trash at the bottom of your deck: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST19-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st19-004-don-x1-opponent-turn-plus-4-cost',
            text: "[DON!! x1] [Opponent's Turn] This Character gains +4 cost.",
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Hina'] },
              },
              cost: 4,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st19-004-activate-main-once-per-turn-trash-to-deck-attach-don',
            text: '[Activate: Main] [Once Per Turn] You may place 1 card from your trash at the bottom of your deck: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
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
    // ST19-005 Monkey.D.Garp
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Activate: Main] [Once Per Turn] You may place 1 card from your trash at the bottom of your deck: Give up to 1 of your opponent's Characters +1 cost during this turn.
    {
      cardId: 'ST19-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st19-005-activate-main-once-per-turn-trash-to-deck-plus-1-cost',
            text: "[Activate: Main] [Once Per Turn] You may place 1 card from your trash at the bottom of your deck: Give up to 1 of your opponent's Characters +1 cost during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'upTo', value: 1 },
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
  ],
};
