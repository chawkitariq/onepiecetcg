import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const eb01EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'EB-01',
  cards: [
    // EB01-001 Kouzuki Oden (SPR)
    // All of your "Land of Wano" type Character cards without a Counter have a +1000 Counter, according to the rules.[DON!! x1] [When Attacking] If you have a "Land of Wano" type Character with a cost of 5 or more, this Leader gains +1000 power until the start of your next turn.
    {
      cardId: 'EB01-001',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'eb01-001-counter-rule',
        },
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-oden-when-attacking-plus-1000-if-wano-cost-5-plus',
            text: '[DON!! x1] [When Attacking] If you have a "Land of Wano" type Character with a cost of 5 or more, this Leader gains +1000 power until the start of your next turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Land of Wano'],
                    costMin: 5,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Kouzuki Oden'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: 1000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB01-002 Izo
    // [On Play] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.[On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: If your Leader has the [Land of Wano] or [Whitebeard Pirates] type, give up to 1 of your opponent's Leader or Character cards -2000 power during this turn.
    {
      cardId: 'EB01-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'izo-on-play-attach-rested-don',
            text: '[On Play] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'izo-on-opponent-attack-minus-2000',
            text: "[On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: If your Leader has the [Land of Wano] or [Whitebeard Pirates] type, give up to 1 of your opponent's Leader or Character cards -2000 power during this turn.",
            trigger: { type: 'onAttacked', oncePerTurn: true, optional: true },
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
                type: 'ifAnyConditionGroupMatches',
                conditionGroups: [
                  [
                    {
                      type: 'playerHasLeaderTrait',
                      player: 'self',
                      value: 'Land of Wano',
                    },
                  ],
                  [
                    {
                      type: 'playerHasLeaderTrait',
                      player: 'self',
                      value: 'Whitebeard Pirates',
                    },
                  ],
                ],
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
            ],
          },
        },
      ],
    },
    // EB01-003 Kid & Killer
    // [Rush] (This card can attack on the turn in which it is played.)[When Attacking] If your opponent has 2 or less Life cards, this Character gains +2000 power during this turn.
    {
      cardId: 'EB01-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'kid-and-killer-has-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Kid & Killer'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kid-and-killer-when-attacking-plus-2000-if-opponent-life-2-or-less',
            text: '[When Attacking] If your opponent has 2 or less Life cards, this Character gains +2000 power during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'opponent', value: 2 },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kid & Killer'] },
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
    // EB01-004 Koza
    // [When Attacking] You may give your 1 active Leader -5000 power during this turn: Give up to 1 of your opponent's Characters -3000 power during this turn.
    {
      cardId: 'EB01-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koza-when-attacking-leader-minus-5000-to-give-opponent-minus-3000',
            text: "[When Attacking] You may give your 1 active Leader -5000 power during this turn: Give up to 1 of your opponent's Characters -3000 power during this turn.",
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
    // EB01-006 Tony Tony.Chopper
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[DON!! x2][When Attacking] Give up to 1 of your opponent's Characters -3000 power during this turn.
    {
      cardId: 'EB01-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tony-tony-chopper-when-attacking-minus-3000-don-x2',
            text: "[DON!! x2][When Attacking] Give up to 1 of your opponent's Characters -3000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
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
    // EB01-007 Yamato
    // [Activate:Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'EB01-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'yamato-activate-main-attach-rested-don',
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
    // EB01-008 LittleOars Jr.
    // [Once Per Turn] If this Character would be K.O.'d by an effect, you may trash 1 Event or Stage card from your hand instead.
    {
      cardId: 'EB01-008',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'little-oars-jr-ko-prevention-trash-event-or-stage',
            text: "[Once Per Turn] If this Character would be K.O.'d by an effect, you may trash 1 Event or Stage card from your hand instead.",
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
                  filter: {
                    cardCategory: ['Event', 'Stage'],
                  },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB01-009 Just Shut Up and Come with Us!!!!
    // [Counter] Look at 5 cards from the top of your deck and play up to 1 [Animal] type Character card with a cost of 3 or less. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB01-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'just-shut-up-counter-search-animal-play',
            text: '[Counter] Look at 5 cards from the top of your deck and play up to 1 [Animal] type Character card with a cost of 3 or less. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Animal'],
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
    // EB01-010 There's No Way You Could Defeat Me!!
    // [Counter] K.O. up to 1 of your opponent's Characters with 6000 base power or less. [Trigger] K.O. up to 1 of your opponent's Characters with 5000 base power or less.
    {
      cardId: 'EB01-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'theres-no-way-counter-ko-base-power-6000',
            text: "[Counter] K.O. up to 1 of your opponent's Characters with 6000 base power or less.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 6000,
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
            id: 'theres-no-way-trigger-ko-base-power-5000',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 5000 base power or less.",
            trigger: { type: 'trigger' },
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // EB01-011 Mini-Merry
    // [Activate:Main] You may rest this card and place 1 of your Characters with 1000 base power at the bottom of your deck: Draw 1 card.
    {
      cardId: 'EB01-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mini-merry-activate-main-rest-and-bottom-character-draw-1',
            text: '[Activate:Main] You may rest this card and place 1 of your Characters with 1000 base power at the bottom of your deck: Draw 1 card.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Mini-Merry'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    basePowerMax: 1000,
                  },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB01-012 Cavendish
    // [On Play]/[When Attacking] If your Leader has the [Supernovas] type and you have no other [Cavendish] Characters, set up to 2 of your DON!! cards as active.
    {
      cardId: 'EB01-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'cavendish-on-play-set-2-don-active',
            text: '[On Play] If your Leader has the [Supernovas] type and you have no other [Cavendish] Characters, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Cavendish'] },
                },
                value: 1,
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
            id: 'cavendish-when-attacking-set-2-don-active',
            text: '[When Attacking] If your Leader has the [Supernovas] type and you have no other [Cavendish] Characters, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
              },
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Cavendish'] },
                },
                value: 1,
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
    // EB01-013 Kouzuki Hiyori
    // [Activate:Main] You may trash this Character: Play up to 1 [Land of Wano] type Character card with a cost of 5 or less other than [Kouzuki Hiyori] from your hand. Then, draw 1 card.
    {
      cardId: 'EB01-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kouzuki-hiyori-activate-main-trash-self-play-wano-draw-1',
            text: '[Activate:Main] You may trash this Character: Play up to 1 [Land of Wano] type Character card with a cost of 5 or less other than [Kouzuki Hiyori] from your hand. Then, draw 1 card.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kouzuki Hiyori'] },
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
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Land of Wano'],
                    costMax: 5,
                    excludeName: ['Kouzuki Hiyori'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              { type: 'draw', player: 'self', amount: 1 },
            ],
          },
        },
      ],
    },
    // EB01-014 Sanji
    // [DON!! x1] [Your Turn] This Character gains +1000 power for every 3 of your rested DON!! cards.
    {
      cardId: 'EB01-014',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'sanji-your-turn-plus-1000-per-3-rested-don',
            text: '[DON!! x1] [Your Turn] This Character gains +1000 power for every 3 of your rested DON!! cards.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Sanji'] },
              },
              powerPerCount: {
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  filter: { rested: true },
                },
                amount: 1000,
                divisor: 3,
              },
            },
          },
        },
      ],
    },
    // EB01-015 Scratchmen Apoo
    // [On Play] Rest up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'EB01-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'scratchmen-apoo-on-play-rest-cost-2-or-less',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 2,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // EB01-016 Bingoh
    // [Activate:Main] You may rest this Character: K.O. up to 1 of your opponent's rested Characters with a cost of 1 or less.
    {
      cardId: 'EB01-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'bingoh-activate-main-rest-to-ko-rested-cost-1-or-less',
            text: "[Activate:Main] You may rest this Character: K.O. up to 1 of your opponent's rested Characters with a cost of 1 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Bingoh'] },
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
                    costMax: 1,
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
    // EB01-017 Blueno (017)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'EB01-017',
      effects: [],
    },
    // EB01-019 Off-White
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, look at 3 cards from the top of your deck; reveal up to 1 [Donquixote Pirates] type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'EB01-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'off-white-counter-plus-4000-and-search-donquixote',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, look at 3 cards from the top of your deck; reveal up to 1 [Donquixote Pirates] type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
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
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Donquixote Pirates'],
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
    // EB01-020 Chambres
    // [Main] If your Leader has the [Supernovas] type, return 1 of your Characters to the owner's hand, and play up to 1 Character card with a cost of 2 or less from your hand that is a different color than the returned Character.[Trigger] Activate this card's [Main] effect.
    {
      cardId: 'EB01-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'chambres-main-return-character-play-different-color',
            text: "[Main] If your Leader has the [Supernovas] type, return 1 of your Characters to the owner's hand, and play up to 1 Character card with a cost of 2 or less from your hand that is a different color than the returned Character.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Supernovas',
              },
            ],
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
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 2,
                    differentColorThanStoredSelection: 'returnedCharacter',
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
            id: 'chambres-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'EB01-020',
                effectId: 'chambres-main-return-character-play-different-color',
              },
            ],
          },
        },
      ],
    },
    // EB01-021 Hannyabal (SPR)
    // [End of Your Turn] You may return 1 of your "Impel Down" type Characters with a cost of 2 or more to the owner's hand: Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'EB01-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hannyabal-end-of-turn-return-impel-down-to-add-don',
            text: '[End of Your Turn] You may return 1 of your "Impel Down" type Characters with a cost of 2 or more to the owner\'s hand: Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onTurnEnd', optional: true },
            conditions: [{ type: 'controllerTurn', value: true }],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Impel Down'],
                    costMin: 2,
                  },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
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
    // EB01-022 Inazuma
    // [End of Your Turn] If you have 2 or less cards in your hand, draw 2 cards.
    {
      cardId: 'EB01-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'inazuma-end-of-turn-draw-2-if-hand-2-or-less',
            text: '[End of Your Turn] If you have 2 or less cards in your hand, draw 2 cards.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
              { type: 'playerHasHandAtMost', player: 'self', value: 2 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB01-023 Edward Weevil
    // [On Play] Draw 1 card.
    {
      cardId: 'EB01-023',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'edward-weevil-on-play-draw-1',
            text: '[On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB01-024 Hamlet
    // If you have 4 or less cards in your hand, all of your [SMILE] type Characters gain +1000 power.
    {
      cardId: 'EB01-024',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'hamlet-hand-4-or-less-smile-plus-1000',
            text: 'If you have 4 or less cards in your hand, all of your [SMILE] type Characters gain +1000 power.',
            conditions: [
              { type: 'playerHasHandAtMost', player: 'self', value: 4 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['SMILE'],
                },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // EB01-026 Prince Bellett
    // [DON!! x1] [When Attacking] If you have 1 or less cards in your hand, return up to 1 Character with a cost of 3 or less to the owner's hand.
    {
      cardId: 'EB01-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'prince-bellett-when-attacking-bounce-cost-3-if-hand-1-or-less',
            text: "[DON!! x1] [When Attacking] If you have 1 or less cards in your hand, return up to 1 Character with a cost of 3 or less to the owner's hand.",
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'playerHasHandAtMost', player: 'self', value: 1 },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
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
    // EB01-027 Mr. 1 (Daz.Bonez)
    // If your Leader's type includes "Baroque Works", this Character gains +1000 power for every 2 Events in your trash.[On Play] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'EB01-027',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'mr-1-per-2-events-in-trash-plus-1000-if-baroque-leader',
            text: 'If your Leader\'s type includes "Baroque Works", this Character gains +1000 power for every 2 Events in your trash.',
            conditions: [
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
                filter: { name: ['Mr. 1'] },
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
        {
          kind: 'standard',
          effect: {
            id: 'mr-1-on-play-draw-2-trash-1',
            text: '[On Play] Draw 2 cards and trash 1 card from your hand.',
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
            ],
          },
        },
      ],
    },
    // EB01-028 Gum-Gum Champion Rifle
    // [Counter] If your Leader has the [Impel Down] type, up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, your opponent returns 1 of their active Characters to the owner's hand.[Trigger] Return up to 1 Character with a cost of 3 or less to the bottom of the owner's deck.
    {
      cardId: 'EB01-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-champion-rifle-counter-plus-2000-and-bounce-active',
            text: "[Counter] If your Leader has the [Impel Down] type, up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, your opponent returns 1 of their active Characters to the owner's hand.",
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
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
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  chooser: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    rested: false,
                  },
                  count: { kind: 'exact', value: 1 },
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
            id: 'gum-gum-champion-rifle-trigger-bottom-deck-cost-3-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 3 or less to the bottom of the owner's deck.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
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
      ],
    },
    // EB01-029 Sorry. I'm a Goner.
    // [Counter] Reveal 1 card from the top of your deck. If the revealed card has a cost of 4 or more, return up to 1 of your Characters to the owner's hand. Then, place the revealed card at the bottom of your deck.[Trigger] Return up to 1 Character with a cost of 8 or less to the owner's hand.
    {
      cardId: 'EB01-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sorry-im-a-goner-counter-reveal-and-conditional-bounce',
            text: "[Counter] Reveal 1 card from the top of your deck. If the revealed card has a cost of 4 or more, return up to 1 of your Characters to the owner's hand. Then, place the revealed card at the bottom of your deck.",
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'deck',
                amount: 1,
                storeAs: 'revealedTopCard',
              },
              {
                type: 'ifStoredSelectionMatches',
                key: 'revealedTopCard',
                filter: { costMin: 4 },
                actions: [
                  {
                    type: 'moveCard',
                    selector: {
                      player: 'self',
                      zones: ['characters'],
                      count: { kind: 'upTo', value: 1 },
                    },
                    destinationPlayer: 'selectedCardOwner',
                    destinationZone: 'hand',
                  },
                ],
              },
              {
                type: 'moveStoredCards',
                key: 'revealedTopCard',
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sorry-im-a-goner-trigger-bounce-cost-8-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 8 or less to the owner's hand.",
            trigger: { type: 'trigger' },
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
                destinationZone: 'hand',
              },
            ],
          },
        },
      ],
    },
    // EB01-030 Loguetown
    // [Activate:Main] You may place this card and 1 card from your hand at the bottom of your deck in any order: Draw 2 cards.[Trigger] Play this card.
    {
      cardId: 'EB01-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'loguetown-activate-main-bottom-self-and-hand-draw-2',
            text: '[Activate:Main] You may place this card and 1 card from your hand at the bottom of your deck in any order: Draw 2 cards.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Loguetown'] },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
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
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'loguetown-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Loguetown'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'stage',
              },
            ],
          },
        },
      ],
    },
    // EB01-031 Kalifa
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the [Water Seven] type, add up to 2 Character cards with a cost of 4 or less from your trash to your hand.
    {
      cardId: 'EB01-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kalifa-on-play-don-minus-1-recover-2-characters-from-trash',
            text: '[On Play] DON!! -1: If your Leader has the [Water Seven] type, add up to 2 Character cards with a cost of 4 or less from your trash to your hand.',
            trigger: { type: 'onPlay' },
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
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  cardCategory: ['Character'],
                  costMax: 4,
                },
                count: { kind: 'upTo', value: 2 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // EB01-033 Blueno (033)
    // [On Play] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the [Water Seven] type, play up to 1 [Water Seven] type Character card with a cost of 5 other than [Blueno] from your hand or trash.
    {
      cardId: 'EB01-033',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blueno-033-on-play-don-minus-1-play-water-7-from-hand-or-trash',
            text: '[On Play] DON!! -1: If your Leader has the [Water Seven] type, play up to 1 [Water Seven] type Character card with a cost of 5 other than [Blueno] from your hand or trash.',
            trigger: { type: 'onPlay' },
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Water Seven'],
                    costMin: 5,
                    costMax: 5,
                    excludeName: ['Blueno'],
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
    // EB01-034 Ms. Wednesday
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Your Opponent's Attack][Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader's type includes "Baroque Works", add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'EB01-034',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ms-wednesday-on-opponent-attack-don-minus-1-add-active-don',
            text: '[On Your Opponent\'s Attack][Once Per Turn] DON!! -1: If your Leader\'s type includes "Baroque Works", add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onAttacked', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Baroque Works',
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
    // EB01-035 Ms. Monday
    // [On Play] If your Leader's type includes "Baroque Works", up to 1 of your Leader or Character cards gains +1000 power during this turn.[Trigger] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): Play this card.
    {
      cardId: 'EB01-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ms-monday-on-play-plus-1000-if-baroque',
            text: '[On Play] If your Leader\'s type includes "Baroque Works", up to 1 of your Leader or Character cards gains +1000 power during this turn.',
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
            id: 'ms-monday-trigger-don-minus-1-play',
            text: '[Trigger] DON!! -1: Play this card.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Ms. Monday'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // EB01-036 Minochihuahua
    // [Rush] (This card can attack on the turn in which it is played.)[On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'EB01-036',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'minochihuahua-has-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Minochihuahua'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'minochihuahua-on-ko-add-rested-don-if-impel-down-leader',
            text: '[On K.O.] If your Leader has the [Impel Down] type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
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
    // EB01-037 Mr. 9
    // [On Your Opponent's Attack] [Once Per Turn] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'EB01-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-9-on-opponent-attack-don-minus-1-ko-cost-2-or-less',
            text: "[On Your Opponent's Attack] [Once Per Turn] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // EB01-038 Oh Come My Way
    // [Counter] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader's type includes "Baroque Works", select 1 of your Characters. Change the attack target to the selected Character.[Trigger] DON!! -1: Draw 2 cards.
    {
      cardId: 'EB01-038',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'eb01-038-counter-redirect-attack',
        },
        {
          kind: 'standard',
          effect: {
            id: 'oh-come-my-way-trigger-don-minus-1-draw-2',
            text: '[Trigger] DON!! -1: Draw 2 cards.',
            trigger: { type: 'trigger' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // EB01-039 Conquerer of Three Worlds Ragnaraku
    // [Main] DON!! -1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): K.O. up to 1 of your opponent's Characters with a cost of 8 or less.[Trigger] Ad up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'EB01-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'conquerer-of-three-worlds-ragnaraku-main-don-minus-1-ko-cost-8',
            text: "[Main] DON!! -1: K.O. up to 1 of your opponent's Characters with a cost of 8 or less.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 8,
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
            id: 'conquerer-of-three-worlds-ragnaraku-trigger-add-active-don',
            text: '[Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'trigger' },
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
    // EB01-040 Kyros (SPR)
    // [Activate: Main] [Once Per Turn] You may turn 1 card from the top of your Life cards face-up: K.O. up to 1 of your opponent's Characters with a cost of 0.
    {
      cardId: 'EB01-040',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'eb01-040-activate-main-life-face-up-ko-cost-0',
        },
      ],
    },
    // EB01-042 Scarlet
    // [Activate:Main] You may trash this Character: Play up to 1 [Dressrosa] type Character card with a cost of 3 or less other than [Scarlet] from your hand rested. Then, give up to 1 of your opponent's Characters -2 cost during this turn.
    {
      cardId: 'EB01-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'scarlet-activate-main-trash-self-play-dressrosa-and-minus-2-cost',
            text: "[Activate:Main] You may trash this Character: Play up to 1 [Dressrosa] type Character card with a cost of 3 or less other than [Scarlet] from your hand rested. Then, give up to 1 of your opponent's Characters -2 cost during this turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Scarlet'] },
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
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Dressrosa'],
                    costMax: 3,
                    excludeName: ['Scarlet'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
                rested: true,
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
    // EB01-043 Spandine
    // [On Play] You may place 3 cards with a type including "CP" from your trash at the bottom of your deck in any order: Play up to 1 Character card with a type including "CP" and a cost of 4 or less other than [Spandine] from your trash rested.
    {
      cardId: 'EB01-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spandine-on-play-place-3-cp-from-trash-to-play-cp-from-trash',
            text: '[On Play] You may place 3 cards with a type including "CP" from your trash at the bottom of your deck in any order: Play up to 1 Character card with a type including "CP" and a cost of 4 or less other than [Spandine] from your trash rested.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { traitIncludes: ['CP'] },
                  count: { kind: 'exact', value: 3 },
                },
                destinationPlayer: 'self',
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
                  filter: {
                    cardCategory: ['Character'],
                    traitIncludes: ['CP'],
                    costMax: 4,
                    excludeName: ['Spandine'],
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
    // EB01-044 Funkfreed
    // [Activate:Main] You may rest this Character: Up to 1 of your [Spandam] Characters gains +3000 power during this turn.
    {
      cardId: 'EB01-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'funkfreed-activate-main-rest-to-give-spandam-plus-3000',
            text: '[Activate:Main] You may rest this Character: Up to 1 of your [Spandam] Characters gains +3000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Funkfreed'] },
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
                  filter: { name: ['Spandam'] },
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
    // EB01-045 Brook (045)
    // [On Play] If your opponent has a Character with a cost of 0, this Character gains [Rush] during this turn. (This card can attack on the turn in which it is played.)
    {
      cardId: 'EB01-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-045-on-play-gain-rush-if-opponent-has-cost-0',
            text: '[On Play] If your opponent has a Character with a cost of 0, this Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMin: 0,
                    costMax: 0,
                  },
                },
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Brook'] },
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
    // EB01-046 Brook (046)
    // [On Play]/[When Attacking] Give up to 1 of your opponent's Characters -1 cost during this turn. Then, K.O. up to 1 of your opponent's Characters with a cost of 0.
    {
      cardId: 'EB01-046',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-046-on-play-minus-1-cost-then-ko-cost-0',
            text: "[On Play] Give up to 1 of your opponent's Characters -1 cost during this turn. Then, K.O. up to 1 of your opponent's Characters with a cost of 0.",
            trigger: { type: 'onPlay' },
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
              {
                type: 'ko',
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'brook-046-when-attacking-minus-1-cost-then-ko-cost-0',
            text: "[When Attacking] Give up to 1 of your opponent's Characters -1 cost during this turn. Then, K.O. up to 1 of your opponent's Characters with a cost of 0.",
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
              {
                type: 'ko',
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // EB01-047 Laboon (047)
    // [Once Per Turn] When a Character is K.O.'d, draw 1 card and trash 1 card from your hand.
    {
      cardId: 'EB01-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'laboon-047-on-ko-draw-1-trash-1-once-per-turn',
            text: "[Once Per Turn] When a Character is K.O.'d, draw 1 card and trash 1 card from your hand.",
            trigger: { type: 'onKo', oncePerTurn: true },
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
    // EB01-048 Laboon (048)
    // [Activate:Main]You may rest this Character: Give up to 1 of your opponent's Characters -4 cost during this turn.
    {
      cardId: 'EB01-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'laboon-048-activate-main-rest-to-minus-4-cost',
            text: "[Activate:Main] You may rest this Character: Give up to 1 of your opponent's Characters -4 cost during this turn.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Laboon'] },
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
    // EB01-049 T-Bone
    // [On Play] K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'EB01-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 't-bone-on-play-ko-cost-2-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'onPlay' },
            actions: [
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // EB01-050 ...I Want to Live!!
    // [Counter] If you have 30 or more cards in your trash, add up to 1 card from the top of your deck to the top of your Life cards.
    {
      cardId: 'EB01-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'i-want-to-live-counter-add-to-life-if-trash-30-plus',
            text: '[Counter] If you have 30 or more cards in your trash, add up to 1 card from the top of your deck to the top of your Life cards.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 30,
              },
            ],
            actions: [
              {
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['deck'],
                  count: { kind: 'exact', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
      ],
    },
    // EB01-051 Finger Pistol
    // [Main] You may trash 2 cards from the top of your deck: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'EB01-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'finger-pistol-main-trash-2-from-deck-to-ko-cost-5-or-less',
            text: "[Main] You may trash 2 cards from the top of your deck: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'trashFromDeck', player: 'self', amount: 2 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 5,
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
    // EB01-052 Viola
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play]Choose one:• Look at all of your opponent's Life cards and place them back in their Life area in any order.• Turn all of your Life cards face-down.
    {
      cardId: 'EB01-052',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'eb01-052-on-play-choose-life-manipulation',
        },
      ],
    },
    // EB01-053 Gastino
    // [On Play] Place up to 1 of your opponent's Characters with a cost of 3 or less at the top or bottom of your opponent's Life cards face-up.[Trigger] Give up to a total of 2 of your opponent's Leader or Character cards -3000 power during this turn.
    {
      cardId: 'EB01-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gastino-on-play-place-into-life-face-up',
            text: "[On Play] Place up to 1 of your opponent's Characters with a cost of 3 or less at the top or bottom of your opponent's Life cards face-up.",
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
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'life',
                faceDown: false,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gastino-trigger-minus-3000-to-up-to-2',
            text: "[Trigger] Give up to a total of 2 of your opponent's Leader or Character cards -3000 power during this turn.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 2 },
                },
                amount: -3000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // EB01-054 Gan.Fall
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Play] If your opponent has 1 or less Life cards, K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'EB01-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gan-fall-on-play-ko-cost-3-if-opponent-life-1-or-less',
            text: "[On Play] If your opponent has 1 or less Life cards, K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLifeAtMost',
                player: 'opponent',
                value: 1,
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
      ],
    },
    // EB01-056 Charlotte Flampe (SP)
    // [On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Draw 1 card.
    {
      cardId: 'EB01-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-flampe-on-play-life-to-hand-to-draw-1',
            text: '[On Play] You may add 1 card from the top or bottom of your Life cards to your hand: Draw 1 card.',
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
                destinationPlayer: 'self',
                destinationZone: 'hand',
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // EB01-057 Shirahoshi (SP)
    // When this Character is K.O.'d by your opponent's effect, add up to 1 card from the top of your deck to the top of your Life cards.[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'EB01-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirahoshi-on-ko-by-opponent-effect-add-to-life',
            text: "When this Character is K.O.'d by your opponent's effect, add up to 1 card from the top of your deck to the top of your Life cards.",
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventReasonIs', value: 'effect' },
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
    // EB01-058 Mont Blanc Cricket
    // [DON!! x1] [Your Turn] If you have 2 or less Life cards, this Character gains +2000 power.
    {
      cardId: 'EB01-058',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'mont-blanc-cricket-don-x1-your-turn-life-2-or-less-plus-2000',
            text: '[DON!! x1] [Your Turn] If you have 2 or less Life cards, this Character gains +2000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Mont Blanc Cricket'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // EB01-059 Kingdom Come
    // [Main] K.O. up to 1 of your opponent's Characters. Then, trash cards from the top of your Life cards until you have 1 Life card.[Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the total of your and your opponent's Life cards.
    {
      cardId: 'EB01-059',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'eb01-059-main-ko-and-trash-life-until-1',
        },
        {
          kind: 'standard',
          effect: {
            id: 'kingdom-come-trigger-ko-based-on-life-total',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the total of your and your opponent's Life cards.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
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
    // EB01-060 Did Someone Say...Kami?
    // [Main] Play up to 1 [Enel] with a cost of 7 or less life from your hand or trash. Then, trash cards from the top of your Life cards until you have 1 Life card. [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'EB01-060',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'eb01-060-main-play-enel-and-trash-life',
        },
        {
          kind: 'standard',
          effect: {
            id: 'did-someone-say-kami-trigger-draw-2-trash-1',
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
    // EB01-061 Mr.2.Bon.Kurei (Bentham)
    // [On Play] Add up to 1 DON!! card from your DON!! deck and set it as active.[When Attacking] Select up to 1 of your opponent's Characters. This Character's base power becomes the same as the selected Character's power during this turn.
    {
      cardId: 'EB01-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'mr-2-bon-kurei-on-play-add-active-don',
            text: '[On Play] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay' },
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
          kind: 'special-ref',
          specialHandlerId: 'eb01-061-when-attacking-copy-power',
        },
      ],
    },
  ],
};
