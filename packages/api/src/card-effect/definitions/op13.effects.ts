import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op13EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP13',
  cards: [
    // OP13-001 Monkey.D.Luffy (001)
    // [DON!! x1] [On Your Opponent's Attack] If you have 5 or less active DON!! cards, you may rest any number of your DON!! cards. For every DON!! card rested this way, this Leader or up to 1 of your "Straw Hat Crew" type Characters gains +2000 power during this battle.
    {
      cardId: 'OP13-001',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-001-special',
        },
      ],
    },
    // OP13-002 Portgas.D.Ace (002)
    // [On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 of your opponent's Leader or Character cards 2000 power during this battle.
    // [DON!! x1] [Once Per Turn] When you take damage or your Character with 6000 base power or more is K.O.'d, draw 1 card.
    {
      cardId: 'OP13-002',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-002-special',
        },
      ],
    },
    // OP13-003 Gol.D.Roger (003)
    // If you have any DON!! cards on your field, 1 DON!! card placed during your DON!! Phase is given to your Leader.
    // If you have 9 or less DON!! cards on your field, give this Leader 2000 power.
    {
      cardId: 'OP13-003',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-003-special',
        },
      ],
    },
    // OP13-004 Sabo (004) (Alternate Art)
    // If you have 4 or more Life cards, give this Leader 1000 power.
    // [DON!! x1] If you have a Character with a cost of 8 or more, your Leader and all of your Characters gain +1000 power.
    {
      cardId: 'OP13-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sabo-004-life-4-plus-1000',
            text: 'If you have 4 or more Life cards, give this Leader 1000 power.',
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 4 },
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
        {
          kind: 'continuous',
          effect: {
            id: 'sabo-004-don-1-cost-8-plus-plus-1000',
            text: '[DON!! x1] If you have a Character with a cost of 8 or more, your Leader and all of your Characters gain +1000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 8 },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader', 'characters'],
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // OP13-005 Inazuma
    // [On Play] Give up to 1 rested DON!! card to your Leader.
    {
      cardId: 'OP13-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inazuma-on-play-attach-don-leader',
            text: '[On Play] Give up to 1 rested DON!! card to your Leader.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP13-006 Woop Slap
    // [On Play] Give up to 2 rested DON!! cards to 1 of your [Monkey.D.Luffy] cards.
    {
      cardId: 'OP13-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'woop-slap-on-play-attach-don-luffy',
            text: '[On Play] Give up to 2 rested DON!! cards to 1 of your [Monkey.D.Luffy] cards.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP13-007 Ace & Sabo & Luffy
    // [Activate: Main] You may give 1 of your active DON!! cards to 1 of your Leader or Character cards and trash this Character: Give up to 1 of your opponent's Characters 3000 power during this turn.
    {
      cardId: 'OP13-007',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-007-special',
        },
      ],
    },
    // OP13-008 Emporio.Ivankov
    // If your "Revolutionary Army" type Character would be K.O.'d by your opponent's effect, you may trash this Character instead.
    {
      cardId: 'OP13-008',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'emporio-ivankov-trash-instead-of-rea-ko',
            text: 'If your "Revolutionary Army" type Character would be K.O.\'d by your opponent\'s effect, you may trash this Character instead.',
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Revolutionary Army'],
                  },
                },
              },
            ],
            replacement: [
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
          },
        },
      ],
    },
    // OP13-009 Curly.Dadan
    // If you have a "Mountain Bandits" type Character other than this card, this Character gains [Double Attack].
    {
      cardId: 'OP13-009',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'curly-dadan-mountain-bandits-double-attack',
            text: 'If you have a "Mountain Bandits" type Character other than this card, this Character gains [Double Attack].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Mountain Bandits'],
                    excludeName: ['Curly.Dadan'],
                  },
                },
              },
            ],
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
    // OP13-012 Nefeltari Vivi
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 "Alabasta" or "Straw Hat Crew" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP13-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nefeltari-vivi-on-play-search-alabasta-strawhat-cost-2',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 "Alabasta" or "Straw Hat Crew" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Alabasta', 'Straw Hat Crew'],
                  costMin: 2,
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
    // OP13-013 Higuma
    // [On Play] K.O. up to 1 of your opponent's Characters with 0 power or less.
    {
      cardId: 'OP13-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'higuma-on-play-ko-power-0-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with 0 power or less.",
            trigger: { type: 'onPlay' },
            actions: [
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
          },
        },
      ],
    },
    // OP13-014 Portgas.D.Rouge
    // [Trigger] Up to 1 of your [Portgas.D.Ace] cards gains +3000 power during this turn.
    {
      cardId: 'OP13-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'portgas-d-rouge-trigger-ace-plus-3000',
            text: '[Trigger] Up to 1 of your [Portgas.D.Ace] cards gains +3000 power during this turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Portgas.D.Ace'] },
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
    // OP13-015 Makino
    // [Activate: Main] You may rest this Character: Up to 1 of your [Monkey.D.Luffy] cards gains +2000 power during this turn.
    {
      cardId: 'OP13-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'makino-activate-main-rest-self-luffy-plus-2000',
            text: '[Activate: Main] You may rest this Character: Up to 1 of your [Monkey.D.Luffy] cards gains +2000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
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
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
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
    // OP13-016 Monkey.D.Garp
    // [On Play] If your Leader is [Sabo], [Portgas.D.Ace] or [Monkey.D.Luffy], look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 3 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP13-016',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-016-special',
        },
      ],
    },
    // OP13-017 Monkey.D.Dragon
    // [Once Per Turn] If your "Revolutionary Army" type Character would be removed from the field by your opponent's effect, you may give this Character 2000 power during this turn instead.
    {
      cardId: 'OP13-017',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-017-special',
        },
      ],
    },
    // OP13-019 But Ace Here Said You Deserved It!!
    // [Main] You may rest 4 of your DON!! cards: Give up to 1 of your opponent's Characters 3000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 3000 power or less.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP13-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'but-ace-here-said-main-minus-3000-and-ko',
            text: "[Main] You may rest 4 of your DON!! cards: Give up to 1 of your opponent's Characters 3000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 3000 power or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 4,
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
            id: 'but-ace-here-said-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP13-020 Meteor Fist
    // [Main] Give up to 1 of your opponent's Characters 5000 power during this turn.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP13-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'meteor-fist-main-minus-5000',
            text: "[Main] Give up to 1 of your opponent's Characters 5000 power during this turn.",
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
                amount: -5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'meteor-fist-trigger-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP13-020',
                effectId: 'meteor-fist-main-minus-5000',
              },
            ],
          },
        },
      ],
    },
    // OP13-021 Gum-Gum Gatling Gun
    // [Main] Give up to 1 rested DON!! card to 1 of your [Monkey.D.Luffy] cards. Then, give up to 1 of your opponent's Characters 2000 power during this turn.
    // [Trigger] Give up to 1 of your opponent's Characters 2000 power during this turn.
    {
      cardId: 'OP13-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-gatling-gun-main-attach-don-luffy-minus-2000',
            text: "[Main] Give up to 1 rested DON!! card to 1 of your [Monkey.D.Luffy] cards. Then, give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
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
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-gatling-gun-trigger-minus-2000',
            text: "[Trigger] Give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'trigger' },
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
    // OP13-022 Windmill Village
    // [Activate: Main] You may rest this Stage: Up to 1 of your Characters with 2000 base power or less gains +1000 power during this turn.
    {
      cardId: 'OP13-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'windmill-village-activate-main-rest-self-base-power-2000-or-less-plus-1000',
            text: '[Activate: Main] You may rest this Stage: Up to 1 of your Characters with 2000 base power or less gains +1000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['stage'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMax: 2000 },
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
    // OP13-023 Uta
    // [On Play] Set up to 2 of your DON!! cards as active. Then, you cannot play Character cards with a base cost of 5 or more during this turn.
    // [On K.O.] Play up to 1 Character card with a cost of 5 or less from your hand rested.
    {
      cardId: 'OP13-023',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-023-special',
        },
      ],
    },
    // OP13-024 Gordon
    // [On Play] You may reveal 1 "Music" or "FILM" type card from your hand: Set up to 2 of your DON!! cards as active at the end of this turn.
    {
      cardId: 'OP13-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gordon-on-play-reveal-music-film-schedule-unrest-2-don',
            text: '[On Play] You may reveal 1 "Music" or "FILM" type card from your hand: Set up to 2 of your DON!! cards as active at the end of this turn.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 1,
                storeAs: 'gordon-revealed',
              },
            ],
            actions: [
              {
                type: 'scheduleActionsAtTurnEnd',
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
            ],
          },
        },
      ],
    },
    // OP13-025 Koby
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If your Leader has the "FILM" type or the "Strike" attribute, set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP13-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koby-on-play-leader-film-or-strike-unrest-don',
            text: '[On Play] If your Leader has the "FILM" type or the "Strike" attribute, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'FILM',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'koby-on-play-leader-strike-unrest-don',
            text: '[On Play] If your Leader has the "Strike" attribute, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
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
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { attribute: ['Strike'] },
                },
              },
            ],
          },
        },
      ],
    },
    // OP13-026 Sunny-Kun
    // [Activate: Main] [Once Per Turn] You may rest 1 of your DON!! cards: This Character gains +2000 power until the end of your opponent's next turn.
    {
      cardId: 'OP13-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sunny-kun-activate-main-rest-don-plus-2000-until-opponent-next-turn',
            text: "[Activate: Main] [Once Per Turn] You may rest 1 of your DON!! cards: This Character gains +2000 power until the end of your opponent's next turn.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
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
    // OP13-027 Sanji
    // [On Play] Set up to 2 of your DON!! cards as active.
    // [End of Your Turn] If your Leader has the "FILM" or "Straw Hat Crew" type, set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP13-027',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-027-on-play-unrest-2-don',
            text: '[On Play] Set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'sanji-027-end-of-turn-leader-film-or-straw-hat-unrest-1-don',
            text: '[End of Your Turn] If your Leader has the "FILM" or "Straw Hat Crew" type, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'FILM',
              },
            ],
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
        {
          kind: 'standard',
          effect: {
            id: 'sanji-027-end-of-turn-leader-straw-hat-crew-unrest-1-don',
            text: '[End of Your Turn] If your Leader has the "Straw Hat Crew" type, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
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
    // OP13-028 Shanks (028)
    // [On Play] Set all of your DON!! cards as active. Then, you cannot play cards from your hand during this turn.
    {
      cardId: 'OP13-028',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-028-special',
        },
      ],
    },
    // OP13-030 Tony Tony.Chopper
    // [On Play] Set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP13-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-030-on-play-unrest-2-don',
            text: '[On Play] Set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
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
    // OP13-031 Trafalgar Law
    // If you have 1 or less Life cards, this Character gains [Blocker].
    // [On Play] You may return 1 of your Characters to the owner's hand: Play up to 1 Character card with a cost of 5 or less from your hand rested.
    {
      cardId: 'OP13-031',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'trafalgar-law-031-life-1-or-less-gains-blocker',
            text: 'If you have 1 or less Life cards, this Character gains [Blocker].',
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'self',
                value: 1,
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
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-031-on-play-bounce-1-play-cost-5-or-less-rested',
            text: "[On Play] You may return 1 of your Characters to the owner's hand: Play up to 1 Character card with a cost of 5 or less from your hand rested.",
            trigger: { type: 'onPlay', optional: true },
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
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP13-032 Nico Robin
    // [On Play] Up to 1 of your opponent's Characters with a cost of 8 or less cannot be rested until the end of your opponent's next End Phase.
    {
      cardId: 'OP13-032',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-032-special',
        },
      ],
    },
    // OP13-033 Franky
    // [On K.O.] Rest up to 2 of your opponent's cards.
    {
      cardId: 'OP13-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'franky-033-on-ko-rest-up-to-2-opponent',
            text: "[On K.O.] Rest up to 2 of your opponent's cards.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters', 'cost', 'stage'],
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP13-034 Brook
    // [On Play] If your Leader has the "FILM" or "Straw Hat Crew" type, set up to 1 of your DON!! cards as active.
    {
      cardId: 'OP13-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-034-on-play-leader-film-unrest-1-don',
            text: '[On Play] If your Leader has the "FILM" type, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'FILM',
              },
            ],
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
        {
          kind: 'standard',
          effect: {
            id: 'brook-034-on-play-leader-straw-hat-crew-unrest-1-don',
            text: '[On Play] If your Leader has the "Straw Hat Crew" type, set up to 1 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
              },
            ],
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
    // OP13-035 Bepo
    // [End of Your Turn] Set this Character or up to 1 of your DON!! cards as active.
    {
      cardId: 'OP13-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bepo-035-end-of-turn-unrest-self-or-don',
            text: '[End of Your Turn] Set this Character or up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Choose what to set as active:',
                choices: [
                  {
                    id: 'unrest-self',
                    label: 'Set this Character as active',
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
                  {
                    id: 'unrest-don',
                    label: 'Set up to 1 DON!! card as active',
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
                ],
              },
            ],
          },
        },
      ],
    },
    // OP13-037 Roronoa Zoro
    // [On Play] If your Leader has the "FILM" or "Straw Hat Crew" type, set up to 2 of your DON!! cards as active.
    // [End of Your Turn] Set this Character as active.
    {
      cardId: 'OP13-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-037-on-play-leader-film-unrest-2-don',
            text: '[On Play] If your Leader has the "FILM" type, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'FILM',
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
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-037-on-play-leader-straw-hat-crew-unrest-2-don',
            text: '[On Play] If your Leader has the "Straw Hat Crew" type, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Straw Hat Crew',
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
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-037-end-of-turn-unrest-self',
            text: '[End of Your Turn] Set this Character as active.',
            trigger: { type: 'onTurnEnd' },
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
    // OP13-038 Gum-Gum Elephant Gun
    // [Main] Rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, set up to 2 of your DON!! cards as active at the end of this turn.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP13-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-elephant-gun-main-rest-cost-5-or-less-schedule-unrest-2-don',
            text: "[Main] Rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, set up to 2 of your DON!! cards as active at the end of this turn.",
            trigger: { type: 'activateMain' },
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
              {
                type: 'scheduleActionsAtTurnEnd',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-elephant-gun-trigger-rest-cost-5-or-less',
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
    // OP13-039 Gum-Gum Snake Shot
    // [Counter] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.
    // [Trigger] Activate this card's [Counter] effect.
    {
      cardId: 'OP13-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-snake-shot-counter-ko-rested-cost-4-or-less',
            text: "[Counter] K.O. up to 1 of your opponent's rested Characters with a cost of 4 or less.",
            trigger: { type: 'activateCounter' },
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
            id: 'gum-gum-snake-shot-trigger-counter',
            text: "[Trigger] Activate this card's [Counter] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP13-039',
                effectId: 'gum-gum-snake-shot-counter-ko-rested-cost-4-or-less',
              },
            ],
          },
        },
      ],
    },
    // OP13-040 I Know You're Strong... So I'll Go All Out from the Very Start!!!
    // [Main] You may rest 2 of your DON!! cards: Up to 2 of your opponent's rested Characters with a cost of 7 or less will not become active in your opponent's next Refresh Phase.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP13-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ill-go-all-out-main-rest-2-don-skip-refresh',
            text: "[Main] You may rest 2 of your DON!! cards: Up to 2 of your opponent's rested Characters with a cost of 7 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
            ],
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: true,
                    costMax: 7,
                  },
                  count: { kind: 'upTo', value: 2 },
                },
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ill-go-all-out-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP13-041 Izo
    // [On Play] Draw 2 cards.
    {
      cardId: 'OP13-041',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'izo-041-on-play-draw-2',
            text: '[On Play] Draw 2 cards.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP13-042 Edward.Newgate
    // [Blocker]
    // [On Play] Draw 2 cards and trash 1 card from your hand. Then, give your Leader and 1 Character up to 2 rested DON!! cards each.
    {
      cardId: 'OP13-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-newgate-042-on-play-draw-2-trash-1-attach-don-leader-and-char',
            text: '[On Play] Draw 2 cards and trash 1 card from your hand. Then, give your Leader and 1 Character up to 2 rested DON!! cards each.',
            trigger: { type: 'onPlay' },
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
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2,
                rested: true,
              },
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP13-043 Otama
    // [On Play] If you have 3 or less Life cards, draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP13-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'otama-043-on-play-life-3-or-less-draw-2-trash-1',
            text: '[On Play] If you have 3 or less Life cards, draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 3 },
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
    // OP13-044 Curiel
    // [When Attacking] Give up to 1 rested DON!! card to your Leader with a type including "Whitebeard Pirates" or 1 Character with a type including "Whitebeard Pirates".
    // [On K.O.] Draw 1 card.
    {
      cardId: 'OP13-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'curiel-when-attacking-attach-don-whitebeard',
            text: '[When Attacking] Give up to 1 rested DON!! card to your Leader with a type including "Whitebeard Pirates" or 1 Character with a type including "Whitebeard Pirates".',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Whitebeard Pirates'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 1,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'curiel-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP13-045 Haruta
    // [When Attacking] If you have 4 or less cards in your hand, draw 1 card.
    {
      cardId: 'OP13-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'haruta-when-attacking-hand-4-or-less-draw-1',
            text: '[When Attacking] If you have 4 or less cards in your hand, draw 1 card.',
            trigger: { type: 'whenAttacking' },
            conditions: [
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
    // OP13-046 Vista
    // [Double Attack]
    // [Once Per Turn] If this Character would be K.O.'d or would be removed from the field by your opponent's effect, you may trash 1 card with a type including "Whitebeard Pirates" from your hand instead.
    {
      cardId: 'OP13-046',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'vista-once-per-turn-trash-whitebeard-hand-instead-of-ko-or-removal',
            text: '[Once Per Turn] If this Character would be K.O.\'d or would be removed from the field by your opponent\'s effect, you may trash 1 card with a type including "Whitebeard Pirates" from your hand instead.',
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
                  filter: { trait: ['Whitebeard Pirates'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            priority: 1,
          },
        },
        {
          kind: 'replacement',
          effect: {
            id: 'vista-once-per-turn-trash-whitebeard-hand-instead-of-removal',
            text: '[Once Per Turn] If this Character would be removed from the field by your opponent\'s effect, you may trash 1 card with a type including "Whitebeard Pirates" from your hand instead.',
            event: 'wouldMoveCard',
            optional: true,
            oncePerTurn: true,
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
            replacement: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Whitebeard Pirates'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            priority: 1,
          },
        },
      ],
    },
    // OP13-047 Fossa
    // If your Character with a type including "Whitebeard Pirates" would be K.O.'d by your opponent's effect, you may trash this Character instead.
    {
      cardId: 'OP13-047',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'fossa-trash-self-instead-of-whitebeard-ko',
            text: 'If your Character with a type including "Whitebeard Pirates" would be K.O.\'d by your opponent\'s effect, you may trash this Character instead.',
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Whitebeard Pirates'],
                  },
                },
              },
            ],
            replacement: [
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
          },
        },
      ],
    },
    // OP13-050 Boa Sandersonia
    // [On Play] If your Leader is [Boa Hancock], play up to 1 [Boa Hancock] with a cost of 3 or less from your hand.
    {
      cardId: 'OP13-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-sandersonia-on-play-if-leader-boa-hancock-play-boa-hancock-cost-3',
            text: '[On Play] If your Leader is [Boa Hancock], play up to 1 [Boa Hancock] with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Boa Hancock',
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
                    name: ['Boa Hancock'],
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
    // OP13-051 Boa Hancock
    // [On K.O.] If your Leader is [Boa Hancock] or multicolored, draw 2 cards.
    {
      cardId: 'OP13-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-051-on-ko-leader-boa-hancock-draw-2',
            text: '[On K.O.] If your Leader is [Boa Hancock] or multicolored, draw 2 cards.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Boa Hancock',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'boa-hancock-051-on-ko-leader-multicolored-draw-2',
            text: '[On K.O.] If your Leader is multicolored, draw 2 cards.',
            trigger: { type: 'onKo' },
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
    // OP13-052 Boa Marigold
    // [Blocker]
    // [On Play] If your Leader is [Boa Hancock], play up to 1 [Boa Hancock] with a cost of 6 or less from your hand.
    {
      cardId: 'OP13-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'boa-marigold-on-play-if-leader-boa-hancock-play-boa-hancock-cost-6',
            text: '[On Play] If your Leader is [Boa Hancock], play up to 1 [Boa Hancock] with a cost of 6 or less from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Boa Hancock',
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
                    name: ['Boa Hancock'],
                    costMax: 6,
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
    // OP13-053 Marshall.D.Teach
    // [When Attacking] You may trash 1 of your Characters with a type including "Whitebeard Pirates": Draw 1 card and this Character gains [Banish] during this turn.
    {
      cardId: 'OP13-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'marshall-d-teach-when-attacking-trash-whitebeard-char-draw-1-banish',
            text: '[When Attacking] You may trash 1 of your Characters with a type including "Whitebeard Pirates": Draw 1 card and this Character gains [Banish] during this turn.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'ko',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Whitebeard Pirates'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
                reason: 'effect',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['banish'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP13-054 Yamato
    // [On Play] If you have 3 or less Life cards, draw 2 cards. Then, give up to 1 rested DON!! card to your Leader.
    {
      cardId: 'OP13-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yamato-054-on-play-life-3-or-less-draw-2-attach-don-leader',
            text: '[On Play] If you have 3 or less Life cards, draw 2 cards. Then, give up to 1 rested DON!! card to your Leader.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 3 },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP13-055 Rakuyo
    // [When Attacking] If you have 4 or less cards in your hand, all of your Characters with a type including "Whitebeard Pirates" gain +1000 power during this turn.
    {
      cardId: 'OP13-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'rakuyo-when-attacking-hand-4-or-less-whitebeard-plus-1000',
            text: '[When Attacking] If you have 4 or less cards in your hand, all of your Characters with a type including "Whitebeard Pirates" gain +1000 power during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 4,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Whitebeard Pirates'],
                  },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP13-056 LittleOars Jr.
    // [When Attacking] If your Leader's type includes "Whitebeard Pirates", draw 1 card.
    {
      cardId: 'OP13-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'littleoars-jr-when-attacking-leader-whitebeard-draw-1',
            text: '[When Attacking] If your Leader\'s type includes "Whitebeard Pirates", draw 1 card.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP13-057 If I Bowed Down to Power, What's the Point in Living?
    // [Main] You may rest 1 of your DON!! cards: If you have 1 or less Life cards, your opponent cannot activate [Blocker] whenever your Leader attacks during this turn.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP13-057',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-057-special',
        },
      ],
    },
    // OP13-058 Phoenix Pyreapple
    // [Main] You may rest 1 of your DON!! cards: Place up to 1 of your opponent's Characters with 3000 power or less at the bottom of the owner's deck.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP13-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'phoenix-pyreapple-main-rest-1-don-bottom-deck-power-3000-or-less',
            text: "[Main] You may rest 1 of your DON!! cards: Place up to 1 of your opponent's Characters with 3000 power or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 3000 },
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
            id: 'phoenix-pyreapple-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP13-059 Brilliant Punk
    // [Main] You may return 1 of your Characters to the owner's hand: Return up to 1 Character with a cost of 6 or less to the owner's hand.
    {
      cardId: 'OP13-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brilliant-punk-main-return-1-character-bounce-cost-6-or-less',
            text: "[Main] You may return 1 of your Characters to the owner's hand: Return up to 1 Character with a cost of 6 or less to the owner's hand.",
            trigger: { type: 'activateMain' },
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
    // OP13-060 Amatsuki Toki
    // If your Character with a type including "Roger Pirates" would be K.O.'d by your opponent's effect, you may trash this Character instead.
    {
      cardId: 'OP13-060',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'amatsuki-toki-trash-self-instead-of-roger-pirates-ko',
            text: 'If your Character with a type including "Roger Pirates" would be K.O.\'d by your opponent\'s effect, you may trash this Character instead.',
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              { type: 'eventReasonIs', value: 'effect' },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Roger Pirates'],
                  },
                },
              },
            ],
            replacement: [
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
          },
        },
      ],
    },
    // OP13-061 Inuarashi
    // [On Play] If you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it. Then, K.O. up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP13-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inuarashi-on-play-add-don-rested-ko-cost-1-or-less',
            text: "[On Play] If you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it. Then, K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: true,
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
    // OP13-062 Crocus
    // [On Play] If you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and set it as active.
    // [When Attacking] Return up to 1 of your opponent's Characters with a base power of 3000 or less to the owner's hand.
    {
      cardId: 'OP13-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'crocus-on-play-add-don-active',
            text: '[On Play] If you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
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
            id: 'crocus-when-attacking-return-base-power-3000-or-less',
            text: "[When Attacking] Return up to 1 of your opponent's Characters with a base power of 3000 or less to the owner's hand.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMax: 3000 },
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
    // OP13-063 Kouzuki Oden
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP13-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-oden-on-play-add-don-rested',
            text: '[On Play] If you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
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
    // OP13-064 Gol.D.Roger (064)
    // Your Leader and all of your Characters that do not have a type including "Roger Pirates" have their effects negated.
    // [On Play] DON!! 3: Your Leader gains +2000 power until the end of your opponent's next End Phase. Then, give all of your opponent's Characters -2000 power until the end of your opponent's next End Phase.
    {
      cardId: 'OP13-064',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-064-special',
        },
      ],
    },
    // OP13-065 Shanks (065)
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Roger Pirates" other than [Shanks] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP13-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shanks-065-on-play-search-roger-pirates',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 card with a type including "Roger Pirates" other than [Shanks] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Roger Pirates'],
                  excludeName: ['Shanks'],
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
    // OP13-066 Silvers Rayleigh
    // [Rush]
    // [On Play] If you have any DON!! cards given, rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, add up to 1 DON!! card from your DON!! deck and set it as active at the end of this turn.
    {
      cardId: 'OP13-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'silvers-rayleigh-066-on-play-rest-opponent-cost-5-or-less-schedule-add-don',
            text: "[On Play] If you have any DON!! cards given, rest up to 1 of your opponent's Characters with a cost of 5 or less. Then, add up to 1 DON!! card from your DON!! deck and set it as active at the end of this turn.",
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
            ],
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
              {
                type: 'scheduleActionsAtTurnEnd',
                actions: [
                  {
                    type: 'addDon',
                    player: 'self',
                    amount: 1,
                    rested: false,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP13-067 Scopper Gaban
    // [On Play] If your Leader's type includes "Roger Pirates", draw 2 cards and trash 1 card from your hand. Then, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP13-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'scopper-gaban-on-play-leader-roger-pirates-draw-2-trash-1-add-don-rested',
            text: '[On Play] If your Leader\'s type includes "Roger Pirates", draw 2 cards and trash 1 card from your hand. Then, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Roger Pirates',
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
    // OP13-068 Douglas Bullet
    // If you have 8 or more DON!! cards on your field, this Character gains +2000 power.
    // [On Play] If your Leader's type includes "Roger Pirates", add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP13-068',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'douglas-bullet-8-don-plus-2000',
            text: 'If you have 8 or more DON!! cards on your field, this Character gains +2000 power.',
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
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
        {
          kind: 'standard',
          effect: {
            id: 'douglas-bullet-on-play-leader-roger-pirates-add-don-rested',
            text: '[On Play] If your Leader\'s type includes "Roger Pirates", add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Roger Pirates',
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
    // OP13-069 Tom
    // [On Play] DON!! -1: Add up to 1 Stage card with a cost of 3 or less from your trash to your hand.
    {
      cardId: 'OP13-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tom-on-play-don-minus-1-recover-stage-cost-3-or-less',
            text: '[On Play] DON!! -1: Add up to 1 Stage card with a cost of 3 or less from your trash to your hand.',
            trigger: { type: 'onPlay' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { cardCategory: ['Stage'], costMax: 3 },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP13-071 Nekomamushi
    // [On Play] If you have 8 or more DON!! cards on your field, K.O. up to 1 of your opponent's Characters with 3000 base power or less.
    {
      cardId: 'OP13-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nekomamushi-071-on-play-8-don-ko-3000-base-power',
            text: "[On Play] If you have 8 or more DON!! cards on your field, K.O. up to 1 of your opponent's Characters with 3000 base power or less.",
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
                  filter: { cardCategory: ['Character'], basePowerMax: 3000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP13-072 Buggy
    // [On Play] If your Leader's type includes "Roger Pirates" and you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP13-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'buggy-072-on-play-leader-roger-pirates-and-don-given-add-don-rested',
            text: '[On Play] If your Leader\'s type includes "Roger Pirates" and you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Roger Pirates',
              },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
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
    // OP13-074 Hera
    // [On Play] Play up to 1 [Homies] type Character card with 3000 power or less from your hand.
    {
      cardId: 'OP13-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hera-on-play-play-homies-power-3000-or-less',
            text: '[On Play] Play up to 1 [Homies] type Character card with 3000 power or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Homies'],
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
    // OP13-075 Guess We'll Have Another Scrap. You Can Only Risk Death While You're Still Alive!!
    // [Main] You may rest 1 of your DON!! cards: If your Leader is [Gol.D.Roger] and you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP13-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'guess-well-have-another-scrap-main-rest-1-don-leader-roger-don-given-add-don',
            text: '[Main] You may rest 1 of your DON!! cards: If your Leader is [Gol.D.Roger] and you have any DON!! cards given, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Gol.D.Roger',
              },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
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
        {
          kind: 'standard',
          effect: {
            id: 'guess-well-have-another-scrap-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP13-076 Divine Departure
    // [Main] You may rest 5 of your DON!! cards: If you have any DON!! cards given, give up to 1 of your opponent's Characters 8000 power during this turn.
    // [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.
    {
      cardId: 'OP13-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'divine-departure-main-rest-5-don-don-given-minus-8000',
            text: "[Main] You may rest 5 of your DON!! cards: If you have any DON!! cards given, give up to 1 of your opponent's Characters 8000 power during this turn.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 5 }],
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
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
                amount: -8000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'divine-departure-counter-trash-1-plus-3000',
            text: '[Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
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
      ],
    },
    // OP13-077 Go All the Way to the Top!!
    // [Main] You may rest 3 of your DON!! cards: If you have any DON!! cards given, K.O. up to 1 of your opponent's Characters with 4000 base power or less and up to 1 of your opponent's Characters with 3000 base power or less.
    // [Counter] Your Leader gains +3000 power during this turn.
    {
      cardId: 'OP13-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'go-all-the-way-to-the-top-main-rest-3-don-ko-4000-base-and-3000-base',
            text: "[Main] You may rest 3 of your DON!! cards: If you have any DON!! cards given, K.O. up to 1 of your opponent's Characters with 4000 base power or less and up to 1 of your opponent's Characters with 3000 base power or less.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 3 }],
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 1 },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMax: 4000 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMax: 3000 },
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
            id: 'go-all-the-way-to-the-top-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this turn.',
            trigger: { type: 'activateCounter' },
            actions: [
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
      ],
    },
    // OP13-078 Oro Jackson
    // [Once Per Turn] When your Character with a type including "Roger Pirates" is removed from the field by your opponent's effect, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP13-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'oro-jackson-078-on-roger-pirates-removed-add-rested-don',
            text: '[Once Per Turn] When your Character with a type including "Roger Pirates" is removed from the field by your opponent\'s effect, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: {
              type: 'onCardRemovedByEffect',
              oncePerTurn: true,
            },
            conditions: [
              {
                type: 'eventPlayerIs',
                player: 'self',
              },
              {
                type: 'eventEffectControllerIs',
                player: 'opponent',
              },
              {
                type: 'eventSourceZoneIs',
                value: 'characters',
              },
              {
                type: 'eventTargetMatchesFilter',
                filter: {
                  cardCategory: ['Character'],
                  owner: 'self',
                  traitIncludes: ['Roger Pirates'],
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
    // OP13-079 Imu
    // Under the rules of this game, you cannot include Events with a cost of 2 or more in your deck and at the start of the game, play up to 1 [Mary Geoise] type Stage card from your deck.[Activate: Main] [Once Per Turn] You may trash 1 of your [Celestial Dragons] type Characters or 1 card from your hand: Draw 1 card.
    {
      cardId: 'OP13-079',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-079-special',
        },
      ],
    },
    // OP13-080 St. Ethanbaron V. Nusjuro
    // If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects and gains [Rush].
    // [When Attacking] If you have 10 or more cards in your trash, give up to 1 of your opponent's Characters 2000 power during this turn.
    {
      cardId: 'OP13-080',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'nusjuro-7-trash-cannot-be-removed-rush',
            text: "If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects and gains [Rush].",
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 7,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeRemovedByOpponentEffects', 'rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'nusjuro-when-attacking-10-trash-minus-2000',
            text: "[When Attacking] If you have 10 or more cards in your trash, give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
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
    // OP13-081 Koala
    // If your Leader has the "Revolutionary Army" type, this Character gains +3 cost.
    // [Activate: Main] [Once Per Turn] You may place 1 card from your trash at the bottom of your deck: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP13-081',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'koala-leader-revolutionary-army-plus-3-cost',
            text: 'If your Leader has the "Revolutionary Army" type, this Character gains +3 cost.',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Revolutionary Army',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              cost: 3,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'koala-activate-main-once-per-turn-place-trash-bottom-attach-don',
            text: '[Activate: Main] [Once Per Turn] You may place 1 card from your trash at the bottom of your deck: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 1 },
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
    // OP13-082 Five Elders
    // [Activate: Main] If your Leader is [Imu], you may rest 1 of your DON!! cards and trash 1 card from your hand: Trash all of your Characters and play up to 5 "Five Elders" type Character cards with 5000 power and different card names from your trash.
    {
      cardId: 'OP13-082',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-082-special',
        },
      ],
    },
    // OP13-083 St. Jaygarcia Saturn
    // If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects.
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Five Elders" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP13-083',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'saturn-7-trash-cannot-be-removed',
            text: "If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects.",
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 7,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeRemovedByOpponentEffects'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'saturn-on-play-search-five-elders',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Five Elders" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Five Elders'] },
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
    // OP13-084 St. Shepherd Ju Peter
    // If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects.
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Five Elders" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP13-084',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'ju-peter-7-trash-cannot-be-removed',
            text: "If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects.",
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 7,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeRemovedByOpponentEffects'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'ju-peter-on-play-search-five-elders',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Five Elders" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Five Elders'] },
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
    // OP13-086 Saint Shalria
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 "Celestial Dragons" type card other than [Saint Shalria] and add it to your hand. Then, trash the rest and trash 1 card from your hand.
    {
      cardId: 'OP13-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'saint-shalria-on-play-search-celestial-dragons-trash-rest-and-1-hand',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 "Celestial Dragons" type card other than [Saint Shalria] and add it to your hand. Then, trash the rest and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Celestial Dragons'],
                  excludeName: ['Saint Shalria'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'trash',
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
    // OP13-087 Saint Charlos
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play] Trash 1 card from the top of your deck.
    {
      cardId: 'OP13-087',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'saint-charlos-on-play-trash-top-deck',
            text: '[On Play] Trash 1 card from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [
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
    // OP13-089 St. Topman Warcury
    // If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects and gains [Blocker].
    // [On K.O.] Draw 1 card.
    {
      cardId: 'OP13-089',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'saint-topman-warcury-089-trash-7-plus-immunity-and-blocker',
            text: "If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects and gains [Blocker].",
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                },
                value: 7,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: [
                'cannotBeRemovedByOpponentEffects',
                'mustBeAttackTarget',
              ],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'saint-topman-warcury-089-on-ko-draw-1',
            text: '[On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP13-091 St. Marcus Mars
    // If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects and gains [Blocker].
    // [On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a base cost of 5 or less.
    {
      cardId: 'OP13-091',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-091-special',
        },
      ],
    },
    // OP13-092 Saint Mjosgard
    // [On Play] If you have 3 or less Life cards, play up to 1 "Mary Geoise" type Stage card with a cost of 1 from your trash.
    {
      cardId: 'OP13-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'saint-mjosgard-on-play-life-3-or-less-play-mary-geoise-stage-from-trash',
            text: '[On Play] If you have 3 or less Life cards, play up to 1 "Mary Geoise" type Stage card with a cost of 1 from your trash.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 3 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Stage'],
                    trait: ['Mary Geoise'],
                    costMax: 1,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // OP13-093 Morgans
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP13-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'morgans-on-play-draw-2-trash-2',
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
    // OP13-094 York
    // [On Play] Up to 1 of your "Celestial Dragons" type Characters gains +2000 power during this turn.
    {
      cardId: 'OP13-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'york-on-play-celestial-dragons-plus-2000',
            text: '[On Play] Up to 1 of your "Celestial Dragons" type Characters gains +2000 power during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Celestial Dragons'],
                  },
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
    // OP13-095 Saint Rosward
    // [On Play] You may trash 1 card from your hand: If you only have "Celestial Dragons" type Characters, K.O. up to 2 of your opponent's Characters with a base cost of 3 or less.
    {
      cardId: 'OP13-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'saint-rosward-on-play-trash-1-only-celestial-dragons-ko-up-to-2',
            text: '[On Play] You may trash 1 card from your hand: If you only have "Celestial Dragons" type Characters, K.O. up to 2 of your opponent\'s Characters with a base cost of 3 or less.',
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
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'Celestial Dragons',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMax: 3 },
                  count: { kind: 'upTo', value: 2 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP13-096 The Five Elders Are at Your Service!!!
    // [Main] Look at 3 cards from the top of your deck; reveal up to 1 "Celestial Dragons" type card other than [The Five Elders Are at Your Service!!!] and add it to your hand. Then, trash the rest.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP13-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'five-elders-at-your-service-main-search-celestial-dragons-trash-rest',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 "Celestial Dragons" type card other than [The Five Elders Are at Your Service!!!] and add it to your hand. Then, trash the rest.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Celestial Dragons'],
                  excludeName: ['The Five Elders Are at Your Service!!!'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'five-elders-at-your-service-trigger-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP13-096',
                effectId:
                  'five-elders-at-your-service-main-search-celestial-dragons-trash-rest',
              },
            ],
          },
        },
      ],
    },
    // OP13-097 The World's Equilibrium Cannot Be Maintained Forever
    // [Main] You may rest 5 of your DON!! cards: If the only Characters on your field are "Celestial Dragons" type Characters, K.O. up to 1 of your opponent's Characters with a base cost of 6 or less.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP13-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'worlds-equilibrium-main-rest-5-don-only-celestial-dragons-ko-cost-6-or-less',
            text: '[Main] You may rest 5 of your DON!! cards: If the only Characters on your field are "Celestial Dragons" type Characters, K.O. up to 1 of your opponent\'s Characters with a base cost of 6 or less.',
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 5 }],
            conditions: [
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'Celestial Dragons',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMax: 6 },
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
            id: 'worlds-equilibrium-counter-leader-plus-3000',
            text: '[Counter] Your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP13-098 Never Existed... in the First Place...
    // [Main] You may rest 1 of your DON!! cards: If your Leader is [Imu], K.O. up to 1 of your opponent's Stages with a cost of 7.
    // [Counter] If your Leader is [Imu], up to 1 of your Leader or Character cards gains +4000 power during this battle.
    {
      cardId: 'OP13-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'never-existed-main-rest-1-don-leader-imu-ko-stage-cost-7',
            text: "[Main] You may rest 1 of your DON!! cards: If your Leader is [Imu], K.O. up to 1 of your opponent's Stages with a cost of 7.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Imu',
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['stage'],
                  filter: { cardCategory: ['Stage'], costMax: 7 },
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
            id: 'never-existed-counter-leader-imu-plus-4000',
            text: '[Counter] If your Leader is [Imu], up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Imu',
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
            ],
          },
        },
      ],
    },
    // OP13-099 The Empty Throne
    // [Your Turn] If you have 19 or more cards in your trash, your Leader gains +1000 power.
    // [Activate: Main] You may rest this card and 3 of your DON!! cards: Play up to 1 black "Five Elders" type Character card with a cost equal to or less than the number of DON!! cards on your field from your hand.
    {
      cardId: 'OP13-099',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-099-special',
        },
      ],
    },
    // OP13-100 Jewelry Bonney (100)
    // [Your Turn] [Once Per Turn] This effect can be activated when you play a Character with a [Trigger]. Give up to 2 rested DON!! cards to 1 of your Leader or Character cards.
    {
      cardId: 'OP13-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-100-your-turn-on-trigger-character-play-attach-2-rested-don',
            text: '[Your Turn] [Once Per Turn] This effect can be activated when you play a Character with a [Trigger]. Give up to 2 rested DON!! cards to 1 of your Leader or Character cards.',
            trigger: {
              type: 'onCharacterPlayed',
              oncePerTurn: true,
            },
            conditions: [
              {
                type: 'controllerTurn',
                value: true,
              },
              {
                type: 'eventPlayerIs',
                player: 'self',
              },
              {
                type: 'eventTargetMatchesFilter',
                filter: {
                  cardCategory: ['Character'],
                  hasTrigger: true,
                },
              },
            ],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: {
                    kind: 'upTo',
                    value: 1,
                  },
                },
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // OP13-102 Edison
    // [Activate: Main] You may trash this Character: If the number of your Life cards is equal to or less than the number of your opponent's Life cards, draw 1 card. Then, rest up to 1 of your opponent's Characters with a cost of 3 or less.
    // [Trigger] Draw 1 card and rest up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP13-102',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-102-special',
        },
      ],
    },
    // OP13-104 Kouzuki Hiyori
    // [Blocker][On K.O.] You may trash 1 card from your hand: If your Leader is multicolored, add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'OP13-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-on-ko-trash-1-hand-leader-multicolored-add-life',
            text: '[Blocker][On K.O.] You may trash 1 card from your hand: If your Leader is multicolored, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'onKo', optional: true },
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
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
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
    // OP13-105 Kouzuki Momonosuke
    // [On Play] Look at all of your Life cards and place them back in your Life area in any order.
    {
      cardId: 'OP13-105',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-105-special',
        },
      ],
    },
    // OP13-106 Conney
    // [Opponent's Turn] When a [Trigger] activates, this Character gains [Blocker] during this turn.
    // [Trigger] Play this card.
    {
      cardId: 'OP13-106',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-106-special',
        },
      ],
    },
    // OP13-108 Jewelry Bonney (108)
    // [On Play] If your Leader has the "Egghead" type, this Character gains [Rush] during this turn. Then, your opponent adds 1 card from the top of their Life cards to their hand.
    // [Trigger] If you have 1 or less Life cards, rest up to 1 of your opponent's Characters with a cost of 7 or less.
    {
      cardId: 'OP13-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-108-on-play-leader-egghead-rush-opponent-life-to-hand',
            text: '[On Play] If your Leader has the "Egghead" type, this Character gains [Rush] during this turn. Then, your opponent adds 1 card from the top of their Life cards to their hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Egghead',
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
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'hand',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-108-trigger-life-1-or-less-rest-cost-7-or-less',
            text: "[Trigger] If you have 1 or less Life cards, rest up to 1 of your opponent's Characters with a cost of 7 or less.",
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP13-109 Jewelry Bonney (109)
    // If this Character would be removed from the field by your opponent's effect, you may turn 1 card from the top of your Life cards face-up instead.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP13-109',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-109-special',
        },
      ],
    },
    // OP13-110 Stussy
    // [Blocker]
    // [On Play] If your Leader has the "Egghead" type, play up to 1 Character card with a cost of 5 or less and a [Trigger] from your hand.
    {
      cardId: 'OP13-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'stussy-on-play-leader-egghead-play-trigger-character-cost-5-or-less',
            text: '[On Play] If your Leader has the "Egghead" type, play up to 1 Character card with a cost of 5 or less and a [Trigger] from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Egghead',
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
                    costMax: 5,
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
    // OP13-112 Vegapunk
    // If you have a total of 2 or more given DON!! cards, this Character gains [Blocker].
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP13-112',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'vegapunk-112-attached-don-2-plus-gains-blocker',
            text: 'If you have a total of 2 or more given DON!! cards, this Character gains [Blocker].',
            conditions: [
              {
                type: 'sourceHasAttachedDonAtLeast',
                value: 2,
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
    // OP13-113 Lilith
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 card with a [Trigger] other than [Lilith] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [On Play] effect.
    {
      cardId: 'OP13-113',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lilith-on-play-search-trigger-card',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 card with a [Trigger] other than [Lilith] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  hasTrigger: true,
                  excludeName: ['Lilith'],
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
            id: 'lilith-trigger-on-play',
            text: "[Trigger] Activate this card's [On Play] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP13-113',
                effectId: 'lilith-on-play-search-trigger-card',
              },
            ],
          },
        },
      ],
    },
    // OP13-114 S-Snake
    // [On Play]/[When Attacking] You may turn 1 card from the top of your Life cards face-up: Give up to 1 of your opponent's Characters 2000 power during this turn.
    // [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP13-114',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-114-special',
        },
      ],
    },
    // OP13-115 Paper Art Afterimage
    // [Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle. Then, if your opponent has 2 or less Life cards, up to 1 of your Leader or Character cards gains +1000 power during this turn.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP13-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'paper-art-afterimage-counter-plus-3000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle.',
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'paper-art-afterimage-counter-opponent-life-2-or-less-plus-1000',
            text: 'Then, if your opponent has 2 or less Life cards, up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'activateCounter' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 2 },
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
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'paper-art-afterimage-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP13-116 The One Who Is the Most Free Is the Pirate King!!!
    // [Main] Look at 5 cards from the top of your deck; reveal up to 1 "Supernovas" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP13-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'most-free-is-pirate-king-main-search-supernovas',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 1 "Supernovas" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { cardCategory: ['Character'], trait: ['Supernovas'] },
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
            id: 'most-free-is-pirate-king-trigger-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP13-116',
                effectId: 'most-free-is-pirate-king-main-search-supernovas',
              },
            ],
          },
        },
      ],
    },
    // OP13-117 Gum-Gum Dawn Stamp
    // [Main] You may turn 1 card from the top of your Life cards face-up: K.O. up to 1 of your opponent's Characters with a base cost of 6 or less.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP13-117',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-117-special',
        },
      ],
    },
    // OP13-118 Monkey.D.Luffy (118)
    // [Double Attack]
    // [On Play] If your Leader is multicolored, set up to 4 of your DON!! cards as active. Then, you cannot play Character cards with a base cost of 5 or more during this turn.
    {
      cardId: 'OP13-118',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-118-special',
        },
      ],
    },
    // OP13-119 Portgas.D.Ace (119)
    // If you have 3 or less Life cards, this Character gains [Rush].
    // [On Play] Give up to 1 rested DON!! card to your Leader. Then, you may return up to 1 of your opponent's Characters with a cost of 5 or less to the owner's hand. If you do, your opponent plays up to 1 Character card with a cost of 4 or less from their hand.
    {
      cardId: 'OP13-119',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op13-119-special',
        },
      ],
    },
    // OP13-120 Sabo (120) (SP)
    // [Blocker]
    // [Activate: Main] [Once Per Turn] Up to 1 of your Characters gains +2 cost until the end of your opponent's next turn. Then, give up to 1 rested DON!! card to your Leader.
    {
      cardId: 'OP13-120',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sabo-120-activate-main-once-per-turn-plus-2-cost-attach-don',
            text: "[Activate: Main] [Once Per Turn] Up to 1 of your Characters gains +2 cost until the end of your opponent's next turn. Then, give up to 1 rested DON!! card to your Leader.",
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
  ],
};
