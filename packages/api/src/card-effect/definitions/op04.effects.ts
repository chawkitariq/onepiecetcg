import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op04EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP04',
  cards: [
    // OP04-010 Tony Tony.Chopper
    // [On Play] Play up to 1 [Animal] type Character card with 3000 power or less from your hand.
    {
      cardId: 'OP04-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-010-on-play-play-animal-3000-or-less',
            text: '[On Play] Play up to 1 [Animal] type Character card with 3000 power or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Animal'],
                    powerMax: 3000,
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
    // OP04-056 Gum-Gum Red Roc
    // [Main] Place up to 1 Character at the bottom of the owner's deck.   [Trigger] Place up to 1 Character with a cost of 4 or less at the bottom of the owner's deck.
    {
      cardId: 'OP04-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-red-roc-main-bottom-deck-character',
            text: "[Main] Place up to 1 Character at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
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
            id: 'gum-gum-red-roc-trigger-bottom-deck-cost-4-or-less',
            text: "[Trigger] Place up to 1 Character with a cost of 4 or less at the bottom of the owner's deck.",
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
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP04-100 Capone"Gang"Bege (OP04-100) (Full Art)
    // [Trigger] Up to 1 of your opponent's Leader or Character cards cannot attack during this turn.
    {
      cardId: 'OP04-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'capone-gang-bege-100-trigger-restrict-attack',
            text: "[Trigger] Up to 1 of your opponent's Leader or Character cards cannot attack during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 0,
              },
            ],
          },
        },
      ],
    },
    // OP04-083 Sabo - OP04-083 (Reprint)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play] None of your Characters can be K.O.'d by effects until the start of your next turn. Then, draw 2 cards and trash 2 cards from your hand.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP04-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sabo-083-on-play-grant-cannot-be-koed-by-effects-to-own-characters',
            text: "[On Play] None of your Characters can be K.O.'d by effects until the start of your next turn.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 5 },
                },
                keywords: ['cannotBeKoedByEffects'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sabo-083-on-play-draw-2-trash-2',
            text: 'Then, draw 2 cards and trash 2 cards from your hand.',
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
    // OP04-031 Donquixote Doflamingo (Alternate Art)
    // [On Play] Up to a total of 3 of your opponent's rested Leader and Character cards will not become active in your opponent's next Refresh Phase.
    {
      cardId: 'OP04-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-031-on-play-skip-next-refresh-up-to-3-rested',
            text: "[On Play] Up to a total of 3 of your opponent's rested Leader and Character cards will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  filter: { rested: true },
                  count: { kind: 'upTo', value: 3 },
                },
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP04-009 Super Spot-Billed Duck Troops
    // [When Attacking] You may give your 1 active Leader -5000 power during this turn: Return this Character to the owner's hand at the end of this turn.
    {
      cardId: 'OP04-009',
    },
    // OP04-016 Bad Manners Kick Course (Alternate Art)
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.[Trigger] Give up to 1 of your opponent's Leader or Character cards -3000 power during this turn.
    {
      cardId: 'OP04-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bad-manners-kick-course-counter-trash-1-plus-3000',
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
            id: 'bad-manners-kick-course-trigger-minus-3000',
            text: "[Trigger] Give up to 1 of your opponent's Leader or Character cards -3000 power during this turn.",
            trigger: { type: 'trigger' },
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
      ],
    },
    // OP04-112 Yamato (OP04-112) (Alternate Art)
    // [On Play] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the total of your and your opponent's Life cards. Then, if you have 1 or less Life cards, add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP04-112',
    },
    // OP04-104 Sanji (OP04-104) (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP04-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-104-trigger-trash-1-play-this-card',
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
                  filter: { name: ['Sanji'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-032 Baby 5 (OP04-032) (Reprint)
    // [End of Your Turn] You may trash this Character: Set up to 2 of your DON!! cards as active.Disclaimer: This card was reprinted from the original set with changes to the artist credit (note the lack of pen symbol next to the artist name).
    {
      cardId: 'OP04-032',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'baby-5-032-end-of-turn-trash-self-set-2-don-active',
            text: '[End of Your Turn] You may trash this Character: Set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd', optional: true },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            costs: [
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
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP04-119 Donquixote Rosinante (SP)
    // [Opponent's Turn] If this Character is rested, your active Characters with a base cost of 5 cannot be K.O.'d by effects.
    // [On Play] You may rest this Character: Play up to 1 green Character card with a cost of 5 from your hand.
    {
      cardId: 'OP04-119',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'donquixote-rosinante-119-opponent-turn-if-rested-own-active-cost-5-cannot-be-koed-by-effects',
            text: "[Opponent's Turn] If this Character is rested, your active Characters with a base cost of 5 cannot be K.O.'d by effects.",
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'sourceIsRested', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  baseCostMin: 5,
                  baseCostMax: 5,
                  rested: false,
                },
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-rosinante-119-on-play-rest-self-play-green-cost-5',
            text: '[On Play] You may rest this Character: Play up to 1 green Character card with a cost of 5 from your hand.',
            trigger: { type: 'onPlay', optional: true },
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Green'],
                    costMin: 5,
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
    // OP04-064 Ms. All Sunday (SP)
    // [On Play] Add up to 1 DON!! card from your DON!! deck and rest it. Then, if you have 6 or more DON!! cards on your field, draw 1 card.
    // [Trigger] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.
    {
      cardId: 'OP04-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ms-all-sunday-064-on-play-add-rested-don',
            text: '[On Play] Add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ms-all-sunday-064-on-play-if-total-don-6-or-more-draw-1',
            text: 'Then, if you have 6 or more DON!! cards on your field, draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 6 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ms-all-sunday-064-trigger-remove-2-play-this-card',
            text: '[Trigger] DON!! -2: Play this card.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Ms. All Sunday'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-021 Viola
    // [On Your Opponent's Attack] (2) (You may rest the specified number of DON!! cards in your cost area.): Rest up to 1 of your opponent's DON!! cards.
    {
      cardId: 'OP04-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'viola-on-opponent-attack-pay-2-rest-opponent-don',
            text: "[On Your Opponent's Attack] (2): Rest up to 1 of your opponent's DON!! cards.",
            trigger: { type: 'onAttacked' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP04-041 Apis
    // [On Play] You may trash 2 cards from your hand: Look at 5 cards from the top of your deck; reveal up to 1 [East Blue] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP04-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'apis-on-play-trash-2-search-top-5-east-blue',
            text: '[On Play] You may trash 2 cards from your hand: Look at 5 cards from the top of your deck; reveal up to 1 [East Blue] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay', optional: true },
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
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['East Blue'] },
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
    // OP04-044 Kaido (OP04-044) (Alternate Art)
    // [On Play] Return up to 1 Character with a cost of 8 or less and up to 1 Character with a cost of 3 or less to the owner's hand.
    {
      cardId: 'OP04-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kaido-044-on-play-return-cost-8-or-less-and-cost-3-or-less',
            text: "[On Play] Return up to 1 Character with a cost of 8 or less and up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 8 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
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
    // OP04-090 Monkey.D.Luffy (090) (Alternate Art)
    // This Character can also attack active Characters. [Activate:Main] [Once Per Turn] You may return 7 cards from your trash to the bottom of your deck in any order: Set this Character as active. Then, this Character will not become active in your next Refresh Phase.
    {
      cardId: 'OP04-090',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'monkey-d-luffy-090-can-attack-active-characters',
            text: 'This Character can also attack active Characters.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-luffy-090-activate-main-once-return-7-trash-unrest-self-skip-next-refresh',
            text: '[Activate:Main] [Once Per Turn] You may return 7 cards from your trash to the bottom of your deck in any order: Set this Character as active. Then, this Character will not become active in your next Refresh Phase.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 7 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
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
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP04-024 Sugar (SP)
    // [Opponent's Turn][Once Per Turn] When your opponent plays a Character, if your Leader has the [Donquixote Pirates] type, rest up to 1 of your opponent's Characters. Then, rest this Character.
    // [On Play] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP04-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sugar-024-opponent-turn-once-when-opponent-plays-character-rest-target-then-self',
            text: "[Opponent's Turn] [Once Per Turn] When your opponent plays a Character, if your Leader has the [Donquixote Pirates] type, rest up to 1 of your opponent's Characters. Then, rest this Character.",
            trigger: { type: 'onCharacterPlayed', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
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
              {
                type: 'rest',
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
        {
          kind: 'standard',
          effect: {
            id: 'sugar-024-on-play-rest-cost-4-or-less',
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
    // OP04-050 Hanger
    // [Activate:Main] You may trash 1 card from your hand and rest this Character: Draw 1 card.
    {
      cardId: 'OP04-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hanger-activate-main-trash-1-rest-self-draw-1',
            text: '[Activate:Main] You may trash 1 card from your hand and rest this Character: Draw 1 card.',
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
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP04-089 Bartolomeo
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP04-089',
      effects: [],
    },
    // OP04-105 Charlotte Amande
    // [Activate:Main] [Once Per Turn] You may trash 1 card with a [Trigger] from your hand: Rest up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'OP04-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-amande-activate-main-trash-trigger-rest-cost-2-or-less',
            text: "[Activate:Main] [Once Per Turn] You may trash 1 card with a [Trigger] from your hand: Rest up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { hasTrigger: true },
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
                  filter: { cardCategory: ['Character'], costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP04-092 Rebecca (092)
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 [Dressrosa] type card other than [Rebecca] and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP04-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rebecca-092-on-play-search-top-3-dressrosa-trash-rest',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 [Dressrosa] type card other than [Rebecca] and add it to your hand. Then, trash the rest.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Dressrosa'],
                  excludeName: ['Rebecca'],
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
    // OP04-118 Nefeltari Vivi (118) (Alternate Art)
    // All of your red Characters with a cost of 3 or more other than this Character gain [Rush]. (This card can attack on the turn in which it is played.
    {
      cardId: 'OP04-118',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nefeltari-vivi-118-all-red-characters-cost-3-or-more-gain-rush',
            text: 'All of your red Characters with a cost of 3 or more other than this Character gain [Rush].',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  color: ['Red'],
                  costMin: 3,
                  excludeName: ['Nefeltari Vivi'],
                },
              },
              keywords: ['rush'],
            },
          },
        },
      ],
    },
    // OP04-013 Pell (Alternate Art)
    // [DON!! x1] [When Attacking] K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'OP04-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pell-don-1-when-attacking-ko-4000-or-less',
            text: "[DON!! x1] [When Attacking] K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
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
      ],
    },
    // OP04-060 Crocodile (060) (Alternate Art)
    // [On Play] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader's type includes "Baroque Works", add up to 1 card from the top of your deck to the top of your Life cards. [On Your Opponent's Attack] [Once Per Turn] DON!! -1: Draw 1 card and trash 1 card from your hand.
    {
      cardId: 'OP04-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-060-on-play-remove-2-if-baroque-works-add-top-deck-to-life',
            text: '[On Play] DON!! -2: If your Leader\'s type includes "Baroque Works", add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
              },
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
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'crocodile-060-on-opponent-attack-once-remove-1-draw-1-trash-1',
            text: "[On Your Opponent's Attack] [Once Per Turn] DON!! -1: Draw 1 card and trash 1 card from your hand.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // OP04-082 Kyros (Alternate Art)
    // If this Character would be K.O.'d, you may rest your Leader or 1 [Corrida Coliseum] instead. [On Play] If your Leader is [Rebecca], K.O. up to 1 of your opponent's Characters with a cost of 1 or less. Then, trash 1 card from the top of your deck.
    {
      cardId: 'OP04-082',
    },
    // OP04-017 Happiness Punch
    // [Counter] Give up to 1 of your opponent's Leader or Character cards -2000 power during this turn. Then, if your Leader is active, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn.
    {
      cardId: 'OP04-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'happiness-punch-counter-minus-2000',
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
            id: 'happiness-punch-counter-if-leader-active-minus-1000',
            text: "Then, if your Leader is active, give up to 1 of your opponent's Leader or Character cards -1000 power during this turn.",
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
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
    // OP04-028 Diamante (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [DON!! x1] [End of Your Turn] If you have 2 or more active DON!! cards, set this Character as active.
    {
      cardId: 'OP04-028',
    },
    // OP04-001 Nefeltari Vivi (001) (Alternate Art)
    // This Leader cannot attack. [Activate:Main] [Once Per Turn] (2) (You may rest the specified number of DON!! cards in your cost area.): Draw 1 card and up to 1 of your Characters gains [Rush] during this turn. (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP04-001',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nefeltari-vivi-001-cannot-attack',
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
            id: 'nefeltari-vivi-001-activate-main-once-pay-2-draw-1-grant-rush',
            text: '[Activate:Main] [Once Per Turn] (2): Draw 1 card and up to 1 of your Characters gains [Rush] during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP04-035 Spiderweb
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, set up to 1 of your Characters as active. [Trigger] Up to 1 of your Leader gains +2000 power during this turn.
    {
      cardId: 'OP04-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spiderweb-counter-plus-4000-and-unrest-character',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, set up to 1 of your Characters as active.',
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
                type: 'unrest',
                selector: {
                  player: 'self',
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
            id: 'spiderweb-trigger-plus-2000-leader',
            text: '[Trigger] Up to 1 of your Leader gains +2000 power during this turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP04-029 Dellinger (Reprint)
    // [End of Your Turn] Set up to 1 of your DON!! cards as active.Disclaimer: This card was reprinted from the original set with changes to the artist credit (note the lack of pen symbol next to the artist name).
    {
      cardId: 'OP04-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dellinger-end-of-turn-set-1-don-active',
            text: '[End of Your Turn] Set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP04-066 Miss.Valentine(Mikita)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Baroque Works" and add it to your hand. Then, place the rest at the bottom of your deck in any order. [Trigger] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.
    {
      cardId: 'OP04-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-valentine-066-on-play-search-top-5-baroque-works',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Baroque Works" and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Baroque Works'] },
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
            id: 'miss-valentine-066-trigger-remove-1-play-this-card',
            text: '[Trigger] DON!! -1: Play this card.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Miss.Valentine(Mikita)'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-015 Roronoa Zoro
    // [On Play] Give up to 1 of your opponent's Characters -2000 power during this turn.
    {
      cardId: 'OP04-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-015-on-play-minus-2000',
            text: "[On Play] Give up to 1 of your opponent's Characters -2000 power during this turn.",
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
    // OP04-088 Hajrudin
    // [Activate:Main] You may rest your 1 Leader: Give up to 1 of your opponent's Characters -4 cost during this turn.
    {
      cardId: 'OP04-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hajrudin-activate-main-rest-leader-minus-4-cost',
            text: "[Activate:Main] You may rest your 1 Leader: Give up to 1 of your opponent's Characters -4 cost during this turn.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
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
                amount: -4,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP04-014 Monkey.D.Luffy (014)
    // [Banish] (When this card deals damage, the target card is trashed without activating its Trigger.)
    {
      cardId: 'OP04-014',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'monkey-d-luffy-014-has-banish',
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
      ],
    },
    // OP04-039 Rebecca (039) (Alternate Art)
    // This Leader cannot attack. [Activate:Main] [Once Per Turn] (1) (You may rest the specified number of DON!! cards in your cost area.): If you have 6 or less cards in your hand, look at 2 cards from the top of your deck; reveal up to 1 [Dressrosa] type card and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP04-039',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'rebecca-039-cannot-attack',
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
            id: 'rebecca-039-activate-main-once-pay-1-if-hand-6-or-less-search-top-2',
            text: '[Activate:Main] [Once Per Turn] (1): If you have 6 or less cards in your hand, look at 2 cards from the top of your deck; reveal up to 1 [Dressrosa] type card and add it to your hand. Then, trash the rest.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 6,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 2,
                filter: { trait: ['Dressrosa'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP04-093 Gum-Gum King Kong Gun
    // [Main] Up to 1 of your [Dressrosa] type Characters gains +6000 power during this turn. Then, if you have 15 or more cards in your trash, that card gains [Double Attack] during this turn. (This card deals 2 damage.) [Trigger] Draw 3 cards and trash 2 cards from your hand.
    {
      cardId: 'OP04-093',
    },
    // OP04-103 Kouzuki Hiyori
    // [On Play] Up to 1 of your [Land of Wano] type Leader or Character cards gains +1000 power during this turn. [Trigger] Play this card.
    {
      cardId: 'OP04-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-103-on-play-plus-1000-land-of-wano',
            text: '[On Play] Up to 1 of your [Land of Wano] type Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-103-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Kouzuki Hiyori'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-094 Trueno Bastardo
    // [Main] Choose up to 1 of your opponent's Characters with a cost of 4 or less and K.O. it. If you have 15 or more cards in your trash, choose up to 1 of your opponent's Characters with a cost of 6 or less instead of a Character with a cost of 4 or less. [Trigger] You may rest your Leader: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP04-094',
    },
    // OP04-036 Donquixote Family
    // [Counter] Look at 5 cards from the top of your deck; reveal up to 1 [Donquixote Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order. [Trigger] Activate this card's [Counter] effect.
    {
      cardId: 'OP04-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-family-counter-search-top-5-donquixote-pirates',
            text: '[Counter] Look at 5 cards from the top of your deck; reveal up to 1 [Donquixote Pirates] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateCounter' },
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
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-family-trigger-activate-counter',
            text: "[Trigger] Activate this card's [Counter] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP04-036',
                effectId:
                  'donquixote-family-counter-search-top-5-donquixote-pirates',
              },
            ],
          },
        },
      ],
    },
    // OP04-030 Trebol (Alternate Art)
    // [On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less. [On Your Opponent's Attack] (2) (You may rest the specified number of DON!! cards in your cost area.): Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP04-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trebol-030-on-play-ko-rested-cost-5-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 5 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                    rested: true,
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
            id: 'trebol-030-on-opponent-attack-pay-2-rest-cost-4-or-less',
            text: "[On Your Opponent's Attack] (2): Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onAttacked' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
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
    // OP04-011 Nami
    // [When Attacking] Reveal 1 card from the top of your deck. If the revealed card is a Character card with 6000 power or more, this Character gains +3000 power during this turn. Then, place the revealed card at the bottom of your deck.
    {
      cardId: 'OP04-011',
    },
    // OP04-063 Franky
    // [On Your Opponent's Attack] [Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the [Water Seven] type, up to 1 of your Leader or Character cards gains +1000 power during this battle.
    {
      cardId: 'OP04-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'franky-063-on-opponent-attack-once-remove-1-plus-1000-if-water-seven',
            text: "[On Your Opponent's Attack] [Once Per Turn] DON!! -1: If your Leader has the [Water Seven] type, up to 1 of your Leader or Character cards gains +1000 power during this battle.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
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
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP04-080 Gyats
    // [On Play] Up to 1 of your [Dressrosa] type Characters can also attack active Characters during this turn.
    {
      cardId: 'OP04-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gyats-on-play-grant-can-attack-active-characters',
            text: '[On Play] Up to 1 of your [Dressrosa] type Characters can also attack active Characters during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Dressrosa'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP04-004 Karoo
    // [Activate:Main] You may rest this Character: Give up to 1 rested DON!! card to each of your [Alabasta] type Characters.
    {
      cardId: 'OP04-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'karoo-activate-main-rest-self-attach-rested-don-to-each-alabasta',
            text: '[Activate:Main] You may rest this Character: Give up to 1 rested DON!! card to each of your [Alabasta] type Characters.',
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
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Alabasta'],
                  },
                  count: { kind: 'upTo', value: 5 },
                },
                player: 'self',
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP04-048 Sasaki
    // [On Play] Return all cards in your hand to your deck and shuffle your deck. Then, draw cards equal to the number you returned to your deck.
    {
      cardId: 'OP04-048',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op04-048-special',
        },
      ],
    },
    // OP04-026 Senor Pink
    // [When Attacking] (1) (You may rest the specified number of DON!! cards in your cost area.): If your Leader has the [Donquixote Pirates] type, rest up to 1 of your opponent's Characters with a cost of 4 or less. Then, set up to 1 of your DON!! cards as active at the end of this turn.
    {
      cardId: 'OP04-026',
    },
    // OP04-081 Cavendish
    // [DON!! x1] This Character can also attack active Characters. [When Attacking] You may rest your Leader: K.O. up to 1 of your opponent's Characters with a cost of 1 or less. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP04-081',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'cavendish-don-1-can-attack-active-characters',
            text: '[DON!! x1] This Character can also attack active Characters.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'cavendish-when-attacking-rest-leader-ko-cost-1-or-less-trash-top-2',
            text: "[When Attacking] You may rest your Leader: K.O. up to 1 of your opponent's Characters with a cost of 1 or less. Then, trash 2 cards from the top of your deck.",
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
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
              { type: 'trashFromDeck', player: 'self', amount: 2 },
            ],
          },
        },
      ],
    },
    // OP04-058 Crocodile (058) (Alternate Art)
    // [Opponent's Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck by your effect, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP04-058',
    },
    // OP04-051 Who's.Who (Alternate Art)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Animal Kingdom Pirates] type card other than [Who's.Who] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP04-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'whos-who-051-on-play-search-top-5-animal-kingdom-pirates',
            text: "[On Play] Look at 5 cards from the top of your deck; reveal up to 1 [Animal Kingdom Pirates] type card other than [Who's.Who] and add it to your hand. Then, place the rest at the bottom of your deck in any order.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Animal Kingdom Pirates'],
                  excludeName: ["Who's.Who"],
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
    // OP04-069 Mr.2.Bon.Kurei (Bentham)
    // [On Your Opponent's Attack] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character's base power becomes the same as the power of your opponent's attacking Leader or Character during this turn. [Trigger] DON!! -1: Play this card.
    {
      cardId: 'OP04-069',
    },
    // OP04-073 Mr.13 & Ms.Friday
    // [Activate:Main] You may trash this Character and 1 of your Characters with a type including "Baroque Works": Add up to 1 DON!! card from your DON!! deck and set it as active. [Trigger] Play this card.
    {
      cardId: 'OP04-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-13-and-ms-friday-activate-main-trash-2-add-active-don',
            text: '[Activate:Main] You may trash this Character and 1 of your Characters with a type including "Baroque Works": Add up to 1 DON!! card from your DON!! deck and set it as active.',
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
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Baroque Works'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'mr-13-and-ms-friday-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Mr.13 & Ms.Friday'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-102 Kin'emon
    // [Activate:Main] [Once Per Turn] (1) (You may rest the specified number of DON!! cards in your cost area.) You may add 1 card from the top or bottom of your Life cards to your hand: Set this Character as active.
    {
      cardId: 'OP04-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kinemon-102-activate-main-once-pay-1-take-top-or-bottom-life-unrest-self',
            text: '[Activate:Main] [Once Per Turn] (1) You may add 1 card from the top or bottom of your Life cards to your hand: Set this Character as active.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
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
    // OP04-038 The Weak Do Not Have the Right to Choose How They Die!!!
    // [Main] / [Counter] Rest up to 1 of your opponent's Leader or Character cards. Then, K.O. up to 1 of your opponent's rested Characters with a cost of 6 or less. [Trigger] Set up to 5 of your DON!! cards as active.
    {
      cardId: 'OP04-038',
    },
    // OP04-019 Donquixote Doflamingo (019) (Alternate Art)
    // [End of Your Turn] Set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP04-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'donquixote-doflamingo-019-end-of-turn-set-2-don-active',
            text: '[End of Your Turn] Set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP04-117 Heavenly Fire
    // [Main] Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up. [Trigger] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.
    {
      cardId: 'OP04-117',
    },
    // OP04-045 King
    // [On Play] Draw 1 card.
    {
      cardId: 'OP04-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'king-045-on-play-draw-1',
            text: '[On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP04-008 Chaka
    // [DON!! x1] [When Attacking] If your Leader is [Nefeltari Vivi], give up to 1 of your opponent's Characters -3000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 0 power or less.
    {
      cardId: 'OP04-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chaka-don-1-when-attacking-if-vivi-minus-3000',
            text: "[DON!! x1] [When Attacking] If your Leader is [Nefeltari Vivi], give up to 1 of your opponent's Characters -3000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 0 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nefeltari Vivi',
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
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    powerMax: 0,
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
    // OP04-020 Issho (Alternate Art)
    // [DON!! x1] [Your Turn] Give all of your opponent's Characters -1 cost. [End of Your Turn] (1) (You may rest the specified number of DON!! cards in your cost area.): Set up to 1 of your Characters with a cost of 5 or less as active.
    {
      cardId: 'OP04-020',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'issho-020-don-1-your-turn-all-opponent-characters-minus-1-cost',
            text: "[DON!! x1] [Your Turn] Give all of your opponent's Characters -1 cost.",
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
              cost: -1,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'issho-020-end-of-turn-pay-1-unrest-character-cost-5-or-less',
            text: '[End of Your Turn] (1): Set up to 1 of your Characters with a cost of 5 or less as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP04-003 Usopp
    // [On K.O.] K.O. up to 1 of your opponent's Characters with 5000 base power or less.
    {
      cardId: 'OP04-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'usopp-003-on-ko-ko-base-power-5000-or-less',
            text: "[On K.O.] K.O. up to 1 of your opponent's Characters with 5000 base power or less.",
            trigger: { type: 'onKo' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 5000,
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
    // OP04-002 Igaram
    // [Activate:Main] You may rest this Character and give your 1 active Leader -5000 power during this turn: Look at 5 cards from the top of your deck; reveal up to 1 [Alabasta] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP04-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'igaram-activate-main-rest-self-minus-5000-leader-search-top-5-alabasta',
            text: '[Activate:Main] You may rest this Character and give your 1 active Leader -5000 power during this turn: Look at 5 cards from the top of your deck; reveal up to 1 [Alabasta] type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
                amount: -5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Alabasta'] },
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
    // OP04-079 Orlumbus
    // [Activate:Main] [Once Per Turn] Give up to 1 of your opponent's Characters -4 cost during this turn and trash 2 cards from the top of your deck. Then, K.O. 1 of your [Dressrosa] type Characters.
    {
      cardId: 'OP04-079',
    },
    // OP04-065 Miss.Goldenweek(Marianne)
    // [On Play] If your Leader's type includes "Baroque Works", up to 1 of your opponent's Characters with a cost of 5 or less cannot attack until the start of your next turn. [Trigger] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.
    {
      cardId: 'OP04-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-goldenweek-065-on-play-if-baroque-works-restrict-attack',
            text: '[On Play] If your Leader\'s type includes "Baroque Works", up to 1 of your opponent\'s Characters with a cost of 5 or less cannot attack until the start of your next turn.',
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
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'miss-goldenweek-065-trigger-remove-1-play-this-card',
            text: '[Trigger] DON!! -1: Play this card.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Miss.Goldenweek(Marianne)'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-043 Ulti
    // [DON!! x1] [When Attacking] Return up to 1 Character with a cost of 2 or less to the owner's hand or the bottom of their deck.
    {
      cardId: 'OP04-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ulti-don-1-when-attacking-choose-return-cost-2-or-less',
            text: "[DON!! x1] [When Attacking] Return up to 1 Character with a cost of 2 or less to the owner's hand or the bottom of their deck.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choisissez la destination du personnage.',
                choices: [
                  {
                    id: 'to-hand',
                    label: 'Renvoyer en main',
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
                        destinationZone: 'hand',
                      },
                    ],
                  },
                  {
                    id: 'to-bottom-deck',
                    label: 'Mettre au-dessous du deck',
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
                ],
              },
            ],
          },
        },
      ],
    },
    // OP04-101 Carmel
    // [Your Turn] [On Play] Draw 1 card. [Trigger] Play this card. Then, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'OP04-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carmel-your-turn-on-play-draw-1',
            text: '[Your Turn] [On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'carmel-trigger-play-this-card-then-ko-cost-2-or-less',
            text: "[Trigger] Play this card. Then, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Carmel'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
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
    // OP04-099 Olin
    // Also treat this card's name as [Charlotte Linlin] according to the rules. [Trigger] If you have 1 or less Life cards, play this card.
    {
      cardId: 'OP04-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'olin-trigger-if-life-1-or-less-play-this-card',
            text: '[Trigger] If you have 1 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Olin'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-095 Barrier!!
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 15 or more cards in your trash, that card gains an additional +2000 power during this battle. [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP04-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'barrier-counter-plus-2000',
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
            id: 'barrier-counter-if-trash-15-or-more-additional-plus-2000',
            text: 'Then, if you have 15 or more cards in your trash, that card gains an additional +2000 power during this battle.',
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
                amount: 2000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'barrier-trigger-draw-2-trash-1',
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
    // OP04-074 Colors Trap
    // [Counter] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, rest up to 1 of your opponent's Characters with a cost of 4 or less. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP04-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'colors-trap-counter-remove-1-plus-1000-rest-cost-4-or-less',
            text: "[Counter] DON!! -1: Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'activateCounter' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1000,
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
            id: 'colors-trap-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP04-040 Queen (040) (Alternate Art)
    // [DON!! x1] [When Attacking] If you have a total of 4 or less cards in your Life area and hand, draw 1 card. If you have a Character with a cost of 8 or more, you may add up to 1 card from the top of your deck to the top of your Life cards instead of drawing 1 card.
    {
      cardId: 'OP04-040',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op04-040-special',
        },
      ],
    },
    // OP04-005 Kung Fu Jugon
    // If you have a [Kung Fu Jugon] other than this Character, this Character gains [Blocker]. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP04-005',
    },
    // OP04-042 Ipponmatsu
    // [On Play] Up to 1 of your "Slash" attribute Characters gains +3000 power during this turn. Then, trash 1 card from the top of your deck.
    {
      cardId: 'OP04-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ipponmatsu-on-play-plus-3000-slash-trash-top-1',
            text: '[On Play] Up to 1 of your "Slash" attribute Characters gains +3000 power during this turn. Then, trash 1 card from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    attribute: ['Slash'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
              { type: 'trashFromDeck', player: 'self', amount: 1 },
            ],
          },
        },
      ],
    },
    // OP04-052 Black Maria
    // [Activate:Main] (2) (You may rest the specified number of DON!! cards in your cost area.) You may rest this Character: Draw 1 card. [Trigger] Play this card.
    {
      cardId: 'OP04-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'black-maria-activate-main-pay-2-rest-self-draw-1',
            text: '[Activate:Main] (2) You may rest this Character: Draw 1 card.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 2 },
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
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'black-maria-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Black Maria'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-111 Hera
    // [Activate:Main] You may trash 1 of your [Homies] type Characters other than this Character and rest this Character: Set up to 1 of your [Charlotte Linlin] Characters as active. [Trigger] Play this card.
    {
      cardId: 'OP04-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hera-activate-main-trash-homies-rest-self-unrest-charlotte-linlin',
            text: '[Activate:Main] You may trash 1 of your [Homies] type Characters other than this Character and rest this Character: Set up to 1 of your [Charlotte Linlin] Characters as active.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    trait: ['Homies'],
                    excludeName: ['Hera'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
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
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Charlotte Linlin'] },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hera-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Hera'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-071 Mr.4 (Babe)
    // [On Your Opponent's Attack] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): This Character gains [Blocker] and +1000 power during this battle. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP04-071',
    },
    // OP04-070 Mr.3 (Galdino)
    // [On Your Opponent's Attack] [Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Give up to 1 of your opponent's Characters -1000 power during this turn.
    {
      cardId: 'OP04-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-3-070-on-opponent-attack-once-remove-1-minus-1000',
            text: "[On Your Opponent's Attack] [Once Per Turn] DON!! -1: Give up to 1 of your opponent's Characters -1000 power during this turn.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
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
                amount: -1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP04-108 Charlotte Moscato
    // [DON!! x1] This Character gains [Banish]. (When this card deals damage, the target card is trashed without activating its Trigger.) [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP04-108',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'charlotte-moscato-don-1-gain-banish',
            text: '[DON!! x1] This Character gains [Banish].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
            id: 'charlotte-moscato-trigger-trash-1-play-this-card',
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
                  filter: { name: ['Charlotte Moscato'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-085 Suleiman
    // [On Play] [When Attacking] If your Leader has the [Dressrosa] type, give up to 1 of your opponent's Characters -2 cost during this turn. Then, trash 1 card from the top of your deck.
    {
      cardId: 'OP04-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'suleiman-085-on-play-if-dressrosa-minus-2-cost-trash-top-1',
            text: "[On Play] If your Leader has the [Dressrosa] type, give up to 1 of your opponent's Characters -2 cost during this turn. Then, trash 1 card from the top of your deck.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Dressrosa',
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
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
              { type: 'trashFromDeck', player: 'self', amount: 1 },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'suleiman-085-when-attacking-if-dressrosa-minus-2-cost-trash-top-1',
            text: "[When Attacking] If your Leader has the [Dressrosa] type, give up to 1 of your opponent's Characters -2 cost during this turn. Then, trash 1 card from the top of your deck.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Dressrosa',
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
                amount: -2,
                duration: { type: 'untilEndOfTurn' },
              },
              { type: 'trashFromDeck', player: 'self', amount: 1 },
            ],
          },
        },
      ],
    },
    // OP04-076 Weakness...Is an Unforgivable Sin.
    // [Counter] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Up to 1 of your Leader or Character cards gains +1000 power during this turn. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP04-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'weakness-is-an-unforgivable-sin-counter-remove-1-plus-1000',
            text: '[Counter] DON!! -1: Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'activateCounter' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
        {
          kind: 'standard',
          effect: {
            id: 'weakness-is-an-unforgivable-sin-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP04-075 Nez-Palm Cannon
    // [Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle. Then, if you have 2 or less Life cards, add up to 1 DON!! card from your DON!! deck and rest it. [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP04-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nez-palm-cannon-counter-plus-6000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 6000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nez-palm-cannon-counter-if-life-2-or-less-add-rested-don',
            text: 'Then, if you have 2 or less Life cards, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nez-palm-cannon-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'addDon', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP04-046 Queen (046)
    // [On Play] If your Leader has the [Animal Kingdom Pirates] type, look at 7 cards from the top of your deck; reveal a total of 2 [Plague Rounds] or [Ice Oni] cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP04-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'queen-046-on-play-if-animal-kingdom-pirates-search-top-7-plague-rounds-or-ice-oni',
            text: '[On Play] If your Leader has the [Animal Kingdom Pirates] type, look at 7 cards from the top of your deck; reveal a total of 2 [Plague Rounds] or [Ice Oni] cards and add them to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Animal Kingdom Pirates',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 7,
                filter: { name: ['Plague Rounds', 'Ice Oni'] },
                count: { kind: 'upTo', value: 2 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP04-037 Flapping Thread
    // [Counter] If your Leader has the [Donquixote Pirates] type, up to 1 of your Leader or Character cards gains +2000 power during this turn. [Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.
    {
      cardId: 'OP04-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'flapping-thread-counter-if-donquixote-pirates-plus-2000',
            text: '[Counter] If your Leader has the [Donquixote Pirates] type, up to 1 of your Leader or Character cards gains +2000 power during this turn.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Donquixote Pirates',
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
        {
          kind: 'standard',
          effect: {
            id: 'flapping-thread-trigger-ko-rested-cost-4-or-less',
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
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP04-072 Mr.5 (Gem)
    // [On Your Opponent's Attack] [Once Per Turn] DON!! -2 (You may return the specified number of DON!! cards from your field to your DON!! deck.) You may rest this Character: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP04-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-5-072-on-opponent-attack-once-remove-2-rest-self-ko-cost-4-or-less',
            text: "[On Your Opponent's Attack] [Once Per Turn] DON!! -2 You may rest this Character: K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onAttacked', oncePerTurn: true, optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 2 },
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 4,
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
    // OP04-053 Page One
    // [DON!! x1] [Once Per Turn] When you activate an Event, draw 1 card. Then, place 1 card from your hand at the bottom of your deck.
    {
      cardId: 'OP04-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'page-one-don-1-on-event-activated-draw-1-bottom-deck-1',
            text: '[DON!! x1] [Once Per Turn] When you activate an Event, draw 1 card. Then, place 1 card from your hand at the bottom of your deck.',
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 1 },
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
    // OP04-116 Diable Jambe Joue Shot
    // [Counter] Up to 1 of your Leader or Character cards gains +6000 power during this battle. Then, if you and your opponent have a total of 4 or less Life cards, K.O. up to 1 of your opponent's Characters with a cost of 2 or less. [Trigger] Draw 1 card.
    {
      cardId: 'OP04-116',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op04-116-special',
        },
      ],
    },
    // OP04-047 Ice Oni
    // [Your Turn] At the end of a battle in which this Character battles your opponent's Character with a cost of 5 or less, place the opponent's Character you battled with at the bottom of the owner's deck.
    {
      cardId: 'OP04-047',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op04-047-special',
        },
      ],
    },
    // OP04-033 Machvise
    // [On Play] If your Leader has the [Donquixote Pirates] type, rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, set up to 1 of your DON!! cards as active at the end of this turn.
    {
      cardId: 'OP04-033',
    },
    // OP04-049 Jack
    // [On K.O.] Draw 1 card.
    {
      cardId: 'OP04-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jack-049-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP04-084 Stussy
    // [On Play] Look at 3 cards from the top of your deck and play up to 1 Character card with a type including "CP" other than [Stussy] and a cost of 2 or less. Then, trash the rest.
    {
      cardId: 'OP04-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'stussy-084-on-play-top-3-play-cp-cost-2-or-less-trash-rest',
            text: '[On Play] Look at 3 cards from the top of your deck and play up to 1 Character card with a type including "CP" other than [Stussy] and a cost of 2 or less. Then, trash the rest.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['CP'],
                  costMax: 2,
                  excludeName: ['Stussy'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP04-034 Lao.G
    // [End of Your Turn] If you have 3 or more active DON!! cards, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.
    {
      cardId: 'OP04-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lao-g-end-of-turn-if-3-active-don-ko-rested-cost-3-or-less',
            text: "[End of Your Turn] If you have 3 or more active DON!! cards, K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
            trigger: { type: 'onTurnEnd' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: false },
                },
                value: 3,
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
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP04-018 Enchanting Vertigo Dance
    // [Main] If your Leader has the [Alabasta] type, give up to 2 of your opponent's Characters -2000 power during this turn. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP04-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'enchanting-vertigo-dance-main-if-alabasta-minus-2000-up-to-2',
            text: "[Main] If your Leader has the [Alabasta] type, give up to 2 of your opponent's Characters -2000 power during this turn.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Alabasta',
              },
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
        {
          kind: 'standard',
          effect: {
            id: 'enchanting-vertigo-dance-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP04-018',
                effectId:
                  'enchanting-vertigo-dance-main-if-alabasta-minus-2000-up-to-2',
              },
            ],
          },
        },
      ],
    },
    // OP04-091 Leo
    // [On Play] You may rest your 1 Leader: If your Leader has the [Dressrosa] type, K.O. up to 1 of your opponent's Characters with a cost of 1 or less. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP04-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'leo-on-play-rest-leader-if-dressrosa-ko-cost-1-or-less-trash-top-2',
            text: "[On Play] You may rest your 1 Leader: If your Leader has the [Dressrosa] type, K.O. up to 1 of your opponent's Characters with a cost of 1 or less. Then, trash 2 cards from the top of your deck.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Dressrosa',
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
                    costMax: 1,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              { type: 'trashFromDeck', player: 'self', amount: 2 },
            ],
          },
        },
      ],
    },
    // OP04-006 Koza
    // [When Attacking] You may give your 1 active Leader -5000 power during this turn: This Character gains +2000 power until the start of your next turn.
    {
      cardId: 'OP04-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koza-when-attacking-minus-5000-leader-plus-2000-self',
            text: '[When Attacking] You may give your 1 active Leader -5000 power during this turn: This Character gains +2000 power until the start of your next turn.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { rested: false },
                  count: { kind: 'exact', value: 1 },
                },
                amount: -5000,
                duration: { type: 'untilEndOfTurn' },
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
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP04-115 Gun Modoki
    // [Main] You may add 1 card from the top or bottom of your Life cards to your hand: Up to 1 of your [Land of Wano] type Characters gains [Double Attack] during this turn. (This card deals 2 damage.) [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP04-115',
    },
    // OP04-067 Miss.MerryChristmas(Drophy)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [Trigger] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.
    {
      cardId: 'OP04-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'miss-merrychristmas-067-trigger-remove-1-play-this-card',
            text: '[Trigger] DON!! -1: Play this card.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Miss.MerryChristmas(Drophy)'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-098 Toko
    // [On Play] You may trash 2 [Land of Wano] type cards from your hand: If you have 1 or less Life cards, add 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP04-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'toko-on-play-trash-2-land-of-wano-if-life-1-or-less-add-top-deck-to-life',
            text: '[On Play] You may trash 2 [Land of Wano] type cards from your hand: If you have 1 or less Life cards, add 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
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
              },
            ],
          },
        },
      ],
    },
    // OP04-055 Plague Rounds
    // [Main] You may trash 1 [Ice Oni] from your hand and place 1 Character with a cost of 4 or less at the bottom of the owner's deck: Play 1 [Ice Oni] from your trash. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP04-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'plague-rounds-main-trash-ice-oni-bottom-deck-cost-4-or-less-play-ice-oni',
            text: "[Main] You may trash 1 [Ice Oni] from your hand and place 1 Character with a cost of 4 or less at the bottom of the owner's deck: Play 1 [Ice Oni] from your trash.",
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Ice Oni'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Ice Oni'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'plague-rounds-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP04-055',
                effectId:
                  'plague-rounds-main-trash-ice-oni-bottom-deck-cost-4-or-less-play-ice-oni',
              },
            ],
          },
        },
      ],
    },
    // OP04-057 Dragon Twister Demolition Breath
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, place up to 1 Character with a cost of 1 or less at the bottom of the owner's deck. [Trigger] Return up to 1 Character with a cost of 6 or less to the owner's hand.
    {
      cardId: 'OP04-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'dragon-twister-demolition-breath-counter-plus-4000-bottom-deck-cost-1-or-less',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, place up to 1 Character with a cost of 1 or less at the bottom of the owner's deck.",
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
                  filter: { cardCategory: ['Character'], costMax: 1 },
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
            id: 'dragon-twister-demolition-breath-trigger-return-cost-6-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 6 or less to the owner's hand.",
            trigger: { type: 'trigger' },
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
            ],
          },
        },
      ],
    },
    // OP04-012 Nefeltari Cobra
    // [Your Turn] All of your [Alabasta] type Characters other than this Character gain +1000 power.
    {
      cardId: 'OP04-012',
    },
    // OP04-109 Tonoyasu
    // [Activate:Main] You may trash this Character: Up to 1 of your [Land of Wano] type Leader or Character cards gains +3000 power during this turn.
    {
      cardId: 'OP04-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tonoyasu-activate-main-trash-self-plus-3000-land-of-wano',
            text: '[Activate:Main] You may trash this Character: Up to 1 of your [Land of Wano] type Leader or Character cards gains +3000 power during this turn.',
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
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Land of Wano'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP04-077 Ideo (Reprint)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright) and the Artist Credit (Note: there is no pencil design on top of the artist name).
    {
      cardId: 'OP04-077',
      effects: [],
    },
    // OP04-106 Charlotte Bavarois
    // [DON!! x1] If you have less Life cards than your opponent, this Character gains +1000 power. [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP04-106',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'charlotte-bavarois-don-1-if-less-life-plus-1000',
            text: '[DON!! x1] If you have less Life cards than your opponent, this Character gains +1000 power.',
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
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-bavarois-trigger-trash-1-play-this-card',
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
                  filter: { name: ['Charlotte Bavarois'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-027 Daddy Masterson
    // [DON!! x1] [End of Your Turn] Set this Character as active.
    {
      cardId: 'OP04-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'daddy-masterson-don-1-end-of-turn-unrest-self',
            text: '[DON!! x1] [End of Your Turn] Set this Character as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              { type: 'eventPlayerIs', player: 'self' },
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
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
    // OP04-025 Giolla
    // [On Your Opponent's Attack] (2) (You may rest the specified number of DON!! cards in your cost area.): Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP04-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'giolla-on-opponent-attack-pay-2-rest-cost-4-or-less',
            text: "[On Your Opponent's Attack] (2): Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onAttacked' },
            costs: [{ type: 'removeDon', player: 'self', amount: 2 }],
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
    // OP04-059 Iceburg
    // [On Your Opponent's Attack] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the [Water Seven] type, this Character gains [Blocker] during this turn. (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP04-059',
    },
    // OP04-068 Yokozuna
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On Your Opponent's Attack] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Return up to 1 of your opponent's Characters with a cost of 2 or less to the owner's hand.
    {
      cardId: 'OP04-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yokozuna-on-opponent-attack-remove-1-return-cost-2-or-less',
            text: "[On Your Opponent's Attack] DON!! -1: Return up to 1 of your opponent's Characters with a cost of 2 or less to the owner's hand.",
            trigger: { type: 'onAttacked' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 2,
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
    // OP04-110 Pound
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [On K.O.] Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up.
    {
      cardId: 'OP04-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pound-on-ko-choose-top-or-bottom-life-cost-3-or-less',
            text: "[On K.O.] Add up to 1 of your opponent's Characters with a cost of 3 or less to the top or bottom of your opponent's Life cards face-up.",
            trigger: { type: 'onKo' },
            conditions: [{ type: 'eventPlayerIs', player: 'self' }],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choisissez la position dans la zone de Vie.',
                choices: [
                  {
                    id: 'top-life',
                    label: 'Dessus de la Vie',
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
                      },
                    ],
                  },
                  {
                    id: 'bottom-life',
                    label: 'Dessous de la Vie',
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
                        toBottom: true,
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
    // OP04-113 Rabiyan
    // [Trigger] Play this card.
    {
      cardId: 'OP04-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rabiyan-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Rabiyan'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP04-097 Otama
    // [On Play] Add up to 1 of your opponent's [Animal] or [SMILE] type Characters with a cost of 3 or less to the top of your opponent's Life cards face-up.
    {
      cardId: 'OP04-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'otama-097-on-play-add-animal-or-smile-to-opponent-life',
            text: "[On Play] Add up to 1 of your opponent's [Animal] or [SMILE] type Characters with a cost of 3 or less to the top of your opponent's Life cards face-up.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                    trait: ['Animal', 'SMILE'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'life',
              },
            ],
          },
        },
      ],
    },
    // OP04-086 Chinjao
    // [DON!! x1] When this Character battles and K.O.'s your opponent's Character, draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP04-086',
    },
    // OP04-022 Eric
    // [Activate:Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP04-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eric-activate-main-rest-self-rest-opponent-cost-1-or-less',
            text: "[Activate:Main] You may rest this Character: Rest up to 1 of your opponent's Characters with a cost of 1 or less.",
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
                  filter: { cardCategory: ['Character'], costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP04-061 Tom
    // [Activate:Main] You may trash this Character: If your Leader has the [Water Seven] type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP04-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tom-activate-main-trash-self-if-water-seven-add-rested-don',
            text: '[Activate:Main] You may trash this Character: If your Leader has the [Water Seven] type, add up to 1 DON!! card from your DON!! deck and rest it.',
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
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Water Seven',
              },
            ],
            actions: [
              { type: 'addDon', player: 'self', amount: 1, rested: true },
            ],
          },
        },
      ],
    },
    // OP04-096 Corrida Coliseum (Reprint)
    // If your Leader has the [Dressrosa] type, your [Dressrosa] type Characters can attack Characters on the turn in which they are played.Disclaimer: This card was reprinted from the original set with changes to the copyright information (Note: the original print did not include "EN" at the end of the copyright).
    {
      cardId: 'OP04-096',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'corrida-coliseum-if-dressrosa-your-dressrosa-can-attack-characters-on-turn-played',
            text: 'If your Leader has the [Dressrosa] type, your [Dressrosa] type Characters can attack Characters on the turn in which they are played.',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Dressrosa',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Dressrosa'],
                },
              },
              keywords: ['cannotAttackLeaderOnTurnPlayed'],
            },
          },
        },
      ],
    },
  ],
};
