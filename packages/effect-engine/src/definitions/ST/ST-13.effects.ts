import type { EditionEffectDefinitions } from '../../types/effect-definition-source';

export const st13EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-13',
  cards: [
    // ST13-001 Sabo (001)
    // [DON!! x1][Activate: Main][Once Per Turn] You may add 1 of your Characters with a cost of 3 or more and 7000 power or more to the top of your Life cards face-up: Up to 1 of your Characters gains +2000 power until the start of your next turn.
    {
      cardId: 'ST13-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-001-activate-main-char-to-life-power-up',
            text: '[DON!! x1][Activate: Main][Once Per Turn] You may add 1 of your Characters with a cost of 3 or more and 7000 power or more to the top of your Life cards face-up: Up to 1 of your Characters gains +2000 power until the start of your next turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 3,
                    powerMin: 7000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
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
    // ST13-002 Portgas.D.Ace (002)
    // [DON!! x2][Activate: Main][Once Per Turn] Look at 5 cards from the top of your deck and add up to 1 Character card with a cost of 5 to the top of your Life cards face-up. Then, place the rest at the bottom of your deck in any order.
    // [End of Your Turn] Trash all your face-up Life cards.
    {
      cardId: 'ST13-002',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-002-special',
        },
      ],
    },
    // ST13-003 Monkey.D.Luffy (003)
    // Your face-up Life cards are placed at the bottom of your deck instead of being added to your hand, according to the rules.
    // [DON!! x2][Activate: Main][Once Per Turn]You may trash 1 card from your hand: If you have 0 Life cards, add up to 2 Character cards with a cost of 5 from your hand or trash to the top of your Life cards face-up.
    {
      cardId: 'ST13-003',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-003-special',
        },
      ],
    },
    // ST13-004 Edward.Newgate - ST13-004 (Pirate Foil)
    // [On Play] Add 1 card from the top of your deck to the top of your Life cards. Then, look at all your Life cards; place 1 card at the top of your deck and place the rest back in your Life area in any order.
    {
      cardId: 'ST13-004',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-004-special',
        },
      ],
    },
    // ST13-005 Emporio.Ivankov
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] You may trash 1 card from the top or bottom of your Life cards: Reveal up to 1 Character card with a cost of 5 from your hand and add it to the top of your Life cards face-down.
    {
      cardId: 'ST13-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-005-on-play-trash-life-add-char-cost-5',
            text: '[On Play] You may trash 1 card from the top or bottom of your Life cards: Reveal up to 1 Character card with a cost of 5 from your hand and add it to the top of your Life cards face-down.',
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 5,
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: true,
              },
            ],
          },
        },
      ],
    },
    // ST13-006 Curly.Dadan (Parallel)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Play up to 1 each of [Sabo], [Portgas.D.Ace], and [Monkey.D.Luffy] with a cost of 2 from your hand.
    {
      cardId: 'ST13-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-006-on-play-play-sabo-ace-luffy-cost-2',
            text: '[On Play] Play up to 1 each of [Sabo], [Portgas.D.Ace], and [Monkey.D.Luffy] with a cost of 2 from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    name: ['Sabo', 'Portgas.D.Ace', 'Monkey.D.Luffy'],
                    costMin: 2,
                    costMax: 2,
                  },
                  count: { kind: 'upTo', value: 3 },
                  distinctBy: 'name',
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST13-007 Sabo - ST13-007 (Pirate Foil)
    // [Activate: Main] You may trash this Character: Reveal 1 card from the top of your Life cards. If that card is a [Sabo] with a cost of 5, you may play that card. If you do, up to 1 of your Leader gains +2000 power until the end of your opponent's next turn.
    {
      cardId: 'ST13-007',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-007-special',
        },
      ],
    },
    // ST13-008 Sabo (008)
    // [On Play]You may trash 1 card from the top or bottom of your Life cards: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'ST13-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-008-on-play-trash-life-ko-5-or-less',
            text: "[On Play]You may trash 1 card from the top or bottom of your Life cards: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'trash',
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
            ],
          },
        },
      ],
    },
    // ST13-009 Shanks
    // [On Play] You may turn 1 of your face-up Life cards face-down: If your opponent has 7 or more cards in their hand, trash up to 1 card from the top of your opponent's Life cards.
    {
      cardId: 'ST13-009',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-009-special',
        },
      ],
    },
    // ST13-010 Portgas.D.Ace - ST13-010 (Pirate Foil)
    // [Activate: Main] You may trash this Character: Reveal 1 card from the top of your Life cards. If that card is a [Portgas.D.Ace] with a cost of 5, you may play that card. If you do, up to 1 of your Leader gains +2000 power until the end of your opponent's next turn.
    {
      cardId: 'ST13-010',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-010-special',
        },
      ],
    },
    // ST13-011 Portgas.D.Ace (SP)
    // [On Play] If you have 2 or less Life cards, this Character gains [Rush].(This card can attack on the turn in which it is played.)
    {
      cardId: 'ST13-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-011-on-play-rush-if-life-2-or-less',
            text: '[On Play] If you have 2 or less Life cards, this Character gains [Rush].',
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
                  filter: { name: ['Portgas.D.Ace'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'permanent' },
              },
            ],
          },
        },
      ],
    },
    // ST13-012 Makino
    // [On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Look at all of your Life cards and place them back in your Life area in any order.
    {
      cardId: 'ST13-012',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-012-special',
        },
      ],
    },
    // ST13-013 Monkey.D.Garp
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Sabo], [Portgas.D.Ace], or [Monkey.D.Luffy] with a cost of 5 or less and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'ST13-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-013-on-play-search-sabo-ace-luffy',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Sabo], [Portgas.D.Ace], or [Monkey.D.Luffy] with a cost of 5 or less and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  name: ['Sabo', 'Portgas.D.Ace', 'Monkey.D.Luffy'],
                  costMax: 5,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // ST13-014 Monkey.D.Luffy - ST13-014 (Pirate Foil)
    // [Activate:Main] You may trash this Character: Reveal 1 card from the top of your Life cards. If that card is a [Monkey.D.Luffy] with a cost of 5, you may play that card. If you do, up to 1 of your Leader gains +2000 power until the end of your opponent's next turn.
    {
      cardId: 'ST13-014',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-014-special',
        },
      ],
    },
    // ST13-015 Monkey.D.Luffy (015)
    // [Activate:Main][Once Per Turn]This Character gains +2000 power until the start of your next turn. Then, if you have 1 or more Life cards, draw 1 card and trash 1 card from the top of your Life cards.
    {
      cardId: 'ST13-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-015-activate-main-plus-2000-conditional-draw-trash-life',
            text: '[Activate:Main][Once Per Turn]This Character gains +2000 power until the start of your next turn. Then, if you have 1 or more Life cards, draw 1 card and trash 1 card from the top of your Life cards.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'targetCountAtLeast',
                    selector: { player: 'self', zones: ['life'] },
                    value: 1,
                  },
                ],
                actions: [
                  { type: 'draw', player: 'self', amount: 1 },
                  {
                    type: 'moveCard',
                    selector: {
                      player: 'self',
                      zones: ['life'],
                      filter: { zonePosition: 'top' },
                      count: { kind: 'exact', value: 1 },
                    },
                    destinationPlayer: 'self',
                    destinationZone: 'trash',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // ST13-016 Yamato (Reprint)
    // [Rush] (This card can attack on the turn in which it is played.)[On Play] Look at all your Life cards; place 1 at the top of your deck and place the rest back in your Life area in any order.
    {
      cardId: 'ST13-016',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st13-016-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Yamato'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'st13-016-special',
        },
      ],
    },
    // ST13-017 Flame Dragon King
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, look at all your Life cards and place them back in your Life area in any order.
    // [Trigger] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.
    {
      cardId: 'ST13-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-017-counter-plus-4000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, look at all your Life cards and place them back in your Life area in any order.',
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
            id: 'st13-017-trigger-life-swap',
            text: '[Trigger] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.',
            trigger: { type: 'trigger' },
            costs: [
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
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
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
    // ST13-018 Gum-Gum Jet Spear
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 0 Life cards, draw 1 card.
    // [Trigger] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.
    {
      cardId: 'ST13-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-018-counter-plus-2000-conditional-draw',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 0 Life cards, draw 1 card.',
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
              {
                type: 'ifConditionsMatch',
                conditions: [
                  { type: 'playerHasLifeAtMost', player: 'self', value: 0 },
                ],
                actions: [{ type: 'draw', player: 'self', amount: 1 }],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st13-018-trigger-life-swap',
            text: '[Trigger] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.',
            trigger: { type: 'trigger' },
            costs: [
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
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
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
    // ST13-019 The Three Brothers' Bond (Pirate Foil)
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 [Sabo], [Portgas.D.Ace], or [Monkey.D.Luffy] with a cost of 5 or less and add it to your hand. Then, place the rest at the bottom of your deck in any order.[Trigger] Activate this card's [Main] effect.
    {
      cardId: 'ST13-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st13-019-main-search',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 [Sabo], [Portgas.D.Ace], or [Monkey.D.Luffy] with a cost of 5 or less and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  name: ['Sabo', 'Portgas.D.Ace', 'Monkey.D.Luffy'],
                  costMax: 5,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st13-019-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'ST13-019',
                effectId: 'st13-019-main-search',
              },
            ],
          },
        },
      ],
    },
  ],
};
