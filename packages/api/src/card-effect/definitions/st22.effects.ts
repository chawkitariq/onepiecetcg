import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st22EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST22',
  cards: [
    // ST22-001 Ace & Newgate (Parallel)
    // [Activate: Main] [Once Per Turn] You may reveal 1 card with a type including "Whitebeard Pirates" from your hand: Draw 1 card and place the revealed card at the top of your deck.
    {
      cardId: 'ST22-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-001-activate-main-reveal-whitebeard-draw-topdeck',
            text: '[Activate: Main] [Once Per Turn] You may reveal 1 card with a type including "Whitebeard Pirates" from your hand: Draw 1 card and place the revealed card at the top of your deck.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'storeSelectedCards',
                key: 'st22-001-revealed',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { traitIncludes: ['Whitebeard Pirates'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'revealStoredCards',
                key: 'st22-001-revealed',
              },
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveStoredCards',
                key: 'st22-001-revealed',
                destinationPlayer: 'self',
                destinationZone: 'deck',
              },
            ],
          },
        },
      ],
    },
    // ST22-002 Izo (Parallel)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Whitebeard Pirates" other than [Izo] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [On Your Opponent's Attack] You may trash this Character: Draw 1 card and place 1 card from your hand at the bottom of your deck.
    {
      cardId: 'ST22-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-002-on-play-search-whitebeard',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Whitebeard Pirates" other than [Izo] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  traitIncludes: ['Whitebeard Pirates'],
                  excludeName: ['Izo'],
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
            id: 'st22-002-on-opponent-attack-trash-draw-bottom',
            text: "[On Your Opponent's Attack] You may trash this Character: Draw 1 card and place 1 card from your hand at the bottom of your deck.",
            trigger: { type: 'onAttacked', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Izo'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
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
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // ST22-003 Edward.Newgate
    // [Double Attack] (This card deals 2 damage.)
    // [On Play] Reveal 1 card from the top of your deck. If that card's type includes "Whitebeard Pirates", draw 2 cards.
    {
      cardId: 'ST22-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st22-003-double-attack',
            text: '[Double Attack] (This card deals 2 damage.)',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Edward.Newgate'] },
              },
              keywords: ['doubleAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st22-003-on-play-reveal-top-draw-if-whitebeard',
            text: '[On Play] Reveal 1 card from the top of your deck. If that card\'s type includes "Whitebeard Pirates", draw 2 cards.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'st22-003-revealed',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'st22-003-revealed',
                filter: { traitIncludes: ['Whitebeard Pirates'] },
                actions: [{ type: 'draw', player: 'self', amount: 2 }],
              },
            ],
          },
        },
      ],
    },
    // ST22-005 Kouzuki Oden (Parallel)
    // If this Character would be removed from the field by your opponent's effect, you may trash 2 cards from your hand instead.
    // [Activate: Main] [Once Per Turn] You may rest 3 of your DON!! cards and return 1 of your Characters other than this Character to the owner's hand: Set this Character as active.
    {
      cardId: 'ST22-005',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'st22-005-replacement-hand-trash-instead-of-removal',
            text: "If this Character would be removed from the field by your opponent's effect, you may trash 2 cards from your hand instead.",
            event: 'wouldMoveCard',
            optional: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [
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
            id: 'st22-005-activate-main-rest-don-bounce-restand',
            text: "[Activate: Main] [Once Per Turn] You may rest 3 of your DON!! cards and return 1 of your Characters other than this Character to the owner's hand: Set this Character as active.",
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
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
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { excludeName: ['Kouzuki Oden'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kouzuki Oden'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST22-006 Jozu
    // [On Play] Reveal 1 card from the top of your deck. If that card's type includes "Whitebeard Pirates", draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'ST22-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-006-on-play-reveal-top-draw-trash-if-whitebeard',
            text: '[On Play] Reveal 1 card from the top of your deck. If that card\'s type includes "Whitebeard Pirates", draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'st22-006-revealed',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'st22-006-revealed',
                filter: { traitIncludes: ['Whitebeard Pirates'] },
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
            ],
          },
        },
      ],
    },
    // ST22-007 Squard
    // [Activate: Main] [Once Per Turn] Reveal 1 card from the top of your deck. If that card's type includes "Whitebeard Pirates", give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST22-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-007-activate-main-reveal-top-attach-don-if-whitebeard',
            text: '[Activate: Main] [Once Per Turn] Reveal 1 card from the top of your deck. If that card\'s type includes "Whitebeard Pirates", give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'st22-007-revealed',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'st22-007-revealed',
                filter: { traitIncludes: ['Whitebeard Pirates'] },
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
            ],
          },
        },
      ],
    },
    // ST22-009 Vista
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST22-009',
      effects: [],
    },
    // ST22-011 Whitey Bay (Parallel)
    // [Your Turn] [On Play] Up to 1 of your Leader with a type including "Whitebeard Pirates" gains +2000 power during this turn.
    {
      cardId: 'ST22-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-011-on-play-leader-power-if-your-turn',
            text: '[Your Turn] [On Play] Up to 1 of your Leader with a type including "Whitebeard Pirates" gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { traitIncludes: ['Whitebeard Pirates'] },
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
    // ST22-012 Marco
    // [Once Per Turn] If this Character would be K.O.'d by your opponent's effect, you may trash 1 card from your hand instead.
    // [When Attacking] Reveal 1 card from the top of your deck. If that card's type includes "Whitebeard Pirates", this Character gains +1000 power until the end of your opponent's next turn.
    {
      cardId: 'ST22-012',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'st22-012-replacement-hand-trash-instead-of-ko',
            text: "[Once Per Turn] If this Character would be K.O.'d by your opponent's effect, you may trash 1 card from your hand instead.",
            event: 'wouldKoCharacter',
            optional: true,
            oncePerTurn: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
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
            id: 'st22-012-when-attacking-reveal-top-power-if-whitebeard',
            text: '[When Attacking] Reveal 1 card from the top of your deck. If that card\'s type includes "Whitebeard Pirates", this Character gains +1000 power until the end of your opponent\'s next turn.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'st22-012-revealed',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'st22-012-revealed',
                filter: { traitIncludes: ['Whitebeard Pirates'] },
                actions: [
                  {
                    type: 'modifyPower',
                    selector: {
                      player: 'self',
                      zones: ['characters'],
                      filter: { name: ['Marco'] },
                      count: { kind: 'exact', value: 1 },
                    },
                    amount: 1000,
                    duration: { type: 'untilStartOfYourNextTurn' },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST22-015 I Am Whitebeard!!
    // [Main] If your Leader's type includes "Whitebeard Pirates", play up to 1 [Edward.Newgate] from your hand. Then, you may add 1 card from the top or bottom of your Life cards to your hand. If you do, up to 1 of your Leader gains +2000 power until the end of your opponent's next turn.
    {
      cardId: 'ST22-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-015-main-play-edward-newgate-and-option-life-power',
            text: '[Main] If your Leader\'s type includes "Whitebeard Pirates", play up to 1 [Edward.Newgate] from your hand. Then, you may add 1 card from the top or bottom of your Life cards to your hand. If you do, up to 1 of your Leader gains +2000 power until the end of your opponent\'s next turn.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
              },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose how to resolve:',
                choices: [
                  {
                    id: 'only-play',
                    label: 'Play Edward.Newgate only',
                    actions: [
                      {
                        type: 'play',
                        selector: {
                          player: 'self',
                          zones: ['hand'],
                          filter: { name: ['Edward.Newgate'] },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destination: 'characters',
                      },
                    ],
                  },
                  {
                    id: 'play-and-life',
                    label:
                      'Play Edward.Newgate, add life to hand, give leader +2000 power',
                    actions: [
                      {
                        type: 'play',
                        selector: {
                          player: 'self',
                          zones: ['hand'],
                          filter: { name: ['Edward.Newgate'] },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destination: 'characters',
                      },
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'self',
                          zones: ['life'],
                          filter: { zonePosition: 'topOrBottom' },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'self',
                        destinationZone: 'hand',
                      },
                      {
                        type: 'modifyPower',
                        selector: {
                          player: 'self',
                          zones: ['leader'],
                          count: { kind: 'upTo', value: 1 },
                        },
                        amount: 2000,
                        duration: { type: 'untilStartOfYourNextTurn' },
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
    // ST22-016 Take That Back!! Take Back What You Said!!
    // [Counter] Reveal 1 card from the top of your deck. If that card's type includes "Whitebeard Pirates", up to 1 of your Leader or Character cards gains +4000 power during this battle.
    // [Trigger] Draw 1 card.
    {
      cardId: 'ST22-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-016-counter-reveal-top-power-if-whitebeard',
            text: '[Counter] Reveal 1 card from the top of your deck. If that card\'s type includes "Whitebeard Pirates", up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'st22-016-revealed',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'st22-016-revealed',
                filter: { traitIncludes: ['Whitebeard Pirates'] },
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st22-016-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // ST22-017 Fire Fist
    // [Main] You may reveal 2 cards with a type including "Whitebeard Pirates" from your hand: Draw 1 card. Then, place up to 1 Character with a cost of 5 or less at the bottom of the owner's deck.
    // [Trigger] Return up to 1 Character with a cost of 3 or less to the owner's hand.
    {
      cardId: 'ST22-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st22-017-main-reveal-whitebeard-draw-bounce',
            text: '[Main] You may reveal 2 cards with a type including "Whitebeard Pirates" from your hand: Draw 1 card. Then, place up to 1 Character with a cost of 5 or less at the bottom of the owner\'s deck.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'storeSelectedCards',
                key: 'st22-017-revealed',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { traitIncludes: ['Whitebeard Pirates'] },
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'revealStoredCards',
                key: 'st22-017-revealed',
              },
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st22-017-trigger-bounce-cost-3-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'trigger' },
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
  ],
};
