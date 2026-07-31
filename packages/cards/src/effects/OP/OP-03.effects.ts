import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const op03EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-03',
  cards: [
    // OP03-050 Boodle
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] You may trash 1 card from the top of your deck.
    {
      cardId: 'OP03-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boodle-on-ko-trash-top-1',
            text: '[On K.O.] You may trash 1 card from the top of your deck.',
            trigger: { type: 'onKo', optional: true },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP03-081 Kalifa (081) (Alternate Art)
    // [On Play] Draw 2 cards and trash 2 cards from your hand. Then, give up to 1 of your opponent's Characters -2 cost during this turn.
    {
      cardId: 'OP03-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kalifa-081-on-play-draw-2-trash-2-minus-2-cost',
            text: "[On Play] Draw 2 cards and trash 2 cards from your hand. Then, give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'onPlay' },
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
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP03-070 Monkey.D.Luffy
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.) You may trash 1 Character card with a cost of 5 from your hand: This Character gains [Rush] during this turn. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP03-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-070-on-play-remove-1-trash-cost-5-character-gain-rush',
            text: '[On Play] DON!! -1 You may trash 1 Character card with a cost of 5 from your hand: This Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 5,
                    costMax: 5,
                  },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
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
    // OP03-032 Buggy (032)
    // This Character cannot be K.O.'d in battle by "Slash" attribute cards.
    {
      cardId: 'OP03-032',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'buggy-032-cannot-be-koed-by-slash-in-battle',
            text: 'This Character cannot be K.O.\'d in battle by "Slash" attribute cards.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedBySlashInBattle'],
            },
          },
        },
      ],
    },
    // OP03-092 Rob Lucci (092) (Alternate Art)
    // [On Play] You may place 2 cards with a type including "CP" from your trash at the bottom of your deck in any order: This Character gains [Rush] during this turn. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP03-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rob-lucci-092-on-play-return-2-cp-from-trash-gain-rush',
            text: '[On Play] You may place 2 cards with a type including "CP" from your trash at the bottom of your deck in any order: This Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['CP'] },
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
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
    // OP03-003 Izo
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Whitebeard Pirates" other than [Izo] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP03-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'izo-003-on-play-search-top-5-whitebeard-pirates',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Whitebeard Pirates" other than [Izo] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Whitebeard Pirates'],
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
      ],
    },
    // OP03-078 Issho (Alternate Art)
    // [DON!! x1] [Your Turn] Give all of your opponent's Characters -3 cost. [On Play] If your opponent has 6 or more cards in their hand, trash 2 cards from your opponent's hand.
    {
      cardId: 'OP03-078',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'issho-don-1-your-turn-all-opponent-characters-minus-3-cost',
            text: "[DON!! x1] [Your Turn] Give all of your opponent's Characters -3 cost.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'opponent',
                zones: ['characters'],
                filter: { cardCategory: ['Character'] },
              },
              cost: -3,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'issho-on-play-if-opponent-hand-6-or-more-trash-2',
            text: "[On Play] If your opponent has 6 or more cards in their hand, trash 2 cards from your opponent's hand.",
            trigger: { type: 'onPlay' },
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
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP03-112 Charlotte Pudding (OP03-112)
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 [Sanji] or "Big Mom Pirates" type card other than [Charlotte Pudding] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP03-112',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-112-on-play-search-top-4-sanji-or-big-mom-pirates',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 [Sanji] or "Big Mom Pirates" type card other than [Charlotte Pudding] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Big Mom Pirates'],
                  name: ['Sanji'],
                  excludeName: ['Charlotte Pudding'],
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
    // OP03-044 Kaya (Reprint)
    // [On Play] Draw 2 cards and trash 2 cards from your hand.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP03-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaya-044-on-play-draw-2-trash-2',
            text: '[On Play] Draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
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
    // OP03-056 Sanji's Pilaf
    // [Main] Draw 2 cards.   [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP03-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanjis-pilaf-main-draw-2',
            text: '[Main] Draw 2 cards.',
            trigger: { type: 'activateMain' },
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sanjis-pilaf-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP03-056',
                effectId: 'sanjis-pilaf-main-draw-2',
              },
            ],
          },
        },
      ],
    },
    // OP03-114 Charlotte Linlin (SP)
    // [On Play] If your Leader has the [Big Mom Pirates] type, add up to 1 card from the top of your deck to the top of your Life cards. Then, trash up to 1 card from the top of your opponent's Life cards.
    {
      cardId: 'OP03-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-linlin-114-on-play-add-top-deck-to-life-then-trash-opponent-life',
            text: "[On Play] If your Leader has the [Big Mom Pirates] type, add up to 1 card from the top of your deck to the top of your Life cards. Then, trash up to 1 card from the top of your opponent's Life cards.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Big Mom Pirates',
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
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP03-089 Brannew
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 "Navy" type card other than [Brannew] and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP03-089',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brannew-on-play-search-top-3-navy-trash-rest',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 "Navy" type card other than [Brannew] and add it to your hand. Then, trash the rest.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Navy'],
                  excludeName: ['Brannew'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP03-072 Gum-Gum Jet Gatling (Alternate Art)
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP03-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-jet-gatling-counter-trash-1-plus-3000',
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
            id: 'gum-gum-jet-gatling-trigger-add-1-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP03-108 Charlotte Cracker (Alternate Art)
    // [DON!! x1] If you have less Life cards than your opponent, this Character gains [Double Attack] and +1000 power. (This card deals 2 damage.)[Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP03-108',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'charlotte-cracker-don-1-if-less-life-than-opponent-double-attack-plus-1000',
            text: '[DON!! x1] If you have less Life cards than your opponent, this Character gains [Double Attack] and +1000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 1000,
              keywords: ['doubleAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-cracker-trigger-trash-1-play-this-card',
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
                  zones: ['trash'],
                  filter: { name: ['Charlotte Cracker'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-013 Marco (Alternate Art)
    // [Your Turn] [On Play] K.O. up to 1 of your opponent's Characters with 3000 power or less. [On K.O.] You may trash 1 Event from your hand
    {
      cardId: 'OP03-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marco-013-your-turn-on-play-ko-power-3000-or-less',
            text: "[Your Turn] [On Play] K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
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
        {
          kind: 'standard',
          effect: {
            id: 'marco-013-on-ko-trash-event-play-self-rested',
            text: '[On K.O.] You may trash 1 Event from your hand: You may play this Character card from your trash rested.',
            trigger: { type: 'onKo', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Event'] },
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
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP03-086 Spandam (Alternate Art)
    // [On Play] If your Leader's type include "CP", look at 3 cards from the top of your deck; reveal up to 1 card with a type including "CP" other than [Spandam] and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP03-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spandam-on-play-if-cp-leader-search-top-3-cp-trash-rest',
            text: '[On Play] If your Leader\'s type include "CP", look at 3 cards from the top of your deck; reveal up to 1 card with a type including "CP" other than [Spandam] and add it to your hand. Then, trash the rest.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'CP' },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['CP'],
                  excludeName: ['Spandam'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP03-055 Gum-Gum Giant Gavel
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader gains +4000 power during this battle. Then, you may trash 2 cards from the top of your deck. [Trigger] Return up to 1 Character with a cost of 4 or less to the owner's hand.
    {
      cardId: 'OP03-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-giant-gavel-counter-trash-1-leader-plus-4000-then-trash-top-2',
            text: '[Counter] You may trash 1 card from your hand: Up to 1 of your Leader gains +4000 power during this battle. Then, you may trash 2 cards from the top of your deck.',
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
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-giant-gavel-trigger-bounce-cost-4-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 4 or less to the owner's hand.",
            trigger: { type: 'trigger' },
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP03-054 Usopp's Rubber Band of Doom!!!
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, you may trash 1 card from the top of your deck. [Trigger] Draw 1 card and you may trash 1 card from the top of your deck.  This card has been officially errata'd.
    {
      cardId: 'OP03-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopps-rubber-band-of-doom-counter-plus-2000-then-trash-top-1',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, you may trash 1 card from the top of your deck.',
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
                type: 'trashFromDeck',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'usopps-rubber-band-of-doom-trigger-draw-1-and-trash-top-1',
            text: '[Trigger] Draw 1 card and you may trash 1 card from the top of your deck.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP03-018 Fire Fist (Alternate Art)
    // [Main] You may trash 1 Event from your hand: K.O. up to 1 of your opponent's Characters with 5000 power or less and up to 1 of your opponent's Characters with 4000 power or less. [Trigger] K.O. up to 1 of your opponent's Characters with 5000 power or less.
    {
      cardId: 'OP03-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fire-fist-main-trash-1-event-ko-5000-and-4000',
            text: "[Main] You may trash 1 Event from your hand: K.O. up to 1 of your opponent's Characters with 5000 power or less and up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Event'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 5000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 4000 },
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
            id: 'fire-fist-trigger-ko-5000-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 5000 power or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 5000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP03-097 Six King Pistol (Reprint)
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.[Trigger] Draw 1 card. Then, K.O. up to 1 of your opponent's Characters with a cost of 1 or less.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP03-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'six-king-pistol-counter-trash-1-plus-3000',
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
            id: 'six-king-pistol-trigger-draw-1-then-ko-cost-1-or-less',
            text: "[Trigger] Draw 1 card. Then, K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
    // OP03-113 Charlotte Perospero (Alternate Art)
    // [On K.O.] Look at 3 cards from the top of your deck; reveal up to 1 [Big Mom Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.[Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP03-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-perospero-on-ko-search-top-3-big-mom-pirates',
            text: '[On K.O.] Look at 3 cards from the top of your deck; reveal up to 1 [Big Mom Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Big Mom Pirates'] },
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
            id: 'charlotte-perospero-trigger-trash-1-play-this-card',
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
                  zones: ['trash'],
                  filter: { name: ['Charlotte Perospero'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-080 Kaku (080) (Alternate Art)
    // [On Play] You may place 2 cards with a type including "CP" from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP03-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaku-080-on-play-return-2-cp-from-trash-ko-cost-3-or-less',
            text: '[On Play] You may place 2 cards with a type including "CP" from your trash at the bottom of your deck in any order: K.O. up to 1 of your opponent\'s Characters with a cost of 3 or less.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['CP'] },
                  count: { kind: 'exact', value: 2 },
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
    // OP03-123 Charlotte Katakuri (Alternate Art)
    // [On Play] Add up to 1 Character with a cost of 8 or less to the top or bottom of the owner's Life cards face-up.
    {
      cardId: 'OP03-123',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-katakuri-123-on-play-put-character-cost-8-or-less-into-owners-life-face-up',
            text: "[On Play] Add up to 1 Character with a cost of 8 or less to the top or bottom of the owner's Life cards face-up.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 8,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                faceDown: false,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP03-121 Thunder Bolt
    // [Main] You may trash 1 card from the top of your Life cards: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.   [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP03-121',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thunder-bolt-main-trash-top-life-ko-cost-5-or-less',
            text: "[Main] You may trash 1 card from the top of your Life cards: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
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
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'thunder-bolt-trigger-ko-cost-5-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP03-095 Soap Sheep
    // [Main] Give up to 2 of your opponent's Characters -2 cost during this turn. [Trigger] Your opponent trashes 1 card from their hand.
    {
      cardId: 'OP03-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'soap-sheep-main-minus-2-cost-up-to-2',
            text: "[Main] Give up to 2 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 2 },
                },
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'soap-sheep-trigger-opponent-trashes-1',
            text: '[Trigger] Your opponent trashes 1 card from their hand.',
            trigger: { type: 'trigger' },
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
    // OP03-025 Krieg (Alternate Art)
    // [On Play] You may trash 1 card from your hand: K.O. up to 2 of your opponent's rested Characters with a cost of 4 or less. [DON!! x1] This Character gains [Double Attack]. (This card deals 2 damage.)
    {
      cardId: 'OP03-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'krieg-on-play-trash-1-ko-up-to-2-rested-cost-4-or-less',
            text: "[On Play] You may trash 1 card from your hand: K.O. up to 2 of your opponent's rested Characters with a cost of 4 or less.",
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
                  count: { kind: 'upTo', value: 2 },
                },
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'krieg-don-1-gains-double-attack',
            text: '[DON!! x1] This Character gains [Double Attack].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['doubleAttack'],
            },
          },
        },
      ],
    },
    // OP03-029 Chew
    // [On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less. [Trigger] Play this card.
    {
      cardId: 'OP03-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chew-on-play-ko-rested-cost-4-or-less',
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
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'chew-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Chew'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-116 Shirahoshi (OP03-116) (Reprint)
    // [On Play] Draw 3 cards and trash 2 cards from your hand.[Trigger] Play this card.Disclaimer: This card was reprinted from the original set with changes to the artist credit (note the lack of pen symbol next to the artist name).
    {
      cardId: 'OP03-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirahoshi-116-on-play-draw-3-trash-2',
            text: '[On Play] Draw 3 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'draw', player: 'self', amount: 3 },
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
            id: 'shirahoshi-116-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Shirahoshi'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-066 Paulie (Alternate Art)
    // [On Play] (2) (You may rest the specified number of DON!! cards in your cost area.): Add up to 1 DON!! card from your DON!! deck and set it as active. Then, if you have 8 or more DON!! cards on your field, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP03-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'paulie-on-play-pay-2-add-1-active-don',
            text: '[On Play] (2) Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'paulie-on-play-if-total-don-7-or-more-ko-cost-4-or-less',
            text: "Then, if you have 8 or more DON!! cards on your field, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 7 },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              { type: 'addDon', player: 'self', amount: 1 },
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
    // OP03-102 Sanji
    // [DON!! x2] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP03-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-102-don-2-when-attacking-life-top-or-bottom-to-hand-then-add-top-deck-to-life',
            text: '[DON!! x2] [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
      ],
    },
    // OP03-041 Usopp (Alternate Art)
    // [Rush] (This card can attack on the turn in which it is played.) [DON!! x1] When this Character's attack deals damage to your opponent's Life, you may trash 7 cards from the top of your deck.
    {
      cardId: 'OP03-041',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'usopp-041-rush',
            text: '[Rush] (This card can attack on the turn in which it is played.)',
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
        {
          kind: 'standard',
          effect: {
            id: 'usopp-041-don-1-on-life-damage-trash-top-7',
            text: "[DON!! x1] When this Character's attack deals damage to your opponent's Life, you may trash 7 cards from the top of your deck.",
            trigger: { type: 'onLifeDamageDealt', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 7 }],
          },
        },
      ],
    },
    // OP03-122 Sogeking (Manga)
    // Also treat this card's name as [Usopp] according to the rules.[On Play] Return up to 1 Character with a cost of 6 or less to the owner's hand. Then, draw 2 cards and trash 2 cards from your hand.Disclaimer: This card was reprinted from the original set without the original textured foil.
    {
      cardId: 'OP03-122',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sogeking-122-on-play-return-cost-6-or-less-draw-2-trash-2',
            text: "[On Play] Return up to 1 Character with a cost of 6 or less to the owner's hand. Then, draw 2 cards and trash 2 cards from your hand.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
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
    // OP03-026 Kuroobi
    // [On Play] If your Leader has the [East Blue] type, rest up to 1 of your opponent's Characters. [Trigger] Play this card.
    {
      cardId: 'OP03-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuroobi-on-play-if-east-blue-leader-rest-up-to-1',
            text: "[On Play] If your Leader has the [East Blue] type, rest up to 1 of your opponent's Characters.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
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
        {
          kind: 'standard',
          effect: {
            id: 'kuroobi-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Kuroobi'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-008 Buggy - OP03-008 (Reprint)
    // This Character cannot be K.O.'d in battle by "Slash" attribute cards.[On Play] Look at 5 cards from the top of your deck; reveal up to 1 red Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP03-008',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'buggy-008-cannot-be-koed-by-slash-in-battle',
            text: 'This Character cannot be K.O.\'d in battle by "Slash" attribute cards.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedBySlashInBattle'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'buggy-008-on-play-search-top-5-red-event',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 red Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Event'],
                  color: ['Red'],
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
    // OP03-047 Zeff (Alternate Art)
    // [DON!! x1] When this Character's attack deals damage to your opponent's Life, you may trash 7 cards from the top of your deck. [On Play] Return up to 1 Character with a cost of 3 or less to the owner's hand, and you may trash 2 cards from the top of your deck.  This card has been officially errata'd.
    {
      cardId: 'OP03-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zeff-047-don-1-on-life-damage-trash-top-7',
            text: "[DON!! x1] When this Character's attack deals damage to your opponent's Life, you may trash 7 cards from the top of your deck.",
            trigger: { type: 'onLifeDamageDealt', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 7 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'zeff-047-on-play-bounce-cost-3-or-less-then-may-trash-top-2',
            text: "[On Play] Return up to 1 Character with a cost of 3 or less to the owner's hand, and you may trash 2 cards from the top of your deck.",
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
                destinationZone: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'zeff-047-on-play-may-trash-top-2',
            text: '[On Play] ... and you may trash 2 cards from the top of your deck.',
            trigger: { type: 'onPlay', optional: true },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP03-051 Bell-mere
    // [DON!! x1] When this Character's attack deals damage to your opponent's Life, you may trash 7 cards from the top of your deck. [On K.O.] You may trash 3 cards from the top of your deck.
    {
      cardId: 'OP03-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bell-mere-051-don-1-on-life-damage-trash-top-7',
            text: "[DON!! x1] When this Character's attack deals damage to your opponent's Life, you may trash 7 cards from the top of your deck.",
            trigger: { type: 'onLifeDamageDealt', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 7 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'bell-mere-051-on-ko-trash-top-3',
            text: '[On K.O.] You may trash 3 cards from the top of your deck.',
            trigger: { type: 'onKo', optional: true },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
      ],
    },
    // OP03-017 Cross Fire
    // [Main] / [Counter] If your Leader's type includes "Whitebeard Pirates", give up to 1 of your opponent's Characters -4000 power during this turn. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP03-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cross-fire-main-minus-4000-if-whitebeard-pirates-leader',
            text: '[Main] If your Leader\'s type includes "Whitebeard Pirates", give up to 1 of your opponent\'s Characters -4000 power during this turn.',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'cross-fire-counter-minus-4000-if-whitebeard-pirates-leader',
            text: '[Counter] If your Leader\'s type includes "Whitebeard Pirates", give up to 1 of your opponent\'s Characters -4000 power during this turn.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
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
                amount: -4000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'cross-fire-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP03-017',
                effectId:
                  'cross-fire-main-minus-4000-if-whitebeard-pirates-leader',
              },
            ],
          },
        },
      ],
    },
    // OP03-033 Hatchan
    // [Trigger] If your Leader has the [East Blue] type, play this card.
    {
      cardId: 'OP03-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hatchan-trigger-if-east-blue-play-this-card',
            text: '[Trigger] If your Leader has the [East Blue] type, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Hatchan'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-110 Charlotte Smoothie
    // [When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains +2000 power during this battle.
    // [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP03-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-smoothie-110-when-attacking-life-top-or-bottom-to-hand-plus-2000',
            text: '[When Attacking] You may add 1 card from the top or bottom of your Life cards to your hand: This Character gains +2000 power during this battle.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
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
                amount: 2000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-smoothie-110-trigger-trash-1-play-self',
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
    // OP03-057 Three Thousand Worlds
    // [Main] Place up to 1 Character with a cost of 5 or less at the bottom of the owner's deck.   [Trigger] Place up to 1 Character with a cost of 3 or less at the bottom of the owner's deck.
    {
      cardId: 'OP03-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'three-thousand-worlds-main-bottom-deck-cost-5-or-less',
            text: "[Main] Place up to 1 Character with a cost of 5 or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
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
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'three-thousand-worlds-trigger-bottom-deck-cost-3-or-less',
            text: "[Trigger] Place up to 1 Character with a cost of 3 or less at the bottom of the owner's deck.",
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
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP03-016 Flame Emperor
    // [Main] If your Leader is [Portgas.D.Ace], K.O. up to 1 of your opponent's Characters with 8000 power or less, and your Leader gains [Double Attack] and +3000 power during this turn. (This card deals 2 damage.) [Trigger] K.O. up to 1 of your opponent's Characters with 6000 power or less.
    {
      cardId: 'OP03-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'flame-emperor-main-if-portgas-d-ace-ko-8000-or-less-and-gain-double-attack-plus-3000',
            text: "[Main] If your Leader is [Portgas.D.Ace], K.O. up to 1 of your opponent's Characters with 8000 power or less, and your Leader gains [Double Attack] and +3000 power during this turn.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Portgas.D.Ace',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 8000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['doubleAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
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
            id: 'flame-emperor-trigger-ko-6000-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 6000 power or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 6000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP03-079 Vergo
    // [DON!! x1] This Character cannot be K.O.'d in battle.
    {
      cardId: 'OP03-079',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'vergo-don-1-cannot-be-koed-in-battle',
            text: "[DON!! x1] This Character cannot be K.O.'d in battle.",
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedInBattle'],
            },
          },
        },
      ],
    },
    // OP03-119 Buzz Cut Mochi
    // [Main] If you have less Life cards than your opponent, K.O. up to 1 of your opponent's Characters with a cost of 4 or less. [Trigger] Play up to 1 Character card with a cost of 4 or less and a [Trigger] from your hand.
    {
      cardId: 'OP03-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buzz-cut-mochi-main-if-less-life-than-opponent-ko-cost-4-or-less',
            text: "[Main] If you have less Life cards than your opponent, K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
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
        {
          kind: 'standard',
          effect: {
            id: 'buzz-cut-mochi-trigger-play-cost-4-or-less-with-trigger',
            text: '[Trigger] Play up to 1 Character card with a cost of 4 or less and a [Trigger] from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    hasTrigger: true,
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
    // OP03-060 Kalifa (Jolly Roger Foil)
    // [When Attacking] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP03-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kalifa-060-when-attacking-remove-1-draw-2-trash-1',
            text: '[When Attacking] DON!! -1 Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'whenAttacking' },
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
    // OP03-030 Nami (030)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 green [East Blue] type card other than [Nami] and add it to your hand. Then, place the rest at the bottom of your deck in any order. [Trigger] Play this card.
    {
      cardId: 'OP03-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-030-on-play-search-top-5-green-east-blue',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 green [East Blue] type card other than [Nami] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  color: ['Green'],
                  trait: ['East Blue'],
                  excludeName: ['Nami'],
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
            id: 'nami-030-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Nami'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-012 Marshall.D.Teach
    // [When Attacking] You may trash 1 of your red Characters with 4000 power or more: Draw 1 card. Then, this Character gains +1000 power during this battle.
    {
      cardId: 'OP03-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marshall-d-teach-when-attacking-trash-red-character-4000-draw-1-plus-1000',
            text: '[When Attacking] You may trash 1 of your red Characters with 4000 power or more: Draw 1 card. Then, this Character gains +1000 power during this battle.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    powerMin: 4000,
                  },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
    // OP03-071 Rob Lucci (071)
    // [When Attacking] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP03-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rob-lucci-071-when-attacking-remove-1-rest-cost-5-or-less',
            text: "[When Attacking] DON!! -1 Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // OP03-019 Fiery Doll
    // [Main] Your Leader gains +4000 power during this turn. [Trigger] Give up to 1 of your opponent's Leader or Character cards -10000 power during this turn.
    {
      cardId: 'OP03-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fiery-doll-main-leader-plus-4000',
            text: '[Main] Your Leader gains +4000 power during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
            id: 'fiery-doll-trigger-minus-10000',
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
    // OP03-048 Nojiko (Reprint)
    // [On Play] If your Leader is [Nami], return up to 1 of your opponent's Characters with a cost of 5 or less to the owner's hand.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP03-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nojiko-on-play-if-leader-nami-bounce-cost-5-or-less',
            text: "[On Play] If your Leader is [Nami], return up to 1 of your opponent's Characters with a cost of 5 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Nami' },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
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
    // OP03-120 Tropical Torment
    // [Main] If your opponent has 4 or more Life cards, trash up to 1 card from the top of your opponent's Life cards. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP03-120',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tropical-torment-main-if-opponent-life-4-or-more-trash-top-life',
            text: "[Main] If your opponent has 4 or more Life cards, trash up to 1 card from the top of your opponent's Life cards.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'opponent', zones: ['life'] },
                value: 4,
              },
            ],
            actions: [
              {
                type: 'moveFirstCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'tropical-torment-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP03-120',
                effectId:
                  'tropical-torment-main-if-opponent-life-4-or-more-trash-top-life',
              },
            ],
          },
        },
      ],
    },
    // OP03-098 Enies Lobby
    // [Activate:Main] You may rest this Stage: If your Leader's type includes "CP", give up to 1 of your opponent's Characters -2 cost during this turn. [Trigger] Play this card.
    {
      cardId: 'OP03-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'enies-lobby-activate-main-rest-self-if-cp-leader-minus-2-cost',
            text: '[Activate:Main] You may rest this Stage: If your Leader\'s type includes "CP", give up to 1 of your opponent\'s Characters -2 cost during this turn.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
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
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'CP' },
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
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'enies-lobby-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Enies Lobby'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // OP03-062 Kokoro
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Water Seven] type card other than [Kokoro] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP03-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kokoro-on-play-search-top-5-water-seven',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Water Seven] type card other than [Kokoro] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Water Seven'], excludeName: ['Kokoro'] },
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
    // OP03-090 Blueno
    // [DON!! x1] [This Character gains [Blocker]. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] Play up to 1 Character card with a type including "CP" and a cost of 4 or less from your trash rested.
    {
      cardId: 'OP03-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blueno-on-ko-play-cp-cost-4-or-less-from-trash-rested',
            text: '[On K.O.] Play up to 1 Character card with a type including "CP" and a cost of 4 or less from your trash rested.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['CP'],
                    costMax: 4,
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
    // OP03-115 Streusen
    // [On Play] You may trash 1 card with a [Trigger] from your hand: K.O. up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP03-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'streusen-on-play-trash-trigger-card-ko-cost-1-or-less',
            text: "[On Play] You may trash 1 card with a [Trigger] from your hand: K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
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
        },
      ],
    },
    // OP03-009 Haruta
    // [Activate:Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP03-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'haruta-activate-main-once-per-turn-attach-1-rested-don',
            text: '[Activate:Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
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
    // OP03-014 Monkey.D.Garp
    // [When Attacking] Play up to 1 red Character card with a cost of 1 from your hand.
    {
      cardId: 'OP03-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-when-attacking-play-red-cost-1-from-hand',
            text: '[When Attacking] Play up to 1 red Character card with a cost of 1 from your hand.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    costMin: 1,
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
    // OP03-107 Charlotte Galette
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP03-107',
      effects: [],
    },
    // OP03-118 Ikoku Sovereignty
    // [Counter] Up to 1 of your Leader or Character cards gains +5000 power during this battle. [Trigger] You may trash 2 cards from your hand: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP03-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ikoku-sovereignty-counter-plus-5000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +5000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 5000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ikoku-sovereignty-trigger-trash-2-add-top-deck-to-life',
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
    // OP03-117 Napoleon
    // [Activate:Main] You may rest this Character: Up to 1 of your [Charlotte Linlin] cards gains +1000 power until the start of your next turn. [Trigger] Play this card.
    {
      cardId: 'OP03-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'napoleon-activate-main-rest-self-plus-1000-charlotte-linlin',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your [Charlotte Linlin] cards gains +1000 power until the start of your next turn.',
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
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Charlotte Linlin'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'napoleon-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Napoleon'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-028 Jango
    // [On Play] Choose one: • Set up to 1 of your [East Blue] type Leader or Character cards with a cost of 6 or less as active. • Rest this Character and up to 1 of your opponent's Characters.
    {
      cardId: 'OP03-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jango-028-on-play-choose-one',
            text: "[On Play] Choose one: Set up to 1 of your [East Blue] type Leader or Character cards with a cost of 6 or less as active. Or rest this Character and up to 1 of your opponent's Characters.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choisissez un effet pour Jango.',
                choices: [
                  {
                    id: 'unrest-east-blue',
                    label: 'Redresser East Blue',
                    actions: [
                      {
                        type: 'unrest',
                        selector: {
                          player: 'self',
                          zones: ['leader', 'characters'],
                          filter: {
                            trait: ['East Blue'],
                            costMax: 6,
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                      },
                    ],
                  },
                  {
                    id: 'rest-self-and-opponent',
                    label: 'Reposer Jango et 1 adversaire',
                    actions: [
                      {
                        type: 'rest',
                        selector: {
                          player: 'self',
                          source: 'effectSource',
                          zones: ['characters'],
                          count: { kind: 'exact', value: 1 },
                        },
                      },
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
                ],
              },
            ],
          },
        },
      ],
    },
    // OP03-088 Fukurou
    // This Character cannot be K.O.'d by effects. [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP03-088',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'fukurou-088-replace-effect-ko',
            text: "This Character cannot be K.O.'d by effects.",
            event: 'wouldKoCharacter',
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [],
          },
        },
      ],
    },
    // OP03-068 Minozebra
    // [Banish] (When this card deals damage, the target card is trashed without activating its Trigger.) [On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP03-068',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'minozebra-has-banish',
            text: '[Banish] (When this card deals damage, the target card is trashed without activating its Trigger.)',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['banish'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'minozebra-on-ko-if-impel-down-add-rested-don',
            text: '[On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    // OP03-020 Striker
    // [Activate:Main] (2) (You may rest the specified number of DON!! cards in your cost area.) You may rest this Stage: If your Leader is [Portgas.D.Ace], look at 5 cards from the top of your deck; reveal up to 1 Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP03-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'striker-activate-main-pay-2-rest-self-if-ace-search-top-5-event',
            text: '[Activate:Main] (2) You may rest this Stage: If your Leader is [Portgas.D.Ace], look at 5 cards from the top of your deck; reveal up to 1 Event and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 2 },
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
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Portgas.D.Ace',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { cardCategory: ['Event'] },
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
    // OP03-005 Thatch
    // [Activate:Main] [Once Per Turn] This Character gains +2000 power during this turn. Then, trash this Character at the end of this turn.
    {
      cardId: 'OP03-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'thatch-activate-main-once-per-turn-plus-2000',
            text: '[Activate:Main] [Once Per Turn] This Character gains +2000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
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
        {
          kind: 'standard',
          effect: {
            id: 'thatch-end-of-turn-trash-self',
            text: 'Then, trash this Character at the end of this turn.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              { type: 'cardInZone', zone: 'characters' },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP03-015 Lim
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP03-015',
      effects: [],
    },
    // OP03-010 Fossa
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP03-010',
      effects: [],
    },
    // OP03-104 Shirley
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards.
    {
      cardId: 'OP03-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirley-104-on-play-look-at-top-life-and-reposition',
            text: "[On Play] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'life-card',
                selector: {
                  player: 'either',
                  chooser: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'life-card',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP03-059 Kaku (059)
    // [When Attacking] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character gains [Banish] during this battle. (When this card deals damage, the target card is trashed without activating its Trigger.)
    {
      cardId: 'OP03-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaku-059-when-attacking-remove-1-gain-banish',
            text: '[When Attacking] DON!! -1 This Character gains [Banish] during this battle.',
            trigger: { type: 'whenAttacking' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP03-074 Top Knot
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Place up to 1 of your opponent's Characters with a cost of 4 or less at the bottom of the owner's deck. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP03-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'top-knot-main-remove-1-bottom-deck-cost-4-or-less',
            text: "[Main] DON!! -1 Place up to 1 of your opponent's Characters with a cost of 4 or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
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
        {
          kind: 'standard',
          effect: {
            id: 'top-knot-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP03-074',
                effectId: 'top-knot-main-remove-1-bottom-deck-cost-4-or-less',
              },
            ],
          },
        },
      ],
    },
    // OP03-024 Gin (Alternate Art)
    // [On Play] If your Leader has the [East Blue] type, rest up to 2 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP03-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gin-on-play-if-east-blue-leader-rest-up-to-2-cost-4-or-less',
            text: "[On Play] If your Leader has the [East Blue] type, rest up to 2 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP03-069 Minorhinoceros
    // [On K.O.] If your Leader has the [Impel Down] type, draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP03-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'minorhinoceros-on-ko-if-impel-down-draw-2-trash-1',
            text: '[On K.O.] If your Leader has the [Impel Down] type, draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
              },
            ],
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
    // OP03-038 Deathly Poison Gas Bomb MH5
    // [Main] Rest up to 2 of your opponent's Characters with a cost of 2 or less. [Trigger] Rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP03-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'deathly-poison-gas-bomb-mh5-main-rest-up-to-2-cost-2-or-less',
            text: "[Main] Rest up to 2 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'deathly-poison-gas-bomb-mh5-trigger-rest-up-to-1-cost-5-or-less',
            text: "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'trigger' },
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
    // OP03-037 Tooth Attack
    // [Main] You may rest 1 of your [East Blue] type Characters: K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less. [Trigger] Play up to 1 Character card with a cost of 4 or less and a [Trigger] from your hand.
    {
      cardId: 'OP03-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tooth-attack-main-rest-east-blue-ko-rested-cost-3-or-less',
            text: "[Main] You may rest 1 of your [East Blue] type Characters: K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['East Blue'],
                    rested: false,
                  },
                  count: { kind: 'exact', value: 1 },
                },
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
            id: 'tooth-attack-trigger-play-cost-4-or-less-character-with-trigger',
            text: '[Trigger] Play up to 1 Character card with a cost of 4 or less and a [Trigger] from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    hasTrigger: true,
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
    // OP03-075 Galley-La Company
    // [Activate:Main] You may rest this Stage: If your Leader is [Iceburg], add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP03-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'galley-la-company-activate-main-rest-self-if-iceburg-add-rested-don',
            text: '[Activate:Main] You may rest this Stage: If your Leader is [Iceburg], add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
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
            conditions: [
              { type: 'playerHasLeaderName', player: 'self', value: 'Iceburg' },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    // OP03-004 Curiel
    // This Character cannot attack a Leader on the turn in which it is played. [DON!! x1] This Character gains [Rush]. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP03-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'curiel-004-cannot-attack-leader-on-turn-played',
            text: 'This Character cannot attack a Leader on the turn in which it is played.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotAttackLeaderOnTurnPlayed'],
            },
          },
        },
        {
          kind: 'continuous',
          effect: {
            id: 'curiel-004-don-1-gain-rush',
            text: '[DON!! x1] This Character gains [Rush].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // OP03-096 Tempest Kick Sky Slicer
    // [Main] K.O. up to 1 of your opponent's Characters with a cost of 0 or your opponent's Stages with a cost of 3 or less. [Trigger] Draw 2 cards.
    {
      cardId: 'OP03-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tempest-kick-sky-slicer-096-main-choose-character-or-stage',
            text: "[Main] K.O. up to 1 of your opponent's Characters with a cost of 0 or your opponent's Stages with a cost of 3 or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choisissez une cible pour Tempest Kick Sky Slicer.',
                choices: [
                  {
                    id: 'ko-character-cost-0',
                    label: 'Personnage coût 0',
                    actions: [
                      {
                        type: 'ko',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: {
                            cardCategory: ['Character'],
                            costMax: 0,
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                        upTo: true,
                        reason: 'effect',
                      },
                    ],
                  },
                  {
                    id: 'trash-stage-cost-3-or-less',
                    label: 'Lieu coût 3 ou moins',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['stage'],
                          filter: {
                            cardCategory: ['Stage'],
                            costMax: 3,
                          },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'selectedCardOwner',
                        destinationZone: 'trash',
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
            id: 'tempest-kick-sky-slicer-096-trigger-draw-2',
            text: '[Trigger] Draw 2 cards.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP03-105 Charlotte Oven
    // [DON!! x1] [When Attacking] You may trash 1 card with a [Trigger] from your hand: This Character gains +3000 power during this battle.
    {
      cardId: 'OP03-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-oven-don-1-when-attacking-trash-trigger-card-plus-3000',
            text: '[DON!! x1] [When Attacking] You may trash 1 card with a [Trigger] from your hand: This Character gains +3000 power during this battle.',
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'exact', value: 1 },
                },
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
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP03-045 Carne
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [Opponent's Turn] If you have 20 or less cards in your deck, this Character gains +3000 power.
    {
      cardId: 'OP03-045',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'carne-opponents-turn-if-deck-20-or-less-plus-3000',
            text: "[Opponent's Turn] If you have 20 or less cards in your deck, this Character gains +3000 power.",
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['deck'] },
                value: 20,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 3000,
            },
          },
        },
      ],
    },
    // OP03-094 Air Door
    // [Main] If your Leader's type includes "CP", look at 5 cards from the top of your deck; play up to 1 Character card with a type including "CP" and a cost of 5 or less. Then, trash the rest. [Trigger] Play up to 1 black Character card with a cost of 3 or less from your trash.
    {
      cardId: 'OP03-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'air-door-main-if-cp-leader-play-cp-cost-5-or-less-from-top-5-trash-rest',
            text: '[Main] If your Leader\'s type includes "CP", look at 5 cards from the top of your deck; play up to 1 Character card with a type including "CP" and a cost of 5 or less. Then, trash the rest.',
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'CP' },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['CP'],
                  costMax: 5,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'air-door-trigger-play-black-cost-3-or-less-from-trash',
            text: '[Trigger] Play up to 1 black Character card with a cost of 3 or less from your trash.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Black'],
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
    // OP03-065 Chimney & Gonbe
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP03-065',
      effects: [],
    },
    // OP03-031 Pearl
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP03-031',
      effects: [],
    },
    // OP03-093 Wanze
    // [On Play] You may trash 1 card from your hand: If your Leader's type includes "CP", K.O. up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP03-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'wanze-on-play-trash-1-if-cp-leader-ko-cost-1-or-less',
            text: '[On Play] You may trash 1 card from your hand: If your Leader\'s type includes "CP", K.O. up to 1 of your opponent\'s Characters with a cost of 1 or less.',
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
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'CP' },
            ],
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
        },
      ],
    },
    // OP03-064 Tilestone
    // [On K.O.] If your Leader has the [Galley-La Company] type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP03-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tilestone-on-ko-if-galley-la-company-add-rested-don',
            text: '[On K.O.] If your Leader has the [Galley-La Company] type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Galley-La Company',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    // OP03-011 Blamenco
    // [DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'OP03-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blamenco-don-1-when-attacking-minus-2000',
            text: "[DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters -2000 power during this turn.",
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
    // OP03-053 Yosaku & Johnny
    // [DON!! x1] If you have 20 or less cards in your deck, this Character gains +2000 power.
    {
      cardId: 'OP03-053',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'yosaku-johnny-don-1-if-deck-20-or-less-plus-2000',
            text: '[DON!! x1] If you have 20 or less cards in your deck, this Character gains +2000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['deck'] },
                value: 20,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // OP03-091 Helmeppo
    // [On Play] Set the cost of up to 1 of your opponent's Characters with no base effect to 0 during this turn.
    {
      cardId: 'OP03-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'helmeppo-091-on-play-set-no-base-effect-character-cost-to-0',
            text: "[On Play] Set the cost of up to 1 of your opponent's Characters with no base effect to 0 during this turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    hasNoBaseEffect: true,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -99,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP03-063 Zambai
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the [Water Seven] type, draw 1 card.
    {
      cardId: 'OP03-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zambai-on-play-remove-1-if-water-seven-draw-1',
            text: '[On Play] DON!! -1 If your Leader has the [Water Seven] type, draw 1 card.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Water Seven',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP03-034 Buchi
    // [On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.
    {
      cardId: 'OP03-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buchi-on-play-ko-rested-cost-2-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 2 or less.",
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
    // OP03-067 Peepley Lulu
    // [DON!! x1] [When Attacking] If your Leader has the [Galley-La Company] type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP03-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'peepley-lulu-don-1-when-attacking-if-galley-la-company-add-rested-don',
            text: '[DON!! x1] [When Attacking] If your Leader has the [Galley-La Company] type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Galley-La Company',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    // OP03-043 Gaimon
    // When you deal damage to your opponent's Life, you may trash 3 cards from the top of your deck. If you do, trash this Character.
    {
      cardId: 'OP03-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gaimon-043-on-life-damage-trash-top-3-then-trash-self',
            text: "When you deal damage to your opponent's Life, you may trash 3 cards from the top of your deck. If you do, trash this Character.",
            trigger: { type: 'onLifeDamageDealt', optional: true },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            actions: [
              { type: 'trashFromDeck', player: 'self', amount: 3 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP03-100 Kingbaum
    // [Trigger] You may trash 1 card from the top or bottom of your Life cards: Play this card.
    {
      cardId: 'OP03-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kingbaum-100-trigger-trash-life-top-or-bottom-play-self',
            text: '[Trigger] You may trash 1 card from the top or bottom of your Life cards: Play this card.',
            trigger: { type: 'trigger', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
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
    // OP03-027 Sham
    // [On Play] If your Leader has the [East Blue] type, rest up to 1 of your opponent's Characters with a cost of 2 or less and, if you don't have [Buchi], play up to 1 [Buchi] from your hand.
    {
      cardId: 'OP03-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sham-on-play-if-east-blue-rest-cost-2-or-less',
            text: "[On Play] If your Leader has the [East Blue] type, rest up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
            ],
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sham-on-play-if-no-buchi-play-buchi-from-hand',
            text: "And, if you don't have [Buchi], play up to 1 [Buchi] from your hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'East Blue',
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Buchi'] },
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
                  filter: { name: ['Buchi'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP03-039 One, Two, Jango
    // [Main] Rest up to 1 of your opponent's Characters with a cost of 1 or less. Then, up to 1 of your Characters gains +1000 power during this turn.
    {
      cardId: 'OP03-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'one-two-jango-main-rest-cost-1-or-less-then-plus-1000',
            text: "[Main] Rest up to 1 of your opponent's Characters with a cost of 1 or less. Then, up to 1 of your Characters gains +1000 power during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
    // OP03-002 Adio
    // [DON!! x1] [When Attacking] Your opponent cannot activate a [Blocker] Character that has 2000 or less power during this battle.
    {
      cardId: 'OP03-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'adio-don-1-when-attacking-opponent-2000-or-less-cannot-block',
            text: '[DON!! x1] [When Attacking] Your opponent cannot activate a [Blocker] Character that has 2000 or less power during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 2000 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP03-042 Usopp's Pirate Crew
    // [On Play] Add up to 1 blue [Usopp from your trash to your hand.
    {
      cardId: 'OP03-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopps-pirate-crew-on-play-add-blue-usopp-from-trash',
            text: '[On Play] Add up to 1 blue [Usopp] from your trash to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { color: ['Blue'], name: ['Usopp'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP03-036 Out-of-the-Bag
    // [Main] You may rest 1 of your [East Blue] type Characters: Set up to 1 of your [Kuro] cards as active. [Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.
    {
      cardId: 'OP03-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'out-of-the-bag-main-rest-east-blue-unrest-kuro',
            text: '[Main] You may rest 1 of your [East Blue] type Characters: Set up to 1 of your [Kuro] cards as active.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['East Blue'], rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Kuro'], rested: true },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'out-of-the-bag-trigger-ko-rested-cost-3-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
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
    // OP03-049 Patty
    // [On Play] If you have 20 or less cards in your deck, return up to 1 Character with a cost of 3 or less to the owner's hand.
    {
      cardId: 'OP03-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'patty-on-play-if-deck-20-or-less-bounce-cost-3-or-less',
            text: "[On Play] If you have 20 or less cards in your deck, return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['deck'] },
                value: 20,
              },
            ],
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
    // OP03-073 Hull Dismantler Slash
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the [Water Seven] type, K.O. up to 1 of your opponent's Characters with a cost of 2 or less. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP03-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hull-dismantler-slash-main-remove-1-if-water-seven-ko-cost-2-or-less',
            text: "[Main] DON!! -1 If your Leader has the [Water Seven] type, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Water Seven',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hull-dismantler-slash-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP03-073',
                effectId:
                  'hull-dismantler-slash-main-remove-1-if-water-seven-ko-cost-2-or-less',
              },
            ],
          },
        },
      ],
    },
    // OP03-040 Nami (040) (Alternate Art)
    // When your deck is reduced to 0, you win the game instead of losing, according to the rules. [DON!! x1] When this Leader's attack deals damage to your opponent's Life, you may trash 1 card from the top of your deck.
    {
      cardId: 'OP03-040',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nami-040-win-on-deck-out',
            text: 'When your deck is reduced to 0, you win the game instead of losing, according to the rules.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['leader'],
              },
              keywords: ['winOnDeckOut'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nami-040-don-1-on-life-damage-trash-top-deck-1',
            text: "[DON!! x1] When this Leader's attack deals damage to your opponent's Life, you may trash 1 card from the top of your deck.",
            trigger: { type: 'onLifeDamageDealt', optional: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP03-022 Arlong (Alternate Art)
    // [DON!! x2] [When Attacking (1) (You may rest the specified number of DON!! cards in your cost area.): Play up to 1 Character card with a cost of 4 or less and a [Trigger] from your hand.
    {
      cardId: 'OP03-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'arlong-don-2-when-attacking-pay-1-play-cost-4-or-less-with-trigger',
            text: '[DON!! x2] [When Attacking] (1) Play up to 1 Character card with a cost of 4 or less and a [Trigger] from your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
                    hasTrigger: true,
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
    // OP03-001 Portgas.D.Ace (Alternate Art)
    // When this Leader attacks or is attacked, you may trash any number of Event or Stage cards from your hand. This Leader gains +1000 power during this battle for every card trashed.
    {
      cardId: 'OP03-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-001-when-attacking-trash-events-or-stages-for-power',
            text: 'When this Leader attacks, you may trash any number of Event or Stage cards from your hand. This Leader gains +1000 power during this battle for every card trashed.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'trashed-cards',
                selector: {
                  player: 'self',
                  chooser: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Event', 'Stage'],
                  },
                  count: { kind: 'upTo', value: 99 },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'trashed-cards',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              {
                type: 'modifyPowerByStoredCount',
                key: 'trashed-cards',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amountPerCard: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-ace-001-on-attacked-trash-events-or-stages-for-power',
            text: 'When this Leader is attacked, you may trash any number of Event or Stage cards from your hand. This Leader gains +1000 power during this battle for every card trashed.',
            trigger: { type: 'onAttacked' },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'trashed-cards',
                selector: {
                  player: 'self',
                  chooser: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Event', 'Stage'],
                  },
                  count: { kind: 'upTo', value: 99 },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'trashed-cards',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              {
                type: 'modifyPowerByStoredCount',
                key: 'trashed-cards',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amountPerCard: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP03-076 Rob Lucci (076) (Alternate Art)
    // [Your Turn] [Once Per Turn] You may trash 2 cards from your hand: When your opponent's Character is K.O.'d, set this Leader as active.
    {
      cardId: 'OP03-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rob-lucci-076-your-turn-on-opponent-ko-trash-2-unrest-leader',
            text: "[Your Turn] [Once Per Turn] You may trash 2 cards from your hand: When your opponent's Character is K.O.'d, set this Leader as active.",
            trigger: { type: 'onKo', oncePerTurn: true, optional: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              { type: 'eventPlayerIs', player: 'opponent' },
            ],
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
    // OP03-077 Charlotte Linlin (077) (Alternate Art)
    // [DON!! x2] [When Attacking] (2) (You may rest the specified number of DON!! cards in your cost area.) You may trash 1 card from your hand: If you have 1 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP03-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-linlin-077-don-2-when-attacking-pay-2-trash-1-if-life-1-add-top-deck-to-life',
            text: '[DON!! x2] [When Attacking] (2) You may trash 1 card from your hand: If you have 1 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'whenAttacking', optional: true },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            costs: [
              { type: 'removeDon', player: 'self', amount: 2 },
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
    // OP03-099 Charlotte Katakuri (OP03-099)
    // [DON!! x1] [When Attacking] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, this Leader gains +1000 power during this battle.
    {
      cardId: 'OP03-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-katakuri-099-don-1-when-attacking-look-at-top-life-and-reposition-then-plus-1000',
            text: "[DON!! x1] [When Attacking] Look at up to 1 card from the top of your or your opponent's Life cards, and place it at the top or bottom of the Life cards. Then, this Leader gains +1000 power during this battle.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'life-card',
                selector: {
                  player: 'either',
                  chooser: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'life-card',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
                chooseDestinationPosition: true,
              },
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['leader'],
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
    // OP03-058 Iceburg (Alternate Art)
    // This Leader cannot attack. [Activate:Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.) You may rest this Leader: Play up to 1 [Galley-La Company] type Character card with a cost of 5 or less from your hand.
    {
      cardId: 'OP03-058',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'iceburg-058-cannot-attack',
            text: 'This Leader cannot attack.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['leader'],
              },
              keywords: ['cannotAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'iceburg-058-activate-main-remove-1-rest-self-play-galley-la-cost-5-or-less',
            text: '[Activate:Main] DON!! -1 You may rest this Leader: Play up to 1 [Galley-La Company] type Character card with a cost of 5 or less from your hand.',
            trigger: { type: 'activateMain' },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['leader'],
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
                    trait: ['Galley-La Company'],
                    costMax: 5,
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
    // OP03-021 Kuro (Alternate Art)
    // [Activate:Main] (3) (You may rest the specified number of DON!! cards in your cost area.) You may rest 2 of your [East Blue] type Characters: Set this Leader as active, and rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP03-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuro-activate-main-pay-3-rest-2-east-blue-unrest-leader-rest-cost-5-or-less',
            text: "[Activate:Main] (3) You may rest 2 of your [East Blue] type Characters: Set this Leader as active, and rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 3 },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['East Blue'], rested: false },
                  count: { kind: 'exact', value: 2 },
                },
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
    // OP03-083 Corgy
    // [On Play] Look at 5 cards from the top of your deck and trash up to 2 cards. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP03-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'corgy-on-play-look-top-5-trash-up-to-2-bottom-rest',
            text: '[On Play] Look at 5 cards from the top of your deck and trash up to 2 cards. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {},
                count: { kind: 'upTo', value: 2 },
                destination: 'trash',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP03-109 Charlotte Chiffon
    // [On Play] You may trash 1 card from the top or bottom of your Life cards: Add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP03-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-chiffon-109-on-play-trash-life-top-or-bottom-add-top-deck-to-life',
            text: '[On Play] You may trash 1 card from the top or bottom of your Life cards: Add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'topOrBottom' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
      ],
    },
  ],
};
