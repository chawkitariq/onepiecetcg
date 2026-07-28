import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op01EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP01',
  cards: [
    // OP01-077 Perona (Box Topper)
    // [On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'OP01-077',
    },
    // OP01-015 Tony Tony.Chopper
    // [DON!! x1] [When Attacking] You may trash 1 card from your hand: Add up to 1 "Straw Hat Crew" type Character card other than [Tony Tony.Chopper] with a cost of 4 or less from your trash to your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-015',
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
    },
    {
      cardId: 'OP01-047',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'trafalgar-law-on-play',
        },
      ],
    },
    // OP01-051 Eustass"Captain"Kid
    // [DON!! x1] [Opponent's Turn] If this Character is rested, your opponent cannot attack any card other than the Character [Eustass"Captain"Kid]. [Activate:Main] [Once Per Turn] You may rest this Character: Play up to 1 Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP01-051',
    },
    // OP01-055 You Can Be My Samurai!! (Reprint)
    // [Main] You may rest 2 of your Characters: Draw 2 cards.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP01-055',
    },
    // OP01-013 Sanji (Parallel)
    // [Activate:Main] [Once Per Turn] You may add 1 card from your Life area to your hand: This Character gains +2000 power during this turn. Then, give this Character up to 2 rested DON!! cards.
    {
      cardId: 'OP01-013',
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
    },
    // OP01-114 X.Drake (114)
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Your opponent trashes 1 card from their hand.
    {
      cardId: 'OP01-114',
    },
    // OP01-079 Ms. All Sunday
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] If your Leader has the "Baroque Works" type, add up to 1 Event from your trash to your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-079',
    },
    // OP01-094 Kaido (094) (Parallel)
    // [On Play] DON!! -6 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the "Animal Kingdom Pirates" type, K.O. all Characters other than this Character.
    {
      cardId: 'OP01-094',
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
    },
    // OP01-096 King (096) (Parallel)
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 3 or less and up to 1 of your opponent's Characters with a cost of 2 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-096',
    },
    // OP01-121 Yamato (OP01-121) (Alternate Art)
    // Also treat this card's name as [Kouzuki Oden] according to the rules.[Double Attack] (This card deals 2 damage.)[Banish] (When this card deals damage, the target card is trashed without activating its Trigger.)
    {
      cardId: 'OP01-121',
    },
    // OP01-067 Crocodile (067) (Parallel)
    // [Banish] (When this card deals damage, the target card is trashed without activating its Trigger.) [DON!! x1] Give blue Events in your hand -1 cost.
    {
      cardId: 'OP01-067',
    },
    // OP01-075 Pacifista
    // Under the rules of this game, you may have any number of this card in your deck. [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP01-075',
    },
    // OP01-120 Shanks (Manga)
    // [Rush] (This card can attack on the turn in which it is played.)[When Attacking] Your opponent cannot activate a [Blocker] Character that has 2000 or less power during this battle.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP01-120',
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
    },
    // OP01-117 Sheep's Horn
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Rest up to 1 of your opponent's Characters with a cost of 6 or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-117',
    },
    // OP01-068 Gecko Moria
    // [Your Turn] This Character gains [Double Attack] if you have 5 or more cards in your hand. (This card deals 2 damage.)
    {
      cardId: 'OP01-068',
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
    },
    // OP01-119 Thunder Bagua
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 2 or less Life cards, add up to 1 DON!! card from your DON!! deck and rest it. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-119',
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
    },
    // OP01-060 Donquixote Doflamingo (OP01-060)
    // [DON!! x2] [When Attacking] [1] (You may rest the specified number of DON!! cards in your cost area.): Reveal 1 card from the top of your deck. If that card is a "The Seven Warlords of the Sea" type Character card with a cost of 4 or less, you may play that card rested.
    {
      cardId: 'OP01-060',
    },
    // OP01-112 Page One
    // [Activate:Main] [Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character can also attack your opponent's active Characters during this turn.
    {
      cardId: 'OP01-112',
    },
    // OP01-046 Denjiro
    // [DON!! x1] [When Attacking] If your Leader is [Kouzuki Oden], set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP01-046',
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
    },
    // OP01-074 Bartholomew Kuma
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] Play up to 1 [Pacifista] with a cost of 4 or less from your hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-074',
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
    },
    // OP01-071 Jinbe (071)
    // [On Play] Place up to 1 Character with a cost of 3 or less at the bottom of the owner's deck. [Trigger] Play this card.  This card has been officially errata'd.
    {
      cardId: 'OP01-071',
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
    },
    // OP01-061 Kaido (061) (Parallel)
    // [DON!! x1] [Your Turn] [Once Per Turn] When your opponent's Character is K.O.'d, add up to 1 DON!! card from your DON!! deck and set it as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-061',
    },
    // OP01-064 Alvida (Box Topper)
    // [DON!! x1] [When Attacking] You may trash 1 card from your hand: Return up to 1 of your opponent's Characters with a cost of 3 or less to the owner's hand.  This card has been officially errata'd.
    {
      cardId: 'OP01-064',
    },
    // OP01-002 Trafalgar Law (002) (Parallel)
    // [Activate:Main] [Once Per Turn] (2) (You may rest the specified number of DON!! cards in your cost area): If you have 5 Characters, return 1 of your Characters to your hand. Then, play up to 1 Character with a cost of 5 or less from your hand that is a different color than the returned character.  This card has been officially errata'd.
    {
      cardId: 'OP01-002',
    },
    // OP01-063 Arlong
    // [DON!! x1] [Activate:Main] You may rest this Character: Choose 1 card from your opponent's hand; your opponent reveals that card. If the revealed card is an Event, place up to 1 card from your opponent's Life area at the bottom of the owner's deck.  This card has been officially errata'd.
    {
      cardId: 'OP01-063',
    },
    // OP01-004 Usopp
    // [DON!! x1] [Your Turn] [Once Per Turn] Draw 1 card when your opponent activates an Event.
    {
      cardId: 'OP01-004',
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
    },
    // OP01-118 Ulti-Mortar
    // [Counter] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, draw 1 card. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-118',
    },
    // OP01-003 Monkey.D.Luffy (003) (Parallel)
    // [Activate:Main] [Once Per Turn] (4) (You may rest the specified number of DON!! cards in your cost area): Set up to 1 of your "Supernova" or "Straw Hat Crew" type Character cards with a cost of 5 or less as active. It gains +1000 power during this turn.  This card has been officially errata'd.
    {
      cardId: 'OP01-003',
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
    },
    // OP01-019 Bartolomeo
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [DON!! x2] [Opponent's Turn] This Character gains +3000 power.
    {
      cardId: 'OP01-019',
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
    },
    // OP01-021 Franky
    // [DON!! x1] This Character can also attack your opponent's active Characters.
    {
      cardId: 'OP01-021',
    },
    // OP01-091 King (091) (Parallel)
    // [Your Turn] If you have 10 DON!! cards on your field, give all of your opponent's Characters -1000 power.
    {
      cardId: 'OP01-091',
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
    },
    // OP01-095 Kyoshirou
    // [On Play] Draw 1 card if you have 8 or more DON!! cards on your field.
    {
      cardId: 'OP01-095',
    },
    // OP01-109 Who's.Who
    // [DON!! x1] [Your Turn] If you have 8 or more DON!! cards on your field, this Character gains +1000 power.
    {
      cardId: 'OP01-109',
    },
    // OP01-098 Kurozumi Orochi
    // [On Play] Reveal up to 1 [Artificial Devil Fruit SMILE] from your deck and add it to your hand. Then, shuffle your deck.  This card has been officially errata'd.
    {
      cardId: 'OP01-098',
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
    },
    // OP01-115 Elephant's Marchoo
    // [Main] K.O. up to 1 of your opponent's Characters with a cost of 2 or less, then add up to 1 DON!! card from your DON!! deck and set it as active. [Trigger] Activate this card's [Main] effect.  This card has been officially errata'd.
    {
      cardId: 'OP01-115',
    },
    // OP01-085 Mr.3 (Galdino)
    // [On Play] If your Leader has the "Baroque Works" type, select up to 1 of your opponent's Characters with a cost of 4 or less. The selected Character cannot attack until the end of your opponent's next turn.  This card has been officially errata'd.
    {
      cardId: 'OP01-085',
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
    },
    // OP01-105 Bao Huang
    // [On Play] Choose 2 cards from your opponent's hand; your opponent reveals those cards.
    {
      cardId: 'OP01-105',
    },
    // OP01-083 Mr.1 (Daz.Bonez)
    // [DON!! x1] [Your Turn] If your Leader has the "Baroque Works" type, this Character gains +1000 power for every 2 Events in your trash.
    {
      cardId: 'OP01-083',
    },
    // OP01-028 Green Star Rafflesia
    // [Counter] Give up to 1 of your opponent's Leader or Character cards -2000 power during this turn. [Trigger] Activate this card's [Counter] effect.  This card has been officially errata'd.
    {
      cardId: 'OP01-028',
    },
    // OP01-008 Cavendish
    // [On Play] You may add 1 card from your Life area to your hand: This Character gains [Rush] during this turn. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP01-008',
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
    },
    // OP01-038 Kanjuro
    // [DON!! x1] [When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less. [On K.O.] Your opponent chooses 1 card from your hand; trash that card.  This card has been officially errata'd.
    {
      cardId: 'OP01-038',
    },
    // OP01-100 Kurozumi Higurashi
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP01-100',
    },
    // OP01-099 Kurozumi Semimaru
    // Kurozumi Clan type Characters other than your [Kurozumi Semimaru] cannot be K.O.'d in battle.
    {
      cardId: 'OP01-099',
    },
    // OP01-059 BE-BENG!!
    // [Main] You may trash 1 "Land of Wano" type card from your hand: Set up to 1 of your "Land of Wano" type Character cards with a cost of 3 or less as active.  This card has been officially errata'd.
    {
      cardId: 'OP01-059',
    },
    // OP01-062 Crocodile (062)
    // [DON!! x1] When you activate an Event, you may draw 1 card if you have 4 or less cards in your hand and haven't drawn a card using this Leader's effect during this turn.
    {
      cardId: 'OP01-062',
    },
    // OP01-007 Caribou
    // [On K.O.] K.O. up to 1 of your opponent's Characters with 4000 power or less.  This card has been officially errata'd.
    {
      cardId: 'OP01-007',
    },
    // OP01-042 Komurasaki
    // [On Play] (3) (You may rest the specified number of DON!! cards in your cost area): If your Leader is [Kouzuki Oden], set up to 1 of your "Land of Wano" type Character cards with a cost of 3 or less as active.
    {
      cardId: 'OP01-042',
    },
  ],
};
