import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op01EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP01',
  cards: [
    // OP01-077 Perona (Box Topper)
    // [On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'OP01-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'perona-on-play-arrange-top-5',
            text: '[On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 5 }],
          },
        },
      ],
    },
    // OP01-015 Tony Tony.Chopper
    // [DON!! x1] [When Attacking] You may trash 1 card from your hand: Add up to 1 "Straw Hat Crew" type Character card other than [Tony Tony.Chopper] with a cost of 4 or less from your trash to your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-when-attacking-trash-1-recover-straw-hat',
            text: '[DON!! x1] [When Attacking] You may trash 1 card from your hand: Add up to 1 "Straw Hat Crew" type Character card other than [Tony Tony.Chopper] with a cost of 4 or less from your trash to your hand.',
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Straw Hat Crew'],
                  costMax: 4,
                  excludeName: ['Tony Tony.Chopper'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP01-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'otama-on-play',
            text: '[On Play] Give up to 1 of your opponent Characters -2000 power during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-073 Donquixote Doflamingo (OP01-073)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'OP01-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-on-play-arrange-top-5',
            text: '[On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 5 }],
          },
        },
      ],
    },
    // OP01-033 Izo
    // [On Play] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP01-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'izo-on-play-rest-cost-4-or-less',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-029 Radical Beam!!
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 2 or less Life cards, that card gains an additional +2000 power. [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP01-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'radical-beam-counter-plus-2000',
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
            id: 'radical-beam-counter-additional-plus-2000',
            text: 'Then, if you have 2 or less Life cards, that card gains an additional +2000 power.',
            trigger: { type: 'activateCounter' },
            conditions: [{ type: 'playerHasLifeAtMost', player: 'self', value: 2 }],
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
            id: 'radical-beam-trigger-plus-1000',
            text: "[Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    {
      cardId: 'OP01-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-on-play',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} card and add it to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Straw Hat Crew'], excludeName: ['Nami'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP01-088 Desert Spada
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.  This card has been officially errata'd.
    {
      cardId: 'OP01-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'desert-spada-counter-plus-2000',
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
            id: 'desert-spada-counter-arrange-top-3',
            text: 'Then, look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'activateCounter' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 3 }],
          },
        },
      ],
    },
    // OP01-047 Trafalgar Law
    // [On Play] You may return 1 of your Characters to the owner's hand: Play up to 1 Character card with a cost of 5 or less from your hand.
    {
      cardId: 'OP01-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-on-play-return-1-character-play-cost-5-or-less',
            text: "[On Play] You may return 1 of your Characters to the owner's hand: Play up to 1 Character card with a cost of 5 or less from your hand.",
            trigger: { type: 'onPlay' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-051 Eustass"Captain"Kid
    // [DON!! x1] [Opponent's Turn] If this Character is rested, your opponent cannot attack any card other than the Character [Eustass"Captain"Kid]. [Activate:Main] [Once Per Turn] You may rest this Character: Play up to 1 Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP01-051',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'eustass-captain-kid-opponents-turn-must-be-attack-target',
            text: '[DON!! x1] [Opponent\'s Turn] If this Character is rested, your opponent cannot attack any card other than the Character [Eustass"Captain"Kid].',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: false },
              { type: 'sourceIsRested', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Eustass"Captain"Kid'] },
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'eustass-captain-kid-activate-main-rest-play-cost-3-or-less',
            text: '[Activate:Main] [Once Per Turn] You may rest this Character: Play up to 1 Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Eustass"Captain"Kid'], rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-055 You Can Be My Samurai!! (Reprint)
    // [Main] You may rest 2 of your Characters: Draw 2 cards.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP01-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'you-can-be-my-samurai-main-rest-2-draw-2',
            text: '[Main] You may rest 2 of your Characters: Draw 2 cards.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: false },
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP01-013 Sanji (Parallel)
    // [Activate:Main] [Once Per Turn] You may add 1 card from your Life area to your hand: This Character gains +2000 power during this turn. Then, give this Character up to 2 rested DON!! cards.
    {
      cardId: 'OP01-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-activate-main-life-to-hand-plus-2000-attach-2-don',
            text: '[Activate:Main] [Once Per Turn] You may add 1 card from your Life area to your hand: This Character gains +2000 power during this turn. Then, give this Character up to 2 rested DON!! cards.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
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
                  filter: { name: ['Sanji'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Sanji'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP01-041 Kouzuki Momonosuke
    // [Activate:Main] (1) (You may rest the specified number of DON!! cards in your cost area) You may rest this Character: Look at 5 cards from the top of your deck; reveal up to 1 "Land of Wano" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP01-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-momonosuke-activate-main-search-land-of-wano',
            text: '[Activate:Main] (1) You may rest this Character: Look at 5 cards from the top of your deck; reveal up to 1 "Land of Wano" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kouzuki Momonosuke'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Land of Wano'] },
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
    {
      cardId: 'OP01-025',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'zoro-plus-1000-during-your-turn',
            text: '[Your Turn] This Character gains +1000 power.',
            conditions: [{ type: 'controllerTurn', value: true }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Roronoa Zoro'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // OP01-049 Bepo
    // [DON!! x1] [When Attacking] Play up to 1 "Heart Pirates" type card other than [Bepo] with a cost of 4 or less from your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bepo-when-attacking-play-heart-pirates',
            text: '[DON!! x1] [When Attacking] Play up to 1 "Heart Pirates" type card other than [Bepo] with a cost of 4 or less from your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    trait: ['Heart Pirates'],
                    costMax: 4,
                    excludeName: ['Bepo'],
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
    // OP01-114 X.Drake (114)
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Your opponent trashes 1 card from their hand.
    {
      cardId: 'OP01-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'x-drake-on-play-don-minus-1-opponent-trashes-1',
            text: "[On Play] DON!! -1: Your opponent trashes 1 card from their hand.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-079 Ms. All Sunday
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] If your Leader has the "Baroque Works" type, add up to 1 Event from your trash to your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ms-all-sunday-on-ko-recover-event',
            text: '[On K.O.] If your Leader has the "Baroque Works" type, add up to 1 Event from your trash to your hand.',
            trigger: { type: 'onKo' },
            conditions: [{ type: 'playerHasLeaderTrait', player: 'self', value: 'Baroque Works' }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { cardCategory: ['Event'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP01-094 Kaido (094) (Parallel)
    // [On Play] DON!! -6 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the "Animal Kingdom Pirates" type, K.O. all Characters other than this Character.
    {
      cardId: 'OP01-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaido-on-play-don-minus-6-ko-all-other-characters',
            text: '[On Play] DON!! -6: If your Leader has the "Animal Kingdom Pirates" type, K.O. all Characters other than this Character.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 6 }],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            actions: [
              {
                type: 'koAllCharacters',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                excludeSource: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP01-078 Boa Hancock (OP01-078) (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[DON!! x1] [When Attacking]/[On Block] Draw 1 card if you have 5 or less cards in your hand.
    {
      cardId: 'OP01-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-when-attacking-draw-1',
            text: '[DON!! x1] [When Attacking] Draw 1 card if you have 5 or less cards in your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 5,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-on-block-draw-1',
            text: '[DON!! x1] [On Block] Draw 1 card if you have 5 or less cards in your hand.',
            trigger: { type: 'onBlock' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 5,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-070 Dracule Mihawk (OP01-070) (Alternate Art)
    // [On Play] Place up to 1 Character with a cost of 7 or less at the bottom of the owner's deck.
    {
      cardId: 'OP01-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dracule-mihawk-on-play-bottom-deck-cost-7-or-less',
            text: "[On Play] Place up to 1 Character with a cost of 7 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
            ],
          },
        },
      ],
    },
    // OP01-024 Monkey.D.Luffy
    // [DON!! x2] This Character cannot be K.O.'d in battle by "Strike" attribute Characters.   [Activate:Main] [Once Per Turn] Give this Character up to 2 rested DON!! cards.
    {
      cardId: 'OP01-024',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'luffy-don-2-cannot-be-koed-by-strike-in-battle',
            text: '[DON!! x2] This Character cannot be K.O.\'d in battle by "Strike" attribute Characters.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Monkey.D.Luffy'] },
              },
              keywords: ['cannotBeKoedByStrikeInBattle'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'luffy-activate-main-attach-up-to-2-rested-don',
            text: '[Activate:Main] [Once Per Turn] Give this Character up to 2 rested DON!! cards.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP01-096 King (096) (Parallel)
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 3 or less and up to 1 of your opponent's Characters with a cost of 2 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'king-on-play-don-minus-2-ko-cost-3-and-cost-2',
            text: "[On Play] DON!! -2: K.O. up to 1 of your opponent's Characters with a cost of 3 or less and up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
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
    // OP01-121 Yamato (OP01-121) (Alternate Art)
    // Also treat this card's name as [Kouzuki Oden] according to the rules.[Double Attack] (This card deals 2 damage.)[Banish] (When this card deals damage, the target card is trashed without activating its Trigger.)
    {
      cardId: 'OP01-121',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'yamato-has-double-attack-and-banish',
            text: '[Double Attack] [Banish]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Yamato'] },
              },
              keywords: ['doubleAttack', 'banish'],
            },
          },
        },
      ],
    },
    // OP01-067 Crocodile (067) (Parallel)
    // [Banish] (When this card deals damage, the target card is trashed without activating its Trigger.) [DON!! x1] Give blue Events in your hand -1 cost.
    {
      cardId: 'OP01-067',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'crocodile-has-banish',
            text: '[Banish]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Crocodile'] },
              },
              keywords: ['banish'],
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'crocodile-don-1-blue-events-in-hand-cost-minus-1',
            text: '[DON!! x1] Give blue Events in your hand -1 cost.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['hand'],
                filter: {
                  cardCategory: ['Event'],
                  color: ['Blue'],
                },
              },
              cost: -1,
            },
          },
        },
      ],
    },
    // OP01-075 Pacifista
    // Under the rules of this game, you may have any number of this card in your deck. [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP01-075',
      effects: [],
    },
    // OP01-120 Shanks (Manga)
    // [Rush] (This card can attack on the turn in which it is played.)[When Attacking] Your opponent cannot activate a [Blocker] Character that has 2000 or less power during this battle.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP01-120',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'shanks-has-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Shanks'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'shanks-when-attacking-opponent-small-blockers-cannot-block',
            text: "Your opponent cannot activate a [Blocker] Character that has 2000 or less power during this battle.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 2000,
                  },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP01-106 Basil Hawkins
    // [On Play] Add up to 1 DON!! card from your DON!! deck and rest it. [Trigger] Play this card.  This card has been officially errata'd.
    {
      cardId: 'OP01-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-on-play-add-rested-don',
            text: '[On Play] Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Basil Hawkins'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-058 Punk Gibson
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, rest up to 1 of your opponent's Characters with a cost of 4 or less. [Trigger] Rest up to 1 of your opponent's Characters.  This card has been officially errata'd.
    {
      cardId: 'OP01-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'punk-gibson-counter-plus-4000-then-rest',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
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
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'punk-gibson-trigger-rest-1',
            text: "[Trigger] Rest up to 1 of your opponent's Characters.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-054 X.Drake (054)
    // [On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'x-drake-on-play-ko-rested-cost-4-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
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
    // OP01-040 Kin'emon (Parallel)
    // [On Play] If your Leader is [Kouzuki Oden], play up to 1 "The Akazaya Nine" type Character card with a cost of 3 or less from your hand. [DON!! x1] [When Attacking] [Once Per Turn] Set up to 1 of your "The Akazaya Nine" type Character cards with a cost of 3 or less as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kinemon-on-play-play-akazaya',
            text: '[On Play] If your Leader is [Kouzuki Oden], play up to 1 "The Akazaya Nine" type Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'playerHasLeaderName', player: 'self', value: 'Kouzuki Oden' }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['The Akazaya Nine'],
                    costMax: 3,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kinemon-when-attacking-unrest-akazaya',
            text: '[DON!! x1] [When Attacking] [Once Per Turn] Set up to 1 of your "The Akazaya Nine" type Character cards with a cost of 3 or less as active.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['The Akazaya Nine'],
                    costMax: 3,
                    rested: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-117 Sheep's Horn
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Rest up to 1 of your opponent's Characters with a cost of 6 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sheeps-horn-main-don-minus-1-rest-cost-6-or-less',
            text: "[Main] DON!! -1: Rest up to 1 of your opponent's Characters with a cost of 6 or less.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-068 Gecko Moria
    // [Your Turn] This Character gains [Double Attack] if you have 5 or more cards in your hand. (This card deals 2 damage.)
    {
      cardId: 'OP01-068',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'gecko-moria-your-turn-gains-double-attack',
            text: '[Your Turn] This Character gains [Double Attack] if you have 5 or more cards in your hand.',
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['hand'] },
                value: 5,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Gecko Moria'] },
              },
              keywords: ['doubleAttack'],
            },
          },
        },
      ],
    },
    // OP01-026 Gum-Gum Fire-Fist Pistol Red Hawk
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, K.O. up to 1 of your opponent's Characters with 4000 power or less. [Trigger] Give up to 1 of your opponent's Leader or Character cards -10000 power during this turn.  This card has been officially errata'd.
    {
      cardId: 'OP01-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'red-hawk-trigger-minus-10000',
            text: "[Trigger] Give up to 1 of your opponent's Leader or Character cards -10000 power during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -10000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-101 Sasaki
    // [DON!! x1] [When Attacking] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and rest it.  This card has been officially errata'd.
    {
      cardId: 'OP01-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sasaki-when-attacking-trash-1-add-rested-don',
            text: '[DON!! x1] [When Attacking] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP01-001 Roronoa Zoro (001) (Parallel)
    // [DON!! x1] [Your Turn] All of your Characters gain +1000 power.
    {
      cardId: 'OP01-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'roronoa-zoro-your-turn-all-your-characters-plus-1000',
            text: '[DON!! x1] [Your Turn] All of your Characters gain +1000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // OP01-017 Nico Robin
    // [DON!! x1] [When Attacking] K.O. up to 1 of your opponent's Characters with 3000 power or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-when-attacking-ko-3000-or-less',
            text: "[DON!! x1] [When Attacking] K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 3000,
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
    // OP01-035 Okiku (SP)
    // [DON!! x1][When Attacking][Once Per Turn] Rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP01-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'okiku-when-attacking-rest-cost-5-or-less',
            text: "[DON!! x1] [When Attacking] [Once Per Turn] Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-119 Thunder Bagua
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 2 or less Life cards, add up to 1 DON!! card from your DON!! deck and rest it. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thunder-bagua-counter-plus-4000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle.',
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
            id: 'thunder-bagua-counter-add-rested-don',
            text: 'Then, if you have 2 or less Life cards, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateCounter' },
            conditions: [{ type: 'playerHasLifeAtMost', player: 'self', value: 2 }],
            actions: [{ type: 'addDon', player: 'self', amount: 1, rested: true }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'thunder-bagua-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1, rested: false }],
          },
        },
      ],
    },
    // OP01-022 Brook
    // [DON!! x1] [When Attacking] Give up to 2 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'OP01-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-when-attacking-minus-2000-to-up-to-2',
            text: "[DON!! x1] [When Attacking] Give up to 2 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 2 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-086 Overheat
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, return up to 1 active Character with a cost of 3 or less to the owner's hand. [Trigger] Return up to 1 card with a cost of 4 or less to the owner's hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'overheat-counter-plus-4000-then-bounce',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, return up to 1 active Character with a cost of 3 or less to the owner's hand.",
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
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                    rested: false,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'overheat-trigger-bounce-cost-4-or-less',
            text: "[Trigger] Return up to 1 card with a cost of 4 or less to the owner's hand.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters', 'stage'],
                  filter: { costMax: 4 },
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
    // OP01-060 Donquixote Doflamingo (OP01-060)
    // [DON!! x2] [When Attacking] [1] (You may rest the specified number of DON!! cards in your cost area.): Reveal 1 card from the top of your deck. If that card is a "The Seven Warlords of the Sea" type Character card with a cost of 4 or less, you may play that card rested.
    {
      cardId: 'OP01-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'doflamingo-don-2-when-attacking-pay-1-reveal-top-and-play-warlord',
            text: 'Reveal 1 card from the top of your deck. If that card is a "The Seven Warlords of the Sea" type Character card with a cost of 4 or less, you may play that card rested.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'revealTopAndPlayIfMatches',
                player: 'self',
                filter: {
                  cardCategory: ['Character'],
                  trait: ['The Seven Warlords of the Sea'],
                  costMax: 4,
                },
                destination: 'characters',
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP01-112 Page One
    // [Activate:Main] [Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character can also attack your opponent's active Characters during this turn.
    {
      cardId: 'OP01-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'page-one-activate-main-don-minus-1-attack-active',
            text: "[Activate:Main] [Once Per Turn] DON!! -1: This Character can also attack your opponent's active Characters during this turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Page One'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-046 Denjiro
    // [DON!! x1] [When Attacking] If your Leader is [Kouzuki Oden], set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP01-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'denjiro-when-attacking-unrest-2-don',
            text: '[DON!! x1] [When Attacking] If your Leader is [Kouzuki Oden], set up to 2 of your DON!! cards as active.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasLeaderName', player: 'self', value: 'Kouzuki Oden' },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-057 Paradise Waterfall
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, set up to 1 of your Characters as active. [Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'paradise-waterfall-trigger-ko-rested-cost-4-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
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
    // OP01-093 Ulti (Parallel)
    // [On Play] (1) (You may rest the specified number of DON!! cards in your cost area.): Add up to 1 DON!! card from your DON!! deck and rest it.  This card has been officially errata'd.
    {
      cardId: 'OP01-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ulti-on-play-pay-1-add-rested-don',
            text: '[On Play] (1): Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP01-027 Round Table
    // [Main] Give up to 1 of your opponent's Characters -10000 power during this turn.  This card has been officially errata'd.
    {
      cardId: 'OP01-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'round-table-main-minus-10000',
            text: "[Main] Give up to 1 of your opponent's Characters -10000 power during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -10000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-005 Uta
    // [On Play] Add up to 1 red Character card other than [Uta] with a cost of 3 or less from your trash to your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uta-on-play-recover-red-character-from-trash',
            text: '[On Play] Add up to 1 red Character card other than [Uta] with a cost of 3 or less from your trash to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  color: ['Red'],
                  costMax: 3,
                  excludeName: ['Uta'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP01-030 In Two Years!! At the Sabaody Archipelago!!
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order. [Trigger] Activate this card's [Main] effect.  This card has been officially errata'd.
    {
      cardId: 'OP01-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'in-two-years-main-search-straw-hat-character',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Straw Hat Crew'],
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
            id: 'in-two-years-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP01-030',
                effectId: 'in-two-years-main-search-straw-hat-character',
              },
            ],
          },
        },
      ],
    },
    // OP01-097 Queen (Parallel)
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character gains [Rush] during this turn. Then, give up to 1 of your opponent's Characters -2000 power during this turn. (This card can attack on the turn in which it is played.)  This card has been officially errata'd.
    {
      cardId: 'OP01-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'queen-on-play-don-minus-1-rush-and-minus-2000',
            text: "[On Play] DON!! -1: This Character gains [Rush] during this turn. Then, give up to 1 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Queen'] },
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-048 Nekomamushi (Box Topper)
    // [On Play] Rest up to 1 of your opponent's Characters with a cost of 3 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nekomamushi-on-play-rest-cost-3-or-less',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-111 Black Maria
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Block] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character gains +1000 power during this turn.
    {
      cardId: 'OP01-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'black-maria-on-block-don-minus-1-plus-1000',
            text: '[On Block] DON!! -1: This Character gains +1000 power during this turn.',
            trigger: { type: 'onBlock' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Black Maria'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-074 Bartholomew Kuma
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] Play up to 1 [Pacifista] with a cost of 4 or less from your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-on-ko-play-pacifista',
            text: '[On K.O.] Play up to 1 [Pacifista] with a cost of 4 or less from your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    name: ['Pacifista'],
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
    // OP01-039 Killer (Reprint)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[DON!! x1] [On Block] If you have 3 or more Characters, draw 1 card.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP01-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'killer-on-block-draw-1',
            text: '[DON!! x1] [On Block] If you have 3 or more Characters, draw 1 card.',
            trigger: { type: 'onBlock' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 3,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-102 Jack (Parallel)
    // [When Attacking] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Your opponent trashes 1 card from their hand.
    {
      cardId: 'OP01-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jack-when-attacking-don-minus-1-opponent-trashes-1',
            text: '[When Attacking] DON!! -1: Your opponent trashes 1 card from their hand.',
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-071 Jinbe (071)
    // [On Play] Place up to 1 Character with a cost of 3 or less at the bottom of the owner's deck. [Trigger] Play this card.  This card has been officially errata'd.
    {
      cardId: 'OP01-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-on-play-bottom-deck-cost-3-or-less',
            text: "[On Play] Place up to 1 Character with a cost of 3 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Jinbe'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-034 Inuarashi (Box Topper)
    // [DON!! x2] [When Attacking] Set up to 1 of your DON!! cards as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inuarashi-when-attacking-unrest-don',
            text: '[DON!! x2] [When Attacking] Set up to 1 of your DON!! cards as active.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-116 Artificial Devil Fruit SMILE
    // [Main] Look at 5 cards from the top of your deck; play up to 1 "SMILE" type Character card with a cost of 3 or less. Then, place the rest at the bottom of your deck in any order.  This card has been officially errata'd.
    {
      cardId: 'OP01-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'artificial-devil-fruit-smile-main-play-smile',
            text: '[Main] Look at 5 cards from the top of your deck; play up to 1 "SMILE" type Character card with a cost of 3 or less. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['SMILE'],
                  costMax: 3,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP01-031 Kouzuki Oden (Parallel)
    // [Activate:Main] [Once Per Turn] You can trash 1 "Land of Wano" type card from your hand: Set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP01-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-oden-activate-main-unrest-2-don',
            text: '[Activate:Main] [Once Per Turn] You can trash 1 "Land of Wano" type card from your hand: Set up to 2 of your DON!! cards as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-108 Hitokiri Kamazo
    // [On K.O.] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck): K.O. up to 1 of your opponent's Characters with a cost of 5 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hitokiri-kamazo-on-ko-don-minus-1-ko-cost-5-or-less',
            text: "[On K.O.] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'onKo' },
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
    // OP01-061 Kaido (061) (Parallel)
    // [DON!! x1] [Your Turn] [Once Per Turn] When your opponent's Character is K.O.'d, add up to 1 DON!! card from your DON!! deck and set it as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaido-on-opponent-ko-add-active-don',
            text: "[DON!! x1] [Your Turn] [Once Per Turn] When your opponent's Character is K.O.'d, add up to 1 DON!! card from your DON!! deck and set it as active.",
            trigger: { type: 'onKo', oncePerTurn: true },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'opponent' },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
      ],
    },
    // OP01-064 Alvida (Box Topper)
    // [DON!! x1] [When Attacking] You may trash 1 card from your hand: Return up to 1 of your opponent's Characters with a cost of 3 or less to the owner's hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'alvida-when-attacking-trash-1-bounce-cost-3-or-less',
            text: "[DON!! x1] [When Attacking] You may trash 1 card from your hand: Return up to 1 of your opponent's Characters with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
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
    // OP01-002 Trafalgar Law (002) (Parallel)
    // [Activate:Main] [Once Per Turn] (2) (You may rest the specified number of DON!! cards in your cost area): If you have 5 Characters, return 1 of your Characters to your hand. Then, play up to 1 Character with a cost of 5 or less from your hand that is a different color than the returned character.  This card has been officially errata'd.
    {
      cardId: 'OP01-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-activate-main-pay-2-return-character-play-different-color',
            text: 'If you have 5 Characters, return 1 of your Characters to your hand. Then, play up to 1 Character with a cost of 5 or less from your hand that is a different color than the returned character.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 5,
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'returnedCharacter',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'returnedCharacter',
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                    differentColorThanStoredSelection: 'returnedCharacter',
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
    // OP01-063 Arlong
    // [DON!! x1] [Activate:Main] You may rest this Character: Choose 1 card from your opponent's hand; your opponent reveals that card. If the revealed card is an Event, place up to 1 card from your opponent's Life area at the bottom of the owner's deck.  This card has been officially errata'd.
    {
      cardId: 'OP01-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'arlong-don-1-activate-main-reveal-opponent-hand-card-and-bottom-life-if-event',
            text: "Choose 1 card from your opponent's hand; your opponent reveals that card. If the revealed card is an Event, place up to 1 card from your opponent's Life area at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Arlong'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'revealedOpponentHandCard',
                selector: {
                  player: 'opponent',
                  chooser: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'revealStoredCards',
                key: 'revealedOpponentHandCard',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'revealedOpponentHandCard',
                filter: { cardCategory: ['Event'] },
                actions: [
                  {
                    type: 'moveCard',
                    selector: {
                      player: 'opponent',
                      zones: ['life'],
                      count: { kind: 'upTo', value: 1 },
                    },
                    destinationPlayer: 'selectedCardOwner',
                    destinationZone: 'deck',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP01-004 Usopp
    // [DON!! x1] [Your Turn] [Once Per Turn] Draw 1 card when your opponent activates an Event.
    {
      cardId: 'OP01-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopp-on-opponent-event-activate-draw-1',
            text: '[DON!! x1] [Your Turn] [Once Per Turn] Draw 1 card when your opponent activates an Event.',
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'opponent' },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-011 Gordon
    // [On Play] You may place 1 card from your hand at the bottom of your deck: Draw 1 card.
    {
      cardId: 'OP01-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gordon-on-play-bottom-deck-1-draw-1',
            text: '[On Play] You may place 1 card from your hand at the bottom of your deck: Draw 1 card.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-084 Mr.2.Bon.Kurei (Bentham)
    // [DON!! x1] [When Attacking] Look at 5 cards from the top of your deck; reveal up to 1 "Baroque Works" type Event card and add it to your hand. Then, place the rest at the bottom of your deck in any order.  This card has been officially errata'd.
    {
      cardId: 'OP01-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-2-bon-kurei-when-attacking-search-baroque-event',
            text: '[DON!! x1] [When Attacking] Look at 5 cards from the top of your deck; reveal up to 1 "Baroque Works" type Event card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Event'],
                  trait: ['Baroque Works'],
                },
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
    // OP01-069 Caesar Clown
    // [On K.O.] Play up to 1 [Smiley] from your deck, then shuffle your deck.  This card has been officially errata'd.
    {
      cardId: 'OP01-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'caesar-clown-on-ko-play-smiley-then-shuffle',
            text: '[On K.O.] Play up to 1 [Smiley] from your deck, then shuffle your deck.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  name: ['Smiley'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
              },
              { type: 'shuffleDeck', player: 'self' },
            ],
          },
        },
      ],
    },
    // OP01-118 Ulti-Mortar
    // [Counter] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, draw 1 card. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ulti-mortar-counter-don-minus-2-plus-2000-draw-1',
            text: '[Counter] DON!! -2: Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, draw 1 card.',
            trigger: { type: 'activateCounter' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
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
              { type: 'draw', player: 'self', amount: 1 },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ulti-mortar-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1, rested: false }],
          },
        },
      ],
    },
    // OP01-003 Monkey.D.Luffy (003) (Parallel)
    // [Activate:Main] [Once Per Turn] (4) (You may rest the specified number of DON!! cards in your cost area): Set up to 1 of your "Supernova" or "Straw Hat Crew" type Character cards with a cost of 5 or less as active. It gains +1000 power during this turn.  This card has been officially errata'd.
    {
      cardId: 'OP01-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-activate-main-pay-4-unrest-and-plus-1000',
            text: '[Activate:Main] [Once Per Turn] (4): Set up to 1 of your "Supernova" or "Straw Hat Crew" type Character cards with a cost of 5 or less as active. It gains +1000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 4 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Supernova', 'Straw Hat Crew'],
                    costMax: 5,
                    rested: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Supernova', 'Straw Hat Crew'],
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP01-052 Raizo (Reprint)
    // [When Attacking] [Once Per Turn] If you have 2 or more rested Characters, draw 1 card.Disclaimer: This card was reprinted from the original set with changes to the artist credit (note the lack of pen symbol next to the artist name).
    {
      cardId: 'OP01-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'raizo-when-attacking-draw-1',
            text: '[When Attacking] [Once Per Turn] If you have 2 or more rested Characters, draw 1 card.',
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: true },
                },
                value: 2,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-056 Demon Face
    // [Main] K.O. up to 2 of your opponent's rested Characters with a cost of 5 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'demon-face-main-ko-up-to-2-rested-cost-5-or-less',
            text: "[Main] K.O. up to 2 of your opponent's rested Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 2 },
                },
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP01-019 Bartolomeo
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [DON!! x2] [Opponent's Turn] This Character gains +3000 power.
    {
      cardId: 'OP01-019',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'bartolomeo-opponents-turn-plus-3000',
            text: "[DON!! x2] [Opponent's Turn] This Character gains +3000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'controllerTurn', value: false },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Bartolomeo'] },
              },
              power: 3000,
            },
          },
        },
      ],
    },
    // OP01-090 Baroque Works
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 "Baroque Works" type card other than [Baroque Works] and add it to your hand. Then, place the rest at the bottom of your deck in any order.  This card has been officially errata'd.
    {
      cardId: 'OP01-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baroque-works-main-search-baroque-card',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 "Baroque Works" type card other than [Baroque Works] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Baroque Works'],
                  excludeName: ['Baroque Works'],
                },
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
    // OP01-089 Crescent Cutlass
    // [Counter] If your Leader has the "The Seven Warlords of the Sea" type, return up to 1 Character with a cost of 5 or less to the owner's hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-089',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crescent-cutlass-counter-bounce-cost-5-or-less',
            text: '[Counter] If your Leader has the "The Seven Warlords of the Sea" type, return up to 1 Character with a cost of 5 or less to the owner\'s hand.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'The Seven Warlords of the Sea',
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
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
    // OP01-021 Franky
    // [DON!! x1] This Character can also attack your opponent's active Characters.
    {
      cardId: 'OP01-021',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'franky-don-x1-can-attack-active-characters',
            text: "[DON!! x1] This Character can also attack your opponent's active Characters.",
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Franky'] },
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
      ],
    },
    // OP01-091 King (091) (Parallel)
    // [Your Turn] If you have 10 DON!! cards on your field, give all of your opponent's Characters -1000 power.
    {
      cardId: 'OP01-091',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'king-your-turn-total-don-10-minus-1000',
            text: "[Your Turn] If you have 10 DON!! cards on your field, give all of your opponent's Characters -1000 power.",
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 10 },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              power: -1000,
            },
          },
        },
      ],
    },
    // OP01-009 Carrot
    // [Trigger] Play this card.
    {
      cardId: 'OP01-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carrot-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Carrot'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-072 Smiley
    // [DON!! x1] [Your Turn] This Character gains +1000 power for every card in your hand.
    {
      cardId: 'OP01-072',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'smiley-your-turn-plus-1000-per-card-in-hand',
            text: '[DON!! x1] [Your Turn] This Character gains +1000 power for every card in your hand.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Smiley'] },
              },
              powerPerCount: {
                selector: { player: 'self', zones: ['hand'] },
                amount: 1000,
              },
            },
          },
        },
      ],
    },
    // OP01-082 Monet
    // [Trigger] Play this card.
    {
      cardId: 'OP01-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monet-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Monet'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-014 Jinbe (014)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [DON!! x1] [On Block] Play up to 1 red Character card with a cost of 2 or less from your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-on-block-play-red-cost-2-or-less',
            text: '[DON!! x1] [On Block] Play up to 1 red Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'onBlock' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    costMax: 2,
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
    // OP01-095 Kyoshirou
    // [On Play] Draw 1 card if you have 8 or more DON!! cards on your field.
    {
      cardId: 'OP01-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kyoshirou-on-play-draw-1-if-total-don-8',
            text: '[On Play] Draw 1 card if you have 8 or more DON!! cards on your field.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 }],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-109 Who's.Who
    // [DON!! x1] [Your Turn] If you have 8 or more DON!! cards on your field, this Character gains +1000 power.
    {
      cardId: 'OP01-109',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'whos-who-your-turn-total-don-8-plus-1000',
            text: '[DON!! x1] [Your Turn] If you have 8 or more DON!! cards on your field, this Character gains +1000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ["Who's.Who"] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // OP01-098 Kurozumi Orochi
    // [On Play] Reveal up to 1 [Artificial Devil Fruit SMILE] from your deck and add it to your hand. Then, shuffle your deck.  This card has been officially errata'd.
    {
      cardId: 'OP01-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kurozumi-orochi-on-play-search-smile-then-shuffle',
            text: '[On Play] Reveal up to 1 [Artificial Devil Fruit SMILE] from your deck and add it to your hand. Then, shuffle your deck.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 99,
                filter: { name: ['Artificial Devil Fruit SMILE'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
              },
              { type: 'shuffleDeck', player: 'self' },
            ],
          },
        },
      ],
    },
    // OP01-037 Kawamatsu
    // [Trigger] Play this card.
    {
      cardId: 'OP01-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kawamatsu-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Kawamatsu'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-080 Miss Doublefinger(Zala)
    // [On K.O.] Draw a card.
    {
      cardId: 'OP01-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-doublefinger-on-ko-draw-1',
            text: '[On K.O.] Draw a card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-044 Shachi
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] If you don't have [Penguin], play up to 1 [Penguin] from your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shachi-on-play-if-no-penguin-play-penguin',
            text: "[On Play] If you don't have [Penguin], play up to 1 [Penguin] from your hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Penguin'] },
                },
                value: 0,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Penguin'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-020 Hyogoro
    // [Activate:Main] You may rest this Character: Up to 1 of your Leader or Character cards gains +2000 power during this turn.  This card has been officially errata'd.
    {
      cardId: 'OP01-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hyogoro-activate-main-plus-2000',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your Leader or Character cards gains +2000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Hyogoro'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
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
    // OP01-050 Penguin
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] If you don't have [Shachi], play up to 1 [Shachi] from your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'penguin-on-play-if-no-shachi-play-shachi',
            text: "[On Play] If you don't have [Shachi], play up to 1 [Shachi] from your hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Shachi'] },
                },
                value: 0,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Shachi'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-115 Elephant's Marchoo
    // [Main] K.O. up to 1 of your opponent's Characters with a cost of 2 or less, then add up to 1 DON!! card from your DON!! deck and set it as active. [Trigger] Activate this card's [Main] effect.  This card has been officially errata'd.
    {
      cardId: 'OP01-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'elephants-marchoo-main-ko-cost-2-or-less-add-active-don',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost of 2 or less, then add up to 1 DON!! card from your DON!! deck and set it as active.",
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
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'elephants-marchoo-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP01-115',
                effectId: 'elephants-marchoo-main-ko-cost-2-or-less-add-active-don',
              },
            ],
          },
        },
      ],
    },
    // OP01-085 Mr.3 (Galdino)
    // [On Play] If your Leader has the "Baroque Works" type, select up to 1 of your opponent's Characters with a cost of 4 or less. The selected Character cannot attack until the end of your opponent's next turn.  This card has been officially errata'd.
    {
      cardId: 'OP01-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-3-on-play-restrict-attack-until-next-turn',
            text: '[On Play] If your Leader has the "Baroque Works" type, select up to 1 of your opponent\'s Characters with a cost of 4 or less. The selected Character cannot attack until the end of your opponent\'s next turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
              },
            ],
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 1,
              },
            ],
          },
        },
      ],
    },
    // OP01-104 Speed
    // [Trigger] Play this card.
    {
      cardId: 'OP01-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'speed-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Speed'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP01-032 Ashura Doji
    // [DON!! x1] If your opponent has 2 or more rested Characters, this Character gains +2000 power.
    {
      cardId: 'OP01-032',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'ashura-doji-plus-2000-if-opponent-has-2-rested-characters',
            text: "[DON!! x1] If your opponent has 2 or more rested Characters, this Character gains +2000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: true },
                },
                value: 2,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Ashura Doji'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // OP01-105 Bao Huang
    // [On Play] Choose 2 cards from your opponent's hand; your opponent reveals those cards.
    {
      cardId: 'OP01-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bao-huang-on-play-reveal-2-opponent-hand-cards',
            text: "Choose 2 cards from your opponent's hand; your opponent reveals those cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'revealedOpponentHandCards',
                selector: {
                  player: 'opponent',
                  chooser: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
              },
              {
                type: 'revealStoredCards',
                key: 'revealedOpponentHandCards',
              },
            ],
          },
        },
      ],
    },
    // OP01-083 Mr.1 (Daz.Bonez)
    // [DON!! x1] [Your Turn] If your Leader has the "Baroque Works" type, this Character gains +1000 power for every 2 Events in your trash.
    {
      cardId: 'OP01-083',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'mr-1-your-turn-plus-1000-per-2-events-in-trash',
            text: '[DON!! x1] [Your Turn] If your Leader has the "Baroque Works" type, this Character gains +1000 power for every 2 Events in your trash.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Mr.1 (Daz.Bonez)'] },
              },
              powerPerCount: {
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { cardCategory: ['Event'] },
                },
                amount: 1000,
                divisor: 2,
              },
            },
          },
        },
      ],
    },
    // OP01-028 Green Star Rafflesia
    // [Counter] Give up to 1 of your opponent's Leader or Character cards -2000 power during this turn. [Trigger] Activate this card's [Counter] effect.  This card has been officially errata'd.
    {
      cardId: 'OP01-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'green-star-rafflesia-counter-minus-2000',
            text: "[Counter] Give up to 1 of your opponent's Leader or Character cards -2000 power during this turn.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'green-star-rafflesia-trigger-activate-counter',
            text: "[Trigger] Activate this card's [Counter] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP01-028',
                effectId: 'green-star-rafflesia-counter-minus-2000',
              },
            ],
          },
        },
      ],
    },
    // OP01-008 Cavendish
    // [On Play] You may add 1 card from your Life area to your hand: This Character gains [Rush] during this turn. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP01-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cavendish-on-play-life-to-hand-gain-rush',
            text: '[On Play] You may add 1 card from your Life area to your hand: This Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Cavendish'] },
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
    // OP01-113 Holedem
    // [On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it.  This card has been officially errata'd.
    {
      cardId: 'OP01-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'holedem-on-ko-add-rested-don',
            text: '[On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP01-087 Officer Agents
    // [Counter] Play up to 1 "Baroque Works" type card with a cost of 3 or less from your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-087',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'officer-agents-counter-play-baroque-works-cost-3-or-less',
            text: '[Counter] Play up to 1 "Baroque Works" type card with a cost of 3 or less from your hand.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    trait: ['Baroque Works'],
                    costMax: 3,
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
    // OP01-038 Kanjuro
    // [DON!! x1] [When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less. [On K.O.] Your opponent chooses 1 card from your hand; trash that card.  This card has been officially errata'd.
    {
      cardId: 'OP01-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kanjuro-when-attacking-ko-rested-cost-2-or-less',
            text: "[DON!! x1] [When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 2,
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
            id: 'kanjuro-on-ko-opponent-chooses-hand-card-to-trash',
            text: '[On K.O.] Your opponent chooses 1 card from your hand; trash that card.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  chooser: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-100 Kurozumi Higurashi
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP01-100',
      effects: [],
    },
    // OP01-099 Kurozumi Semimaru
    // Kurozumi Clan type Characters other than your [Kurozumi Semimaru] cannot be K.O.'d in battle.
    {
      cardId: 'OP01-099',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kurozumi-semimaru-kurozumi-clan-cannot-be-koed-in-battle',
            text: "Kurozumi Clan type Characters other than your [Kurozumi Semimaru] cannot be K.O.'d in battle.",
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  trait: ['Kurozumi Clan'],
                  excludeName: ['Kurozumi Semimaru'],
                },
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // OP01-059 BE-BENG!!
    // [Main] You may trash 1 "Land of Wano" type card from your hand: Set up to 1 of your "Land of Wano" type Character cards with a cost of 3 or less as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'be-beng-main-trash-land-of-wano-unrest-character',
            text: '[Main] You may trash 1 "Land of Wano" type card from your hand: Set up to 1 of your "Land of Wano" type Character cards with a cost of 3 or less as active.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Land of Wano'],
                    costMax: 3,
                    rested: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP01-062 Crocodile (062)
    // [DON!! x1] When you activate an Event, you may draw 1 card if you have 4 or less cards in your hand and haven't drawn a card using this Leader's effect during this turn.
    {
      cardId: 'OP01-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-on-your-event-activate-draw-1',
            text: '[DON!! x1] When you activate an Event, you may draw 1 card if you have 4 or less cards in your hand and haven\'t drawn a card using this Leader\'s effect during this turn.',
            trigger: { type: 'onEventActivated', optional: true, oncePerTurn: true },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 4,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP01-007 Caribou
    // [On K.O.] K.O. up to 1 of your opponent's Characters with 4000 power or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'caribou-on-ko-ko-power-4000-or-less',
            text: "[On K.O.] K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 4000 },
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
    // OP01-042 Komurasaki
    // [On Play] (3) (You may rest the specified number of DON!! cards in your cost area): If your Leader is [Kouzuki Oden], set up to 1 of your "Land of Wano" type Character cards with a cost of 3 or less as active.
    {
      cardId: 'OP01-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'komurasaki-on-play-pay-3-unrest-land-of-wano',
            text: '[On Play] (3): If your Leader is [Kouzuki Oden], set up to 1 of your "Land of Wano" type Character cards with a cost of 3 or less as active.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 3 }],
            conditions: [{ type: 'playerHasLeaderName', player: 'self', value: 'Kouzuki Oden' }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Land of Wano'],
                    costMax: 3,
                    rested: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
  ],
};
