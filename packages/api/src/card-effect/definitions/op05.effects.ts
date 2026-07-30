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
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'ohm-101-if-life-2-or-less-plus-1000',
            text: 'If you have 2 or less Life cards, this Character gains +1000 power.',
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 1000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ohm-101-on-play-search-top-5-holly-then-play-holly',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Holly] and add it to your hand. Then, place the rest at the bottom of your deck in any order and play up to 1 [Holly] from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { name: ['Holly'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    name: ['Holly'],
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
    // OP05-091 Rebecca (SP)
    // [Blocker][On Play] Add up to 1 black Character card with a cost of 3 to 7 other than [Rebecca] from your trash to your hand. Then, play up to 1 black Character card with a cost of 3 or less from your hand rested.
    {
      cardId: 'OP05-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rebecca-091-on-play-add-black-cost-3-to-7-other-than-rebecca-then-play-black-cost-3-or-less-rested',
            text: '[On Play] Add up to 1 black Character card with a cost of 3 to 7 other than [Rebecca] from your trash to your hand. Then, play up to 1 black Character card with a cost of 3 or less from your hand rested.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
                    costMin: 3,
                    costMax: 7,
                    excludeName: ['Rebecca'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
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
                    color: ['Black'],
                    costMax: 3,
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eustass-captain-kid-074-on-don-returned-add-active-don',
            text: '[Your Turn][Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
            ],
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP05-037 Because the Side of Justice Will Be Whichever Side Wins!! (Reprint)
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP05-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'side-of-justice-037-counter-trash-1-plus-3000',
            text: '[Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.',
            trigger: { type: 'activateCounter', optional: true },
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
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'side-of-justice-037-trigger-rest-cost-4-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'trigger' },
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
    // OP05-114 El Thor
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if your opponent has 2 or less Life cards, that card gains an additional +2000 power during this battle. [Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life Cards.
    {
      cardId: 'OP05-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'el-thor-counter-dynamic-power',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if your opponent has 2 or less Life cards, that card gains an additional +2000 power during this battle.',
            trigger: {
              type: 'activateCounter',
            },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'el-thor-target',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
              },
              {
                type: 'modifyStoredCardsPower',
                key: 'el-thor-target',
                amount: 2000,
                duration: {
                  type: 'untilEndOfBattle',
                },
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'playerHasLifeAtMost',
                    player: 'opponent',
                    value: 2,
                  },
                ],
                actions: [
                  {
                    type: 'modifyStoredCardsPower',
                    key: 'el-thor-target',
                    amount: 2000,
                    duration: {
                      type: 'untilEndOfBattle',
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'el-thor-trigger-ko-cost-equal-to-opponent-life',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life Cards.",
            trigger: {
              type: 'trigger',
            },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMaxFromLifeOf: 'opponent',
                  },
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
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
            text: "[On Play] If your Leader has the [Revolutionary Army] type, give up to 1 of your opponent's Characters -3000 power during this turn.",
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-034-activate-main-cost-1-rest-self-search-top-5-donquixote-pirates',
            text: '[Activate:Main] (1) You may rest this Character: Look at 5 cards from the top of your deck; reveal up to 1 [Donquixote Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
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
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Donquixote Pirates'] },
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
    // OP05-093 Rob Lucci (SP)
    // [On Play] You may place 3 cards from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent's Characters with a cost of 2 or less and up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP05-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rob-lucci-093-on-play-trash-3-bottom-deck-ko-cost-2-or-less-and-cost-1-or-less',
            text: "[On Play] You may place 3 cards from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent's Characters with a cost of 2 or less and up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 3 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
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
                reason: 'effect',
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP05-030 Donquixote Rosinante (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[Opponent's Turn] If your rested Character would be K.O.'d, you may trash this Character instead.
    {
      cardId: 'OP05-030',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'donquixote-rosinante-030-opponents-turn-rested-character-would-ko-trash-this-instead',
            text: "[Opponent's Turn] If your rested Character would be K.O.'d, you may trash this Character instead.",
            event: 'wouldKoCharacter',
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'sourceIsRested', value: true },
            ],
            replacement: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { rested: true },
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
    // OP05-102 Gedatsu (Reprint)
    // [On Play] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gedatsu-102-on-play-ko-cost-up-to-opponent-life',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMaxFromLifeOf: 'opponent',
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
    // OP05-017 Lindbergh
    // [When Attacking] If this Character has 7000 power or more, K.O. up to 1 of your opponent's Characters with 3000 power or less. [Trigger] You may trash 1 card from your hand: If your Leader is multicolored, play this card.
    {
      cardId: 'OP05-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lindbergh-017-when-attacking-if-power-7000-ko-power-3000-or-less',
            text: "[When Attacking] If this Character has 7000 power or more, K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourcePowerAtLeast', value: 7000 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 3000 },
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
            id: 'lindbergh-017-trigger-trash-1-play-this-card-if-multicolored-leader',
            text: '[Trigger] You may trash 1 card from your hand: If your Leader is multicolored, play this card.',
            trigger: { type: 'trigger', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
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
    // OP05-005 Karasu
    // [On Play] If your Leader has the [Revolutionary Army] type, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn. [When Attacking] If this Character has 7000 power or more, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn.
    {
      cardId: 'OP05-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'karasu-005-on-play-if-revolutionary-army-minus-1000',
            text: "[On Play] If your Leader has the [Revolutionary Army] type, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn.",
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
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'karasu-005-when-attacking-if-power-7000-minus-1000',
            text: "[When Attacking] If this Character has 7000 power or more, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { powerMin: 7000 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP05-069 Trafalgar Law (OP05-069) (Manga)
    // [When Attacking] If your opponent has more DON!! cards on their field than you, look at 5 cards from the top of your deck; reveal up to 1 [Heart Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP05-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-069-when-attacking-if-multicolored-and-opponent-has-more-don-search-heart-pirates',
            text: '[When Attacking] If your Leader is multicolored and your opponent has more DON!! cards on their field than you, look at 5 cards from the top of your deck; reveal up to 1 [Heart Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Heart Pirates'] },
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
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 3 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 4 }],
          },
        },
      ],
    },
    // OP05-115 Two-Hundred Million Volts Amaru
    // [Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if you have 1 or less Life cards, rest up to 1 of your opponent's Characters with a cost of 4 or less.   [Trigger] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP05-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'two-hundred-million-volts-amaru-115-main-plus-3000',
            text: "[Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if you have 1 or less Life cards, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'two-hundred-million-volts-amaru-115-main-if-life-1-or-less-rest-cost-4-or-less',
            text: "Then, if you have 1 or less Life cards, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
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
        {
          kind: 'standard',
          effect: {
            id: 'two-hundred-million-volts-amaru-115-trigger-trash-2-add-life',
            text: '[Trigger] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'trigger', optional: true },
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
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
      ],
    },
    // OP05-100 Enel (100) (SP)
    // [Rush] [Once Per Turn] If this Character would leave the field, you may trash 1 card from the top of your Life cards instead. If there is a [Monkey.D.Luffy] Character, this effect is negated.
    {
      cardId: 'OP05-100',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'enel-100-would-leave-field-trash-top-life-instead',
            text: 'If this Character would leave the field, trash 1 card from the top of your Life cards instead.',
            event: 'wouldMoveCard',
            oncePerTurn: true,
            conditions: [
              { type: 'cardInZone', zone: 'characters' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    name: ['Monkey.D.Luffy'],
                  },
                },
                value: 0,
              },
            ],
            replacement: [
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'one-legged-toy-soldier-081-activate-main-trash-self-minus-3-cost',
            text: "[Activate:Main] You may trash this Character: Give up to 1 of your opponent's Characters -3 cost during this turn.",
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
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -3,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP05-043 Ulti (Alternate Art)
    // [On Play] If your Leader is multicolored, look at 3 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the top or bottom of the deck in any order.
    {
      cardId: 'OP05-043',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op05-043-special',
        },
      ],
    },
    // OP05-016 Morley
    // [When Attacking] If this Character has 7000 power or more, your opponent cannot activate [Blocker] during this battle. [Trigger] You may trash 1 card from your hand: If your Leader is multicolored, play this card.
    {
      cardId: 'OP05-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'morley-016-when-attacking-if-power-7000-opponent-cannot-block',
            text: 'If this Character has 7000 power or more, your opponent cannot activate [Blocker] during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourcePowerAtLeast', value: 7000 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'morley-016-trigger-trash-1-play-this-card-if-multicolored-leader',
            text: '[Trigger] You may trash 1 card from your hand: If your Leader is multicolored, play this card.',
            trigger: { type: 'trigger', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
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
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 3 },
            ],
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP05-119 Monkey.D.Luffy (OP05-119) (Manga)
    // [On Play] DON!! -10: Place all of your Characters except this Character at the bottom of your deck in any order. Then, take an extra turn after this one.[Activate:Main][Once Per Turn] (1): Add up to 1 DON!! card from your DON!! deck and set it as active.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP05-119',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op05-119-special',
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-119-activate-main-once-per-turn-rest-1-don-add-active-don',
            text: '[Activate:Main][Once Per Turn] (1): Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { cardCategory: ['DON!!'], rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP05-004 Emporio.Ivankov (Reprint)
    // [Activate:Main][Once Per Turn] If this Character has 7000 power or more, play up to 1 [Revolutionary Army] type Character card with 5000 power or less other than [Emporio.Ivankov] from your hand.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emporio-ivankov-004-activate-main-once-per-turn-if-power-7000-play-revolutionary-army-5000-or-less',
            text: '[Activate:Main][Once Per Turn] If this Character has 7000 power or more, play up to 1 [Revolutionary Army] type Character card with 5000 power or less other than [Emporio.Ivankov] from your hand.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { powerMin: 7000 },
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
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                    powerMax: 5000,
                    excludeName: ['Emporio.Ivankov'],
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
    // OP05-073 Miss Doublefinger(Zala) (Reprint)
    // [On Play] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and rest it.[Trigger] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.Disclaimer: This card was reprinted from the original set with changes to the artist credit (note the lack of pen symbol next to the artist name).
    {
      cardId: 'OP05-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-doublefinger-073-on-play-trash-1-add-rested-don',
            text: '[On Play] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and rest it.',
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
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'miss-doublefinger-073-trigger-remove-1-play-this-card',
            text: '[Trigger] DON!! -1: Play this card.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // OP05-076 When You're at Sea You Fight against Pirates!!
    // [Main] Look at 3 cards from the top of your deck; reveal up to 1 "Straw Hat Crew", "Kid Pirates", or "Heart Pirates" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP05-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'when-youre-at-sea-076-main-search-top-3-straw-hat-kid-or-heart-pirates',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 "Straw Hat Crew", "Kid Pirates", or "Heart Pirates" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Straw Hat Crew', 'Kid Pirates', 'Heart Pirates'],
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
          kind: 'special-ref',
          specialHandlerId: 'op05-019-special',
        },
      ],
    },
    // OP05-011 Bartholomew Kuma
    // [On Play] K.O. up to 1 of your opponent's Characters with 2000 power or less. [Trigger] If your Leader is multicolored, play this card.
    {
      cardId: 'OP05-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bartholomew-kuma-011-on-play-if-multicolored-leader-ko-power-2000-or-less',
            text: "[On Play] If your Leader is multicolored, K.O. up to 1 of your opponent's Characters with 2000 power or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
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
            id: 'bartholomew-kuma-011-trigger-play-this-card-if-multicolored-leader',
            text: '[Trigger] If your Leader is multicolored, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
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
    // OP05-003 Inazuma
    // If you have a Character with 7000 power or more other than this Character, this Character gains [Rush]. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP05-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'inazuma-003-if-other-character-power-7000-or-more-gain-rush',
            text: 'If you have a Character with 7000 power or more other than this Character, this Character gains [Rush].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMin: 7000,
                    excludeName: ['Inazuma'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
              },
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
    // OP05-007 Sabo (OP05-007) (Alternate Art)
    // [On Play] K.O. up to 2 of your opponent's Characters with a total power of 4000 or less.
    {
      cardId: 'OP05-007',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op05-007-special',
        },
      ],
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
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nefeltari-vivi-086-if-trash-10-plus-blocker',
            text: 'If you have 10 or more cards in your trash, this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP05-098 Enel (SPR)
    // [Opponent's Turn] [Once Per Turn] When your number of Life cards becomes 0, add 1 card from the top of your deck to the top of your Life cards. Then, trash 1 card from your hand.
    {
      cardId: 'OP05-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'enel-098-opponents-turn-on-life-damage-life-0-add-top-deck-to-life-then-trash-hand',
            text: "[Opponent's Turn] [Once Per Turn] When your number of Life cards becomes 0, add 1 card from the top of your deck to the top of your Life cards. Then, trash 1 card from your hand.",
            trigger: { type: 'onLifeDamageDealt', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'playerHasLifeAtMost', player: 'self', value: 0 },
            ],
            actions: [
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                faceDown: true,
              },
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
    // OP05-032 Pica (Alternate Art)
    // [End of Your Turn] (1): Set this Character as active. [Once Per Turn] If this Character would be K.O.'d, you may rest up to 1 of your Characters with a cost of 3 or more other than [Pica] instead.
    {
      cardId: 'OP05-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pica-032-end-of-your-turn-pay-1-unrest-self',
            text: '[End of Your Turn] (1): Set this Character as active.',
            trigger: { type: 'onTurnEnd', optional: true, oncePerTurn: true },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'replacement',
          effect: {
            id: 'pica-032-replace-would-ko-rest-cost-3-or-more-other-than-pica',
            text: "If this Character would be K.O.'d, you may rest up to 1 of your Characters with a cost of 3 or more other than [Pica] instead.",
            event: 'wouldKoCharacter',
            optional: true,
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 3,
                    excludeName: ['Pica'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP05-018 Emporio Energy Hormone
    // [Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, play up to 1 [Revolutionary Army] type Character card with 5000 power or less from your hand. [Trigger] Play up to 1 [Revolutionary Army] type Character card with 5000 power or less from your hand.
    {
      cardId: 'OP05-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'emporio-energy-hormone-018-counter-plus-3000-then-play-revolutionary-army-5000-or-less',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, play up to 1 [Revolutionary Army] type Character card with 5000 power or less from your hand.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                    powerMax: 5000,
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
            id: 'emporio-energy-hormone-018-trigger-play-revolutionary-army-5000-or-less',
            text: '[Trigger] Play up to 1 [Revolutionary Army] type Character card with 5000 power or less from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                    powerMax: 5000,
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirahoshi-082-activate-main-rest-self-bottom-deck-2-trash-if-opponent-hand-6-trash-1',
            text: '[Activate:Main] You may rest this Character and place 2 cards from your trash at the bottom of your deck in any order: If your opponent has 6 or more cards in their hand, your opponent trashes 1 card from their hand.',
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
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['hand'] },
                value: 6,
              },
            ],
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
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op05-002-special',
        },
      ],
    },
    // OP05-095 Dragon Claw
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 15 or more cards in your trash, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP05-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dragon-claw-095-counter-plus-4000',
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
            id: 'dragon-claw-095-counter-if-trash-15-ko-cost-4-or-less',
            text: "Then, if you have 15 or more cards in your trash, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mansherry-088-activate-main-cost-1-rest-self-bottom-deck-2-trash-add-black-cost-3-to-5',
            text: '[Activate:Main] (1) You may rest this Character and place 2 cards from your trash at the bottom of your deck in any order: Add up to 1 black Character card with a cost of 3 to 5 from your trash to your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
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
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
                    costMin: 3,
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-rosinante-022-on-turn-end-if-hand-6-or-less-unrest-leader',
            text: '[End of Your Turn] If you have 6 or less cards in your hand, set this Leader as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 6,
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP05-036 Monet (Reprint)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Block] Rest up to 1 of your opponent's Characters with a cost of 4 or less.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monet-036-on-block-rest-cost-4-or-less',
            text: "[On Block] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onBlock' },
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chaka-008-don-1-activate-main-once-attach-up-to-2-rested-don',
            text: '[DON!! x1][Activate:Main][Once Per Turn] Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
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
            trigger: {
              type: 'activateMain',
              optional: true,
              oncePerTurn: true,
            },
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hino-bird-zap-116-main-ko-cost-up-to-opponent-life',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMaxFromLifeOf: 'opponent',
                  },
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
            id: 'hino-bird-zap-116-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP05-116',
                effectId: 'hino-bird-zap-116-main-ko-cost-up-to-opponent-life',
              },
            ],
          },
        },
      ],
    },
    // OP05-013 Bunny Joe
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-013',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'bunny-joe-013-blocker',
            text: '[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP05-031 Buffalo
    // [When Attacking][Once Per Turn] If you have 2 or more rested Characters, set up to 1 of your rested Characters with a cost of 1 as active.
    {
      cardId: 'OP05-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buffalo-031-when-attacking-once-per-turn-if-2-rested-unrest-cost-1',
            text: '[When Attacking][Once Per Turn] If you have 2 or more rested Characters, set up to 1 of your rested Characters with a cost of 1 as active.',
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
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 1,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP05-060 Monkey.D.Luffy (OP05-060)
    // [Activate: Main] [Once Per Turn] You may add 1 card from the top of your Life cards to your hand: If you have 0 or 3 or more DON!! cards on your field, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP05-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-060-activate-main-life-to-hand-add-don-if-zero-don',
            text: '[Activate: Main] [Once Per Turn] You may add 1 card from the top of your Life cards to your hand: If you have 0 DON!! cards on your field, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            conditions: [
              {
                type: 'playerHasTotalDonAtMost',
                player: 'self',
                value: 0,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
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
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-060-activate-main-life-to-hand-add-don-if-three-or-more-don',
            text: '[Activate: Main] [Once Per Turn] You may add 1 card from the top of your Life cards to your hand: If you have 3 or more DON!! cards on your field, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'self',
                value: 3,
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: {
                    zonePosition: 'top',
                  },
                  count: {
                    kind: 'exact',
                    value: 1,
                  },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
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
    // OP05-038 Charlestone
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, you may trash 1 card from your hand. If you do, set up to 3 of your DON!! cards as active. [Trigger] Rest up to 1 of your opponent's Leader or Character cards with a cost of 3 or less.
    {
      cardId: 'OP05-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlestone-038-counter-plus-4000',
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
            id: 'charlestone-038-counter-optional-trash-1-unrest-up-to-3-don',
            text: 'Then, you may trash 1 card from your hand. If you do, set up to 3 of your DON!! cards as active.',
            trigger: { type: 'activateCounter', optional: true },
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
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 3 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'charlestone-038-trigger-rest-cost-3-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Leader or Character cards with a cost of 3 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP05-055 X.Drake (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    {
      cardId: 'OP05-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'x-drake-055-on-play-arrange-top-5-deck',
            text: '[On Play] Look at 5 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 5 }],
          },
        },
      ],
    },
    // OP05-047 Basil Hawkins
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Block] Draw 1 card if you have 3 or less cards in your hand. Then, this Character gains +1000 power during this battle.
    {
      cardId: 'OP05-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-047-on-block-if-hand-3-or-less-draw-1',
            text: '[On Block] Draw 1 card if you have 3 or less cards in your hand.',
            trigger: { type: 'onBlock' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 3,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-047-on-block-source-plus-1000-during-battle',
            text: 'Then, this Character gains +1000 power during this battle.',
            trigger: { type: 'onBlock' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP05-071 Bepo
    // [When Attacking] If your opponent has more DON!! cards on their field than you, give up to 1 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'OP05-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bepo-071-when-attacking-if-opponent-has-more-don-minus-2000',
            text: "[When Attacking] If your opponent has more DON!! cards on their field than you, give up to 1 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasMoreTotalDonThan',
                player: 'opponent',
                thanPlayer: 'self',
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
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP05-109 Pagaya
    // [Once Per Turn] When a [Trigger] activates, draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP05-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pagaya-109-once-per-turn-on-event-activated-draw-2-trash-2',
            text: '[Once Per Turn] When a [Trigger] activates, draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
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
      ],
    },
    // OP05-104 Conis
    // [On Play] You may place 1 of your Stages at the bottom of your deck: Draw 1 card and trash 1 card from your hand.
    {
      cardId: 'OP05-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'conis-104-on-play-bottom-stage-draw-1-trash-1',
            text: '[On Play] You may place 1 of your Stages at the bottom of your deck: Draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-033-activate-main-cost-1-rest-self-play-donquixote-pirates-cost-2-or-less',
            text: '[Activate:Main] (1) You may rest this Character: Play up to 1 [Donquixote Pirates] type Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Donquixote Pirates'],
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
    // OP05-112 Captain McKinley
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] Play up to 1 [Sky Island] type Character card with a cost of 1 from your hand.
    {
      cardId: 'OP05-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'captain-mckinley-112-on-ko-play-sky-island-cost-1',
            text: '[On K.O.] Play up to 1 [Sky Island] type Character card with a cost of 1 from your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Sky Island'],
                    costMax: 1,
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'haute-couture-patch-work-094-main-minus-3-cost-skip-cost-0-refresh',
            text: "[Main] Give up to 1 of your opponent's Characters -3 cost during this turn. Then, up to 1 of your opponent's Characters with a cost of 0 will not become active in the next Refresh Phase.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -3,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 0,
                    costMax: 0,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'haute-couture-patch-work-094-trigger-draw-2-trash-1',
            text: '[Trigger] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'trigger' },
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
    // OP05-084 Saint Charlos
    // [Your Turn] If the only Characters on your field are [Celestial Dragons] type Characters, give all of your opponent's Characters -4 cost.
    {
      cardId: 'OP05-084',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'saint-charlos-084-your-turn-if-only-celestial-dragons-minus-4-cost',
            text: "[Your Turn] If the only Characters on your field are [Celestial Dragons] type Characters, give all of your opponent's Characters -4 cost.",
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'Celestial Dragons',
              },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              cost: -4,
            },
          },
        },
      ],
    },
    // OP05-026 Sarquiss
    // [DON!! x1][When Attacking][Once Per Turn] You may rest 1 of your Characters with a cost of 3 or more: Set this Character as active.
    {
      cardId: 'OP05-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sarquiss-026-don-1-when-attacking-rest-1-cost-3-or-more-unrest-self',
            text: '[DON!! x1][When Attacking][Once Per Turn] You may rest 1 of your Characters with a cost of 3 or more: Set this Character as active.',
            trigger: {
              type: 'whenAttacking',
              optional: true,
              oncePerTurn: true,
            },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 3 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP05-090 Riku Doldo III
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] / [On K.O.] Up to 1 of your [Dressrosa] type Characters gains +2000 power during this turn.
    {
      cardId: 'OP05-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'riku-doldo-iii-090-on-play-plus-2000-dressrosa',
            text: '[On Play] Up to 1 of your [Dressrosa] type Characters gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Dressrosa'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'riku-doldo-iii-090-on-ko-plus-2000-dressrosa',
            text: '[On K.O.] Up to 1 of your [Dressrosa] type Characters gains +2000 power during this turn.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Dressrosa'] },
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
    // OP05-113 Yama
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-113',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'yama-113-blocker',
            text: '[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP05-066 Jinbe
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Opponent's Turn] If you have 10 DON!! cards on your field, this Character gains +1000 power.
    {
      cardId: 'OP05-066',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'jinbe-066-opponents-turn-if-total-don-10-plus-1000',
            text: "[Opponent's Turn] If you have 10 DON!! cards on your field, this Character gains +1000 power.",
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 10 },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 1000,
            },
          },
        },
      ],
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
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'o-nami-062-if-10-don-blocker',
            text: 'If you have 10 DON!! cards on your field, this Character gains [Blocker].',
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 10 },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP05-058 It's a Waste of Human Life!!
    // [Main] Place all Characters with a cost of 3 or less at the bottom of the owner's deck. Then, you and your opponent trash cards from your hands until you each have 5 cards in your hands. [Trigger] Place all Characters with a cost of 2 or less at the bottom of the owner's deck.
    {
      cardId: 'OP05-058',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op05-058-special',
        },
      ],
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
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lieutenant-spacey-107-your-turn-on-life-damage-plus-2000',
            text: '[Your Turn][Once Per Turn] When a card is added to your hand from your Life, this Character gains +2000 power during this turn.',
            trigger: { type: 'onLifeDamageDealt', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
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
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
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
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'saint-rosward-092-your-turn-if-only-celestial-dragons-minus-6-cost',
            text: "[Your Turn] If the only Characters on your field are [Celestial Dragons] type Characters, give all of your opponent's Characters -6 cost.",
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'Celestial Dragons',
              },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              cost: -6,
            },
          },
        },
      ],
    },
    // OP05-087 Hakuba
    // [DON!! x1][When Attacking] You may K.O. 1 of your Characters other than this Character: Give up to 1 of your opponent's Characters -5 cost during this turn.
    {
      cardId: 'OP05-087',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hakuba-087-don-1-when-attacking-ko-other-self-minus-5-cost',
            text: "[DON!! x1][When Attacking] You may K.O. 1 of your Characters other than this Character: Give up to 1 of your opponent's Characters -5 cost during this turn.",
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              {
                type: 'ko',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    excludeName: ['Hakuba'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
                reason: 'effect',
              },
            ],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -5,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP05-052 Maynard (Reprint)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP05-052',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'maynard-052-blocker',
            text: '[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
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
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op05-099-special',
        },
      ],
    },
    // OP05-053 Mozambia
    // [Your Turn][Once Per Turn] When you draw a card outside of your Draw Phase, this Character gains +2000 power during this turn.
    {
      cardId: 'OP05-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mozambia-053-your-turn-once-per-turn-on-card-drawn-plus-2000',
            text: '[Your Turn][Once Per Turn] When you draw a card outside of your Draw Phase, this Character gains +2000 power during this turn.',
            trigger: { type: 'onCardDrawn', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'self' },
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
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP05-096 I Bid 500 Million!!
    // [Main] Choose one: • K.O. up to 1 of your opponent's Characters with a cost of 1 or less. • Return up to 1 of your opponent's Characters with a cost of 1 or less to the owner's hand. • Place up to 1 of your opponent's Characters with a cost of 1 or less at the top or bottom of their Life cards face-up. Then, if you have a [Celestial Dragons] type Character, draw 1 card. [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 6 or less, or return it to the owner's hand.
    {
      cardId: 'OP05-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'i-bid-500-million-096-main-choose-1',
            text: "[Main] Choose one: K.O. up to 1 of your opponent's Characters with a cost of 1 or less. Return up to 1 of your opponent's Characters with a cost of 1 or less to the owner's hand. Place up to 1 of your opponent's Characters with a cost of 1 or less at the top or bottom of their Life cards face-up. Then, if you have a [Celestial Dragons] type Character, draw 1 card.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choisissez un effet.',
                choices: [
                  {
                    id: 'ko-main',
                    label: 'K.O. une carte',
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 1 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        reason: 'effect',
                      },
                    ],
                  },
                  {
                    id: 'return-main',
                    label: 'Retourner en main',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 1 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'selectedCardOwner',
                        destinationZone: 'hand',
                      },
                    ],
                  },
                  {
                    id: 'life-main',
                    label: 'Mettre en Vie',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 1 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'selectedCardOwner',
                        destinationZone: 'life',
                        chooseDestinationPosition: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'i-bid-500-million-096-main-if-celestial-dragons-draw-1',
            text: 'Then, if you have a [Celestial Dragons] type Character, draw 1 card.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Celestial Dragons'],
                  },
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
            id: 'i-bid-500-million-096-trigger-choose-ko-or-return-cost-6-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 6 or less, or return it to the owner's hand.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choisissez un effet.',
                choices: [
                  {
                    id: 'ko-trigger',
                    label: 'K.O. une carte',
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 6 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        reason: 'effect',
                      },
                    ],
                  },
                  {
                    id: 'return-trigger',
                    label: 'Retourner en main',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { cardCategory: ['Character'], costMax: 6 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'selectedCardOwner',
                        destinationZone: 'hand',
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
    // OP05-001 Sabo (SPR)
    // [DON!! x1] [Opponent's Turn] [Once Per Turn] If your Character with 5000 power or more would be K.O.'d, you may give that Character 1000 power during this turn instead of that Character being K.O.'d.
    {
      cardId: 'OP05-001',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'sabo-001-replace-would-ko-character-with-power-5000-or-more',
            text: "If your Character with 5000 power or more would be K.O.'d, you may give that Character 1000 power during this turn instead of that Character being K.O.'d.",
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: false },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 5000 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            replacement: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
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
    // OP05-080 Elizabello II
    // [When Attacking][Once Per Turn] You may return 20 cards from your trash to your deck and shuffle it: This Character gains and +10000 power during this battle. (This card deals 2 damage.)
    {
      cardId: 'OP05-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'elizabello-ii-080-when-attacking-once-return-20-trash-and-shuffle-plus-10000',
            text: '[When Attacking][Once Per Turn] You may return 20 cards from your trash to your deck and shuffle it: This Character gains +10000 power during this battle.',
            trigger: {
              type: 'whenAttacking',
              optional: true,
              oncePerTurn: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 20 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
              },
            ],
            actions: [
              { type: 'shuffleDeck', player: 'self' },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 10000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
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
            text: '[Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'stick-stickem-meteora-039-counter-plus-4000-then-ko-rested-cost-3-or-less',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
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
        {
          kind: 'standard',
          effect: {
            id: 'stick-stickem-meteora-039-trigger-ko-rested-cost-5-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.",
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
                    costMax: 5,
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
    // OP05-056 X.Barrels
    // [On Play] You may place 1 of your Characters other than this Character at the bottom of your deck: Draw 1 card.
    {
      cardId: 'OP05-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'x-barrels-056-on-play-bottom-own-other-character-draw-1',
            text: '[On Play] You may place 1 of your Characters other than this Character at the bottom of your deck: Draw 1 card.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    excludeName: ['X.Barrels'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP05-111 Hotori
    // [On Play] You may play 1 [Kotori] from your hand: Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up.
    {
      cardId: 'OP05-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hotori-111-on-play-play-kotori-then-add-opponent-cost-3-or-less-to-life',
            text: "[On Play] You may play 1 [Kotori] from your hand: Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    name: ['Kotori'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
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
                destinationZone: 'life',
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP05-085 Nefeltari Cobra
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] Trash 1 card from the top of your deck.
    {
      cardId: 'OP05-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nefeltari-cobra-085-on-play-trash-top-deck-1',
            text: '[On Play] Trash 1 card from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 1 }],
          },
        },
      ],
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
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'let-us-begin-the-world-of-violence-059-main-if-multicolored-draw-1-return-cost-5-or-less',
            text: "[Main] If your Leader is multicolored, draw 1 card. Then, return up to 1 Character with a cost of 5 or less to the owner's hand.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
        {
          kind: 'standard',
          effect: {
            id: 'let-us-begin-the-world-of-violence-059-trigger-if-multicolored-draw-2',
            text: '[Trigger] If your Leader is multicolored, draw 2 cards.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP05-072 Hone-Kichi
    // [On Play] If you have 8 or more DON!! cards on your field, give up to 2 of your opponent's Characters 2000 power during this turn.
    {
      cardId: 'OP05-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hone-kichi-072-on-play-if-total-don-8-or-more-minus-2000',
            text: "[On Play] If you have 8 or more DON!! cards on your field, give up to 2 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
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
    // OP05-075 Mr.1 (Daz.Bonez)
    // [On Your Opponent's Attack][Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play up to 1 [Baroque Works] type Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP05-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-1-075-on-opponent-attack-once-remove-1-play-baroque-works-cost-3-or-less',
            text: "[On Your Opponent's Attack][Once Per Turn] DON!! -1: Play up to 1 [Baroque Works] type Character card with a cost of 3 or less from your hand.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
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
    // OP05-103 Kotori
    // [On Play] If you have [Hotori], K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.
    {
      cardId: 'OP05-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kotori-103-on-play-if-have-hotori-ko-cost-equal-to-opponent-life',
            text: "[On Play] If you have [Hotori], K.O. up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], name: ['Hotori'] },
                },
                value: 1,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
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
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'saint-mjosgard-089-activate-main-cost-1-rest-self-and-one-character-add-black-cost-1-from-trash',
            text: '[Activate:Main] (1) You may rest this Character and 1 of your Characters: Add up to 1 black Character card with a cost of 1 from your trash to your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
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
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
                    costMin: 1,
                    costMax: 1,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
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
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'birdcage-040-doflamingo-characters-cost-5-or-less-skip-refresh',
            text: "If your Leader is [Donquixote Doflamingo], all Characters with a cost of 5 or less do not become active in your and your opponent's Refresh Phases.",
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Donquixote Doflamingo',
              },
            ],
            modifier: {
              selector: {
                player: 'either',
                zones: ['characters'],
                filter: { cardCategory: ['Character'], costMax: 5 },
              },
              skipNextRefreshPhases: 1,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'birdcage-040-end-of-your-turn-if-10-don-ko-rested-cost-5-or-less-then-trash-this-stage',
            text: '[End of Your Turn] If you have 10 DON!! cards on your field, K.O. all rested Characters with a cost of 5 or less. Then, trash this Stage.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              {
                type: 'playerHasTotalDonAtLeast',
                player: 'self',
                value: 10,
              },
            ],
            actions: [
              {
                type: 'koAllCharacters',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 5,
                  },
                },
                reason: 'effect',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
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
    // OP05-021 Revolutionary Army HQ (Reprint)
    // [Activate:Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 [Revolutionary Army] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP05-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'revolutionary-army-hq-021-activate-main-trash-1-rest-self-search-top-3',
            text: '[Activate:Main] You may trash 1 card from your hand and rest this Stage: Look at 3 cards from the top of your deck; reveal up to 1 [Revolutionary Army] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                  zones: ['stage'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Revolutionary Army'] },
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
    // OP05-097 Mary Geoise (Reprint)
    // [Your Turn] The cost of playing [Celestial Dragons] type Character cards with a cost of 2 or more from your hand will be reduced by 1.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP05-097',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'mary-geoise-097-your-turn-celestial-dragons-cost-minus-1',
            text: '[Your Turn] The cost of playing [Celestial Dragons] type Character cards with a cost of 2 or more from your hand will be reduced by 1.',
            conditions: [{ type: 'controllerTurn', value: true }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['hand'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Celestial Dragons'],
                  costMin: 2,
                },
              },
              cost: -1,
            },
          },
        },
      ],
    },
    // OP05-024 Kuween
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP05-024',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kuween-024-blocker',
            text: '[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP05-029 Donquixote Doflamingo (029)
    // [On Your Opponent's Attack][Once Per Turn] (1) (You may rest the specified number of DON!! cards in your cost area.): Rest up to 1 of your opponent's Characters with a cost of 6 or less.
    {
      cardId: 'OP05-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-029-on-opponent-attack-once-remove-1-rest-cost-6-or-less',
            text: "[On Your Opponent's Attack][Once Per Turn] (1): Rest up to 1 of your opponent's Characters with a cost of 6 or less.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
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
  ],
};
