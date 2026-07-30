import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st09EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST09',
  cards: [
    // ST09-001 Yamato (001)
    // [DON!! x1] [Opponent's Turn] If you have 2 or less Life cards, this Leader gains +1000 power.
    {
      cardId: 'ST09-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st09-001-don-x1-opponent-turn-life-low-plus-1000',
            text: "[DON!! x1] [Opponent's Turn] If you have 2 or less Life cards, this Leader gains +1000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: false },
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader'],
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // ST09-002 Uzuki Tempura
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 2 or less and add this card to your hand.
    {
      cardId: 'ST09-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st09-002-trigger-rest-cost-2-or-less-add-to-hand',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 2 or less and add this card to your hand.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash', 'life'],
                  filter: { name: ['Uzuki Tempura'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // ST09-004 Kaido
    // [DON!! x1] If you have 2 or less Life cards, this Character cannot be K.O.'d in battle.
    {
      cardId: 'ST09-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st09-004-don-x1-life-low-cannot-be-koed-in-battle',
            text: "[DON!! x1] If you have 2 or less Life cards, this Character cannot be K.O.'d in battle.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Kaido'] },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // ST09-005 Kouzuki Oden
    // [DON!! x1] This Character gains [Double Attack]. [On K.O.] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'ST09-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st09-005-don-x1-double-attack',
            text: '[DON!! x1] This Character gains [Double Attack].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Kouzuki Oden'] },
              },
              keywords: ['doubleAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st09-005-on-ko-trash-2-add-top-deck-to-life',
            text: '[On K.O.] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onKo' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
      ],
    },
    // ST09-007 Shinobu
    // [Blocker] [On Block] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains +4000 power during this battle.
    {
      cardId: 'ST09-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st09-007-on-block-life-to-hand-plus-4000-until-end-of-battle',
            text: '[On Block] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains +4000 power during this battle.',
            trigger: { type: 'onBlock' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Shinobu'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // ST09-008 Shimotsuki Ushimaru
    // [DON!! x1] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Play up to 1 yellow [Land of Wano] type Character card with a cost of 4 or less from your hand.
    {
      cardId: 'ST09-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st09-008-when-attacking-don-x1-life-to-hand-play-land-of-wano',
            text: '[DON!! x1] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Play up to 1 yellow [Land of Wano] type Character card with a cost of 4 or less from your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    color: ['Yellow'],
                    trait: ['Land of Wano'],
                    cardCategory: ['Character'],
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
    // ST09-009 Fugetsu Omusubi
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 1 or less and add this card to your hand.
    {
      cardId: 'ST09-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st09-009-trigger-ko-cost-1-or-less-add-to-hand',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 1 or less and add this card to your hand.",
            trigger: { type: 'trigger' },
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
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash', 'life'],
                  filter: { name: ['Fugetsu Omusubi'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // ST09-010 Portgas.D.Ace
    // [Once Per Turn] If this Character would be K.O.'d, you may trash 1 card from the top or bottom of your Life cards instead.
    {
      cardId: 'ST09-010',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'st09-010-replacement-prevent-ko',
            text: "[Once Per Turn] If this Character would be K.O.'d, you may trash 1 card from the top or bottom of your Life cards instead.",
            event: 'wouldKoCharacter',
            oncePerTurn: true,
            optional: true,
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['life'] },
                value: 1,
              },
            ],
            replacement: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // ST09-012 Yamato (012)
    // [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains +2000 power until the start of your next turn.
    {
      cardId: 'ST09-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st09-012-when-attacking-life-to-hand-plus-2000-until-start-of-next-turn',
            text: '[When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains +2000 power until the start of your next turn.',
            trigger: { type: 'whenAttacking' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Yamato'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST09-014 Narikabura Arrow
    // [Counter] If you have 2 or less Life cards, give up to 1 of your opponent's Leader or Character cards -3000 power during this turn. [Trigger] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'ST09-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st09-014-counter-minus-3000-life-low',
            text: "[Counter] If you have 2 or less Life cards, give up to 1 of your opponent's Leader or Character cards -3000 power during this turn.",
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st09-014-trigger-trash-2-add-top-deck-to-life',
            text: '[Trigger] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'trigger' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
      ],
    },
    // ST09-015 Thunder Bagua
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 2 or less Life cards, add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of the owner's Life cards face-up. [Trigger] Draw 1 card.
    {
      cardId: 'ST09-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st09-015-counter-plus-4000-then-conditional-add-to-life',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 2 or less Life cards, add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of the owner's Life cards face-up.",
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
                  { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
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
                    destinationPlayer: 'opponent',
                    destinationZone: 'life',
                    faceDown: false,
                  },
                ],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st09-015-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
  ],
};
