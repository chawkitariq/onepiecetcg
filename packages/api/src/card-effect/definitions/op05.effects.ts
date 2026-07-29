import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op05EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP05',
  cards: [
    // OP05-105 Satori (Full Art)
    // [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP05-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'satori-105-trigger-trash-1-play-this-card',
            text: '[Trigger] You may trash 1 card from your hand: Play this card.',
            trigger: { type: 'trigger', optional: true },
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
                type: 'play',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP05-101 Ohm
    // If you have 2 or less Life cards, this Character gains +1000 power. [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Holly] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Holly] from your hand.
    {
      cardId: 'OP05-101',
    },
    // OP05-091 Rebecca (SP)
    // [Blocker][On Play] Add up to 1 black Character card with a cost of 3 to 7 other than [Rebecca] from your trash to your hand. Then, play up to 1 black Character card with a cost of 3 or less from your hand rested.
    {
      cardId: 'OP05-091',
    },
    // OP05-106 Shura
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Sky Island] type card other than [Shura] and add it to your hand. Then, place the rest at the bottom of your deck in any order. [Trigger] Play this card.
    {
      cardId: 'OP05-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shura-106-on-play-search-top-5-sky-island',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Sky Island] type card other than [Shura] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Sky Island'],
                  excludeName: ['Shura'],
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
            id: 'shura-106-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP05-074 Eustass"Captain"Kid (OP05-074) (Manga)
    // [Blocker][Your Turn][Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, add up to 1 DON!! card from your DON!! deck and set it as active.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP05-074',
    },
    // OP05-037 Because the Side of Justice Will Be Whichever Side Wins!! (Reprint)
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP05-037',
    },
    // OP05-114 El Thor
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if your opponent has 2 or less Life cards, that card gains an additional +2000 power during this battle. [Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life Cards.
    {
      cardId: 'OP05-114',
    },
    // OP05-006 Koala - OP05-006
    // [On Play] If your Leader has the [Revolutionary Army] type, give up to 1 of your opponent's Characters -3000 power during this turn.
    {
      cardId: 'OP05-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koala-006-on-play-if-revolutionary-army-minus-3000',
            text: '[On Play] If your Leader has the [Revolutionary Army] type, give up to 1 of your opponent\'s Characters -3000 power during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP05-034 Baby 5 (OP05-034) (Full Art)
    // [Activate:Main] (1) (You may rest the specified number of DON!! cards in your cost area.) You may rest this Character: Look at 5 cards from the top of your deck; reveal up to 1 [Donquixote Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP05-034',
    },
    // OP05-093 Rob Lucci (SP)
    // [On Play] You may place 3 cards from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent's Characters with a cost of 2 or less and up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP05-093',
    },
    // OP05-030 Donquixote Rosinante (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[Opponent's Turn] If your rested Character would be K.O.'d, you may trash this Character instead.
    {
      cardId: 'OP05-030',
    },
    // OP05-102 Gedatsu (Reprint)
    // [On Play] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-102',
    },
    // OP05-017 Lindbergh
    // [When Attacking] If this Character has 7000 power or more, K.O. up to 1 of your opponent's Characters with 3000 power or less. [Trigger] You may trash 1 card from your hand: If your Leader is multicolored, play this card.
    {
      cardId: 'OP05-017',
    },
    // OP05-005 Karasu
    // [On Play] If your Leader has the [Revolutionary Army] type, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn. [When Attacking] If this Character has 7000 power or more, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn.
    {
      cardId: 'OP05-005',
    },
    // OP05-069 Trafalgar Law (OP05-069) (Manga)
    // [When Attacking] If your opponent has more DON!! cards on their field than you, look at 5 cards from the top of your deck; reveal up to 1 [Heart Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP05-069',
    },
    // OP05-118 Kaido (OP05-118) (Alternate Art)
    // [On Play] Draw 4 cards if your opponent has 3 or less Life cards.
    {
      cardId: 'OP05-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaido-118-on-play-if-opponent-life-3-or-less-draw-4',
            text: '[On Play] Draw 4 cards if your opponent has 3 or less Life cards.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'playerHasLifeAtMost', player: 'opponent', value: 3 }],
            actions: [{ type: 'draw', player: 'self', amount: 4 }],
          },
        },
      ],
    },
    // OP05-115 Two-Hundred Million Volts Amaru
    // [Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if you have 1 or less Life cards, rest up to 1 of your opponent's Characters with a cost of 4 or less.   [Trigger] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP05-115',
    },
    // OP05-100 Enel (100) (SP)
    // [Rush] [Once Per Turn] If this Character would leave the field, you may trash 1 card from the top of your Life cards instead. If there is a [Monkey.D.Luffy] Character, this effect is negated.
    {
      cardId: 'OP05-100',
    },
    // OP05-051 Borsalino (SP)
    // [On Play] Place up to 1 Character with a cost of 4 or less at the bottom of the owner's deck.
    {
      cardId: 'OP05-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'borsalino-051-on-play-bottom-deck-cost-4-or-less',
            text: "[On Play] Place up to 1 Character with a cost of 4 or less at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP05-081 One-Legged Toy Soldier (Alternate Art)
    // [Activate:Main] You may trash this Character: Give up to 1 of your opponent's Characters -3 cost during this turn.
    {
      cardId: 'OP05-081',
    },
    // OP05-043 Ulti (Alternate Art)
    // [On Play] If your Leader is multicolored, look at 3 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the top or bottom of the deck in any order.
    {
      cardId: 'OP05-043',
    },
    // OP05-016 Morley
    // [When Attacking] If this Character has 7000 power or more, your opponent cannot activate [Blocker] during this battle. [Trigger] You may trash 1 card from your hand: If your Leader is multicolored, play this card.
    {
      cardId: 'OP05-016',
    },
    // OP05-015 Belo Betty (Alternate Art)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Revolutionary Army] type card other than [Belo Betty] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP05-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'belo-betty-015-on-play-search-top-5-revolutionary-army',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Revolutionary Army] type card other than [Belo Betty] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Revolutionary Army'],
                  excludeName: ['Belo Betty'],
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
    // OP05-067 Zoro-Juurou (OP05-067)
    // [When Attacking] If you have 3 or less Life cards, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP05-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zoro-juurou-067-when-attacking-if-life-3-or-less-add-active-don',
            text: '[When Attacking] If you have 3 or less Life cards, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'playerHasLifeAtMost', player: 'self', value: 3 }],
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP05-119 Monkey.D.Luffy (OP05-119) (Manga)
    // [On Play] DON!! -10: Place all of your Characters except this Character at the bottom of your deck in any order. Then, take an extra turn after this one.[Activate:Main][Once Per Turn] (1): Add up to 1 DON!! card from your DON!! deck and set it as active.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP05-119',
    },
    // OP05-004 Emporio.Ivankov (Reprint)
    // [Activate:Main][Once Per Turn] If this Character has 7000 power or more, play up to 1 [Revolutionary Army] type Character card with 5000 power or less other than [Emporio.Ivankov] from your hand.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-004',
    },
    // OP05-073 Miss Doublefinger(Zala) (Reprint)
    // [On Play] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and rest it.[Trigger] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.Disclaimer: This card was reprinted from the original set with changes to the artist credit (note the lack of pen symbol next to the artist name).
    {
      cardId: 'OP05-073',
    },
    // OP05-076 When You're at Sea You Fight against Pirates!!
    // [Main] Look at 3 cards from the top of your deck; reveal up to 1 "Straw Hat Crew", "Kid Pirates", or "Heart Pirates" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP05-076',
    },
    // OP05-010 Nico Robin (Reprint)
    // [On Play] K.O. up to 1 of your opponent's Characters with 1000 power or less.Disclaimer: This card was reprinted from the original set with changes to the artist credit (note the lack of pen symbol next to the artist name).
    {
      cardId: 'OP05-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-010-on-play-ko-power-1000-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with 1000 power or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 1000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP05-019 Fire Fist
    // [Main] Give up to 1 of your opponent's Characters -4000 power during this turn. Then, if you have 2 or less Life cards, K.O. up to 1 of your opponent's Characters with 0 power or less. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP05-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fire-fist-019-main-minus-4000-then-ko-0-or-less-if-life-2-or-less',
            text: "[Main] Give up to 1 of your opponent's Characters -4000 power during this turn. Then, if you have 2 or less Life cards, K.O. up to 1 of your opponent's Characters with 0 power or less.",
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
                amount: -4000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 0 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
            conditions: [{ type: 'playerHasLifeAtMost', player: 'self', value: 2 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'fire-fist-019-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP05-019',
                effectId:
                  'fire-fist-019-main-minus-4000-then-ko-0-or-less-if-life-2-or-less',
              },
            ],
          },
        },
      ],
    },
    // OP05-011 Bartholomew Kuma
    // [On Play] K.O. up to 1 of your opponent's Characters with 2000 power or less. [Trigger] If your Leader is multicolored, play this card.
    {
      cardId: 'OP05-011',
    },
    // OP05-003 Inazuma
    // If you have a Character with 7000 power or more other than this Character, this Character gains [Rush]. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP05-003',
    },
    // OP05-007 Sabo (OP05-007) (Alternate Art)
    // [On Play] K.O. up to 2 of your opponent's Characters with a total power of 4000 or less.
    {
      cardId: 'OP05-007',
    },
    // OP05-070 Fra-Nosuke
    // [DON!! x1] If you have 8 or more DON!! cards on your field, this Character gains [Rush].
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP05-070',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'fra-nosuke-070-don-1-if-total-don-8-or-more-gain-rush',
            text: '[DON!! x1] If you have 8 or more DON!! cards on your field, this Character gains [Rush].',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['rush'],
            },
          },
        },
      ],
    },
    // OP05-086 Nefeltari Vivi
    // If you have 10 or more cards in your trash, this Character gains [Blocker]. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-086',
    },
    // OP05-098 Enel (SPR)
    // [Opponent's Turn] [Once Per Turn] When your number of Life cards becomes 0, add 1 card from the top of your deck to the top of your Life cards. Then, trash 1 card from your hand.
    {
      cardId: 'OP05-098',
    },
    // OP05-032 Pica (Alternate Art)
    // [End of Your Turn] (1): Set this Character as active. [Once Per Turn] If this Character would be K.O.'d, you may rest up to 1 of your Characters with a cost of 3 or more other than [Pica] instead.
    {
      cardId: 'OP05-032',
    },
    // OP05-018 Emporio Energy Hormone
    // [Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, play up to 1 [Revolutionary Army] type Character card with 5000 power or less from your hand. [Trigger] Play up to 1 [Revolutionary Army] type Character card with 5000 power or less from your hand.
    {
      cardId: 'OP05-018',
    },
    // OP05-057 Hound Blaze
    // [Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.   [Trigger] Return up to 1 Character with a cost of 3 or less to the owner's hand.
    {
      cardId: 'OP05-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hound-blaze-057-main-plus-3000-then-bottom-deck-cost-2-or-less',
            text: "[Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
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
            id: 'hound-blaze-057-trigger-return-cost-3-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'trigger' },
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP05-082 Shirahoshi (OP05-082) (Full Art)
    // [Activate:Main] You may rest this Character and place 2 cards from your trash at the bottom of your deck in any order: If your opponent has 6 or more cards in their hand, your opponent trashes 1 card from their hand.
    {
      cardId: 'OP05-082',
    },
    // OP05-061 Uso-Hachi (OP05-061)
    // [DON!! x1] [When Attacking] If you have 8 or more DON!! cards on your field, rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP05-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'uso-hachi-061-don-1-when-attacking-if-total-don-8-or-more-rest-cost-4-or-less',
            text: "[DON!! x1] [When Attacking] If you have 8 or more DON!! cards on your field, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
            actions: [
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
      ],
    },
    // OP05-002 Belo Betty (SPR)
    // [Activate: Main] [Once Per Turn] You may trash 1 "Revolutionary Army" type card from your hand: Up to 3 of your "Revolutionary Army" type Characters or Characters with a [Trigger] gain +3000 power during this turn.
    {
      cardId: 'OP05-002',
    },
    // OP05-095 Dragon Claw
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 15 or more cards in your trash, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP05-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dragon-claw-095-counter-plus-4000-then-ko-cost-4-or-less-if-trash-15',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 15 or more cards in your trash, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 15,
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
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP05-088 Mansherry (Alternate Art)
    // [Activate:Main] (1) (You may rest the specified number of DON!! cards in your cost area.) You may rest this Character and place 2 cards from your trash at the bottom of your deck in any order: Add up to 1 black Character card with a cost of 3 to 5 from your trash to your hand.
    {
      cardId: 'OP05-088',
    },
    // OP05-042 Issho
    // [On Play] Up to 1 of your opponent's Characters with a cost of 7 or less cannot attack until the start of your next turn.
    {
      cardId: 'OP05-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'issho-042-on-play-restrict-attack-cost-7-or-less-until-next-turn',
            text: "[On Play] Up to 1 of your opponent's Characters with a cost of 7 or less cannot attack until the start of your next turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 1,
              },
            ],
          },
        },
      ],
    },
    // OP05-022 Donquixote Rosinante (SPR)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[End of Your Turn] If you have 6 or less cards in your hand, set this Leader as active.
    {
      cardId: 'OP05-022',
    },
    // OP05-036 Monet (Reprint)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Block] Rest up to 1 of your opponent's Characters with a cost of 4 or less.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-036',
    },
    // OP05-064 Killer
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Kid Pirates] type card other than [Killer] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP05-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'killer-064-on-play-search-top-5-kid-pirates',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Kid Pirates] type card other than [Killer] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Kid Pirates'],
                  excludeName: ['Killer'],
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
    // OP05-008 Chaka
    // [DON!! x1][Activate:Main][Once Per Turn] Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.
    {
      cardId: 'OP05-008',
    },
    // OP05-041 Sakazuki (Alternate Art)
    // [Activate:Main][Once Per Turn] You may trash 1 card from your hand: Draw 1 card. [When Attacking] Give up to 1 of your opponent's Characters -1 cost during this turn.
    {
      cardId: 'OP05-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-041-activate-main-trash-1-draw-1',
            text: '[Activate:Main][Once Per Turn] You may trash 1 card from your hand: Draw 1 card.',
            trigger: { type: 'activateMain', optional: true, oncePerTurn: true },
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
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sakazuki-041-when-attacking-minus-1-cost',
            text: "[When Attacking] Give up to 1 of your opponent's Characters -1 cost during this turn.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP05-116 Hino Bird Zap
    // [Main] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP05-116',
    },
    // OP05-013 Bunny Joe
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-013',
    },
    // OP05-031 Buffalo
    // [When Attacking][Once Per Turn] If you have 2 or more rested Characters, set up to 1 of your rested Characters with a cost of 1 as active.
    {
      cardId: 'OP05-031',
    },
    // OP05-060 Monkey.D.Luffy (OP05-060)
    // [Activate: Main] [Once Per Turn] You may add 1 card from the top of your Life cards to your hand: If you have 0 or 3 or more DON!! cards on your field, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP05-060',
    },
    // OP05-038 Charlestone
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, you may trash 1 card from your hand. If you do, set up to 3 of your DON!! cards as active. [Trigger] Rest up to 1 of your opponent's Leader or Character cards with a cost of 3 or less.
    {
      cardId: 'OP05-038',
    },
    // OP05-055 X.Drake (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'OP05-055',
    },
    // OP05-047 Basil Hawkins
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Block] Draw 1 card if you have 3 or less cards in your hand. Then, this Character gains +1000 power during this battle.
    {
      cardId: 'OP05-047',
    },
    // OP05-071 Bepo
    // [When Attacking] If your opponent has more DON!! cards on their field than you, give up to 1 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'OP05-071',
    },
    // OP05-109 Pagaya
    // [Once Per Turn] When a [Trigger] activates, draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP05-109',
    },
    // OP05-104 Conis
    // [On Play] You may place 1 of your Stages at the bottom of your deck: Draw 1 card and trash 1 card from your hand.
    {
      cardId: 'OP05-104',
    },
    // OP05-014 Pell
    // [DON!! x1][When Attacking] Give up to 1 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'OP05-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pell-014-don-1-when-attacking-minus-2000',
            text: "[DON!! x1][When Attacking] Give up to 1 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // OP05-009 Toh-Toh
    // [On Play] Draw 1 card if your Leader has 0 power or less.
    {
      cardId: 'OP05-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'toh-toh-009-on-play-if-leader-power-0-or-less-draw-1',
            text: '[On Play] Draw 1 card if your Leader has 0 power or less.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { powerMax: 0 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP05-054 Monkey.D.Garp
    // [On Play] Draw 2 cards and place 2 cards from your hand at the bottom of your deck in any order.
    {
      cardId: 'OP05-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-054-on-play-draw-2-put-2-hand-bottom-deck',
            text: '[On Play] Draw 2 cards and place 2 cards from your hand at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
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
    // OP05-078 Punk Rotten
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Up to 1 of your [Kid Pirates] type Leader or Character cards gains +5000 power during this turn. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP05-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'punk-rotten-078-main-remove-1-plus-5000-kid-pirates',
            text: '[Main] DON!! -1: Up to 1 of your [Kid Pirates] type Leader or Character cards gains +5000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Kid Pirates'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'punk-rotten-078-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP05-028 Donquixote Doflamingo (028)
    // [Activate:Main] You may trash this Character: K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.
    {
      cardId: 'OP05-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-028-activate-main-trash-self-ko-rested-cost-2-or-less',
            text: "[Activate:Main] You may trash this Character: K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain', optional: true },
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
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP05-033 Baby 5 (033)
    // [Activate:Main] (1) (You may rest the specified number of DON!! cards in your cost area.) You may rest this Character: Play up to 1 [Donquixote Pirates] type Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP05-033',
    },
    // OP05-112 Captain McKinley
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] Play up to 1 [Sky Island] type Character card with a cost of 1 from your hand.
    {
      cardId: 'OP05-112',
    },
    // OP05-079 Viola
    // [On Play] Your opponent places 3 cards from their trash at the bottom of their deck in any order.
    {
      cardId: 'OP05-079',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'viola-079-on-play-opponent-puts-3-trash-to-bottom-deck',
            text: '[On Play] Your opponent places 3 cards from their trash at the bottom of their deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  chooser: 'opponent',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 3 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP05-094 Haute Couture Patch Work
    // [Main] Give up to 1 of your opponent's Characters -3 cost during this turn. Then, up to 1 of your opponent's Characters with a cost of 0 will not become active in the next Refresh Phase. [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP05-094',
    },
    // OP05-084 Saint Charlos
    // [Your Turn] If the only Characters on your field are [Celestial Dragons] type Characters, give all of your opponent's Characters -4 cost.
    {
      cardId: 'OP05-084',
    },
    // OP05-026 Sarquiss
    // [DON!! x1][When Attacking][Once Per Turn] You may rest 1 of your Characters with a cost of 3 or more: Set this Character as active.
    {
      cardId: 'OP05-026',
    },
    // OP05-090 Riku Doldo III
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] / [On K.O.] Up to 1 of your [Dressrosa] type Characters gains +2000 power during this turn.
    {
      cardId: 'OP05-090',
    },
    // OP05-113 Yama
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-113',
    },
    // OP05-066 Jinbe
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Opponent's Turn] If you have 10 DON!! cards on your field, this Character gains +1000 power.
    {
      cardId: 'OP05-066',
    },
    // OP05-025 Gladius
    // [Activate:Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP05-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gladius-025-activate-main-rest-self-rest-cost-3-or-less',
            text: "[Activate:Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
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
    // OP05-062 O-Nami
    // If you have 10 DON!! cards on your field, this Character gains [Blocker]. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-062',
    },
    // OP05-058 It's a Waste of Human Life!!
    // [Main] Place all Characters with a cost of 3 or less at the bottom of the owner's deck. Then, you and your opponent trash cards from your hands until you each have 5 cards in your hands. [Trigger] Place all Characters with a cost of 2 or less at the bottom of the owner's deck.
    {
      cardId: 'OP05-058',
    },
    // OP05-063 O-Robi
    // [On Play] If you have 8 or more DON!! cards on your field, K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP05-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'o-robi-063-on-play-if-total-don-8-or-more-ko-cost-3-or-less',
            text: "[On Play] If you have 8 or more DON!! cards on your field, K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP05-107 Lieutenant Spacey
    // [Your Turn][Once Per Turn] When a card is added to your hand from your Life, this Character gains +2000 power during this turn.
    {
      cardId: 'OP05-107',
    },
    // OP05-027 Trafalgar Law (027)
    // [Activate:Main] You may trash this Character: Rest up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP05-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-027-activate-main-trash-self-rest-cost-3-or-less',
            text: "[Activate:Main] You may trash this Character: Rest up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain', optional: true },
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
    // OP05-045 Stainless
    // [Activate:Main] You may trash 1 card from your hand and rest this Character: Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.
    {
      cardId: 'OP05-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'stainless-045-activate-main-trash-1-rest-self-bottom-deck-cost-2-or-less',
            text: "[Activate:Main] You may trash 1 card from your hand and rest this Character: Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP05-092 Saint Rosward
    // [Your Turn] If the only Characters on your field are [Celestial Dragons] type Characters, give all of your opponent's Characters -6 cost.
    {
      cardId: 'OP05-092',
    },
    // OP05-087 Hakuba
    // [DON!! x1][When Attacking] You may K.O. 1 of your Characters other than this Character: Give up to 1 of your opponent's Characters -5 cost during this turn.
    {
      cardId: 'OP05-087',
    },
    // OP05-052 Maynard (Reprint)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-052',
    },
    // OP05-050 Hina
    // [On Play] Draw 1 card if you have 5 or less cards in your hand.
    {
      cardId: 'OP05-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hina-050-on-play-if-hand-5-or-less-draw-1',
            text: '[On Play] Draw 1 card if you have 5 or less cards in your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
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
    // OP05-023 Vergo
    // [DON!! x1][When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.
    {
      cardId: 'OP05-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vergo-023-don-1-when-attacking-ko-rested-cost-3-or-less',
            text: "[DON!! x1][When Attacking] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
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
                    costMax: 3,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP05-099 Amazon
    // [On Your Opponent's Attack] You may rest this Character: Your opponent may trash 1 card from the top of their Life cards. If they do not, give up to 1 of your opponent's Leader or Character cards -2000 power during this turn.
    {
      cardId: 'OP05-099',
    },
    // OP05-053 Mozambia
    // [Your Turn][Once Per Turn] When you draw a card outside of your Draw Phase, this Character gains +2000 power during this turn.
    {
      cardId: 'OP05-053',
    },
    // OP05-096 I Bid 500 Million!!
    // [Main] Choose one: • K.O. up to 1 of your opponent's Characters with a cost of 1 or less. • Return up to 1 of your opponent's Characters with a cost of 1 or less to the owner's hand. • Place up to 1 of your opponent's Characters with a cost of 1 or less at the top or bottom of their Life cards face-up. Then, if you have a [Celestial Dragons] type Character, draw 1 card. [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 6 or less, or return it to the owner's hand.
    {
      cardId: 'OP05-096',
    },
    // OP05-001 Sabo (SPR)
    // [DON!! x1] [Opponent's Turn] [Once Per Turn] If your Character with 5000 power or more would be K.O.'d, you may give that Character 1000 power during this turn instead of that Character being K.O.'d.
    {
      cardId: 'OP05-001',
    },
    // OP05-080 Elizabello II
    // [When Attacking][Once Per Turn] You may return 20 cards from your trash to your deck and shuffle it: This Character gains and +10000 power during this battle. (This card deals 2 damage.)
    {
      cardId: 'OP05-080',
    },
    // OP05-020 Four Thousand-Brick Fist
    // [Main] Up to 1 of your Leader or Character cards gains +2000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 2000 power or less. [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP05-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'four-thousand-brick-fist-main-plus-2000-then-ko-2000-or-less',
            text: "[Main] Up to 1 of your Leader or Character cards gains +2000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 2000 power or less.",
            trigger: { type: 'activateMain' },
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
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 2000 },
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
            id: 'four-thousand-brick-fist-trigger-plus-1000',
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
    // OP05-046 Dalmatian
    // [On K.O.] Draw 1 card and place 1 card from your hand at the bottom of your deck.
    {
      cardId: 'OP05-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dalmatian-046-on-ko-draw-1-put-1-hand-bottom-deck',
            text: '[On K.O.] Draw 1 card and place 1 card from your hand at the bottom of your deck.',
            trigger: { type: 'onKo' },
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
    // OP05-039 Stick-Stickem Meteora
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less. [Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.
    {
      cardId: 'OP05-039',
    },
    // OP05-056 X.Barrels
    // [On Play] You may place 1 of your Characters other than this Character at the bottom of your deck: Draw 1 card.
    {
      cardId: 'OP05-056',
    },
    // OP05-111 Hotori
    // [On Play] You may play 1 [Kotori] from your hand: Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up.
    {
      cardId: 'OP05-111',
    },
    // OP05-085 Nefeltari Cobra
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] Trash 1 card from the top of your deck.
    {
      cardId: 'OP05-085',
    },
    // OP05-068 Chopa-Emon
    // [On Play] If you have 8 or more DON!! cards on your field, set up to 1 of your purple "Straw Hat Crew" type Characters with 6000 power or less as active.
    {
      cardId: 'OP05-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chopa-emon-068-on-play-if-total-don-8-or-more-unrest-purple-straw-hat-6000-or-less',
            text: '[On Play] If you have 8 or more DON!! cards on your field, set up to 1 of your purple "Straw Hat Crew" type Characters with 6000 power or less as active.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Purple'],
                    trait: ['Straw Hat Crew'],
                    powerMax: 6000,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP05-077 Gamma Knife (Reprint)
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Give up to 1 of your opponent's Characters -5000 power during this turn.[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP05-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gamma-knife-077-main-remove-1-minus-5000',
            text: "[Main] DON!! -1: Give up to 1 of your opponent's Characters -5000 power during this turn.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gamma-knife-077-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP05-048 Bastille
    // [DON!! x1][When Attacking] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.
    {
      cardId: 'OP05-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bastille-048-don-1-when-attacking-bottom-deck-cost-2-or-less',
            text: "[DON!! x1][When Attacking] Place up to 1 Character with a cost of 2 or less at the bottom of the owner's deck.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP05-059 Let Us Begin the World of Violence!!
    // [Main] If your Leader is multicolored, draw 1 card. Then, return up to 1 Character with a cost of 5 or less to the owner's hand. [Trigger] If your Leader is multicolored, draw 2 cards.
    {
      cardId: 'OP05-059',
    },
    // OP05-072 Hone-Kichi
    // [On Play] If you have 8 or more DON!! cards on your field, give up to 2 of your opponent's Characters 2000 power during this turn.
    {
      cardId: 'OP05-072',
    },
    // OP05-075 Mr.1 (Daz.Bonez)
    // [On Your Opponent's Attack][Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [Baroque Works] type Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP05-075',
    },
    // OP05-103 Kotori
    // [On Play] If you have [Hotori], K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.
    {
      cardId: 'OP05-103',
    },
    // OP05-049 Haccha
    // [DON!! x1][When Attacking] Return up to 1 Character with a cost of 3 or less to the owner's hand.
    {
      cardId: 'OP05-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'haccha-049-don-1-when-attacking-return-cost-3-or-less',
            text: "[DON!! x1][When Attacking] Return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP05-089 Saint Mjosgard
    // [Activate:Main] (1) (You may rest the specified number of DON!! cards in your cost area.) You may rest this Character and 1 of your Characters: Add up to 1 black Character card with a cost of 1 from your trash to your hand.
    {
      cardId: 'OP05-089',
    },
    // OP05-117 Upper Yard
    // [On Play] Look at the top 5 cards of your deck; reveal up to 1 [Sky Island] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP05-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'upper-yard-117-on-play-search-top-5-sky-island',
            text: '[On Play] Look at the top 5 cards of your deck; reveal up to 1 [Sky Island] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Sky Island'] },
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
    // OP05-040 Birdcage
    // If your Leader is [Donquixote Doflamingo], all Characters with a cost of 5 or less do not become active in your and your opponent's Refresh Phases. [End of Your Turn] If you have 10 DON!! cards on your field, K.O. all rested Characters with a cost of 5 or less. Then, trash this SAtage.
    {
      cardId: 'OP05-040',
    },
    // OP05-021 Revolutionary Army HQ (Reprint)
    // [Activate:Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 [Revolutionary Army] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP05-021',
    },
    // OP05-097 Mary Geoise (Reprint)
    // [Your Turn] The cost of playing [Celestial Dragons] type Character cards with a cost of 2 or more from your hand will be reduced by 1.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP05-097',
    },
    // OP05-024 Kuween
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-024',
    },
    // OP05-029 Donquixote Doflamingo (029)
    // [On Your Opponent's Attack][Once Per Turn] (1) (You may rest the specified number of DON!! cards in your cost area.): Rest up to 1 of your opponent's Characters with a cost of 6 or less.
    {
      cardId: 'OP05-029',
    },
  ],
};
