import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const op11EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-11',
  cards: [
    // OP11-001 Koby (001) (Alternate Art)
    // Your "SWORD" type Characters can attack Characters on the turn in which they are played.
    // [Once Per Turn] If your "Navy" type Character with 7000 base power or less would be removed from the field by your opponent's effect, you may place 3 cards from your trash at the bottom of your deck in any order instead.
    {
      cardId: 'OP11-001',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-001-special',
        },
      ],
    },
    // OP11-002 Ain
    // [On Play] Give up to 1 of your opponent's Characters 1000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 0 power or less.
    {
      cardId: 'OP11-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ain-on-play-minus-1000-then-ko-0-or-less',
            text: "[On Play] Give up to 1 of your opponent's Characters 1000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 0 power or less.",
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
                amount: -1000,
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
          },
        },
      ],
    },
    // OP11-003 Usopp
    {
      cardId: 'OP11-003',
      effects: [],
    },
    // OP11-004 Kujyaku
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Navy" type card other than "Kujyaku" and add it to your hand. Then, place the rest at the bottom of your deck in any order.[Activate: Main] You may trash this Character: Up to 1 of your Characters gains +1000 power during this turn.
    {
      cardId: 'OP11-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kujyaku-on-play-search-navy',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Navy" type card other than "Kujyaku" and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Navy'],
                  excludeName: ['Kujyaku'],
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
            id: 'kujyaku-activate-main-trash-self-plus-1000',
            text: '[Activate: Main] You may trash this Character: Up to 1 of your Characters gains +1000 power during this turn.',
            trigger: { type: 'activateMain' },
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
    // OP11-005 Smoker
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [DON!! x1] This Character cannot be K.O.'d by effects of Characters without the (Special) attribute.
    {
      cardId: 'OP11-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'smoker-don-1-cannot-be-koed-by-non-special-effects',
            text: "[DON!! x1] This Character cannot be K.O.'d by effects of Characters without the (Special) attribute.",
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
      ],
    },
    // OP11-006 Zephyr
    // [DON!! x1] [When Attacking] Give up to 1 of your opponent's (Special) attribute Characters 5000 power during this turn.
    {
      cardId: 'OP11-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zephyr-don-1-when-attacking-minus-5000-special',
            text: "[DON!! x1] [When Attacking] Give up to 1 of your opponent's (Special) attribute Characters 5000 power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    attribute: ['Special'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -5000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP11-007 Tashigi
    // [Activate: Main] You may rest this Character: If your Leader has the "Navy" type, up to 1 of your "Navy" type Characters gains +2000 power during this turn.
    {
      cardId: 'OP11-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'tashigi-activate-main-rest-self-navy-leader-plus-2000',
            text: '[Activate: Main] You may rest this Character: If your Leader has the "Navy" type, up to 1 of your "Navy" type Characters gains +2000 power during this turn.',
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
            ],
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
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Navy'] },
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
    // OP11-008 Doll
    // [Blocker]
    // [On Play] You may trash 1 card from your hand: If your Leader has the "Navy" type, give up to 1 of your opponent's Characters 6000 power during this turn.
    {
      cardId: 'OP11-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'doll-on-play-trash-1-navy-leader-minus-6000',
            text: '[On Play] You may trash 1 card from your hand: If your Leader has the "Navy" type, give up to 1 of your opponent\'s Characters 6000 power during this turn.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
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
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -6000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP11-009 Nico Robin
    // [DON!! x2] [When Attacking] Give up to 1 of your opponent's Characters 2000 power until the end of your opponent's next turn.
    {
      cardId: 'OP11-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nico-robin-don-2-when-attacking-minus-2000-until-opponent-next-turn',
            text: "[DON!! x2] [When Attacking] Give up to 1 of your opponent's Characters 2000 power until the end of your opponent's next turn.",
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
                amount: -2000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP11-010 Hibari
    // [On Play] Give up to 1 of your opponent's Characters 2000 power during this turn.
    // [When Attacking] This Character gains +1000 power during this turn. Then, up to 1 of your "Navy" type Leader can also attack active Characters during this turn.
    {
      cardId: 'OP11-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hibari-on-play-minus-2000',
            text: "[On Play] Give up to 1 of your opponent's Characters 2000 power during this turn.",
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
        {
          kind: 'standard',
          effect: {
            id: 'hibari-when-attacking-self-plus-1000',
            text: '[When Attacking] This Character gains +1000 power during this turn.',
            trigger: { type: 'whenAttacking' },
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
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'hibari-when-attacking-navy-leader-can-attack-active',
            text: 'Then, up to 1 of your "Navy" type Leader can also attack active Characters during this turn.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { cardCategory: ['Leader'], trait: ['Navy'] },
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
    // OP11-011 Bins
    {
      cardId: 'OP11-011',
      effects: [],
    },
    // OP11-012 Franky
    // [Your Turn] [Once Per Turn] When your opponent activates an Event, all of your Characters gain +2000 power during this turn.
    {
      cardId: 'OP11-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'franky-your-turn-on-event-all-characters-plus-2000',
            text: '[Your Turn] [Once Per Turn] When your opponent activates an Event, all of your Characters gain +2000 power during this turn.',
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP11-013 Prince Grus
    // [When Attacking] All of your opponent's Characters with 2000 power or less cannot activate [Blocker] during this turn.
    {
      cardId: 'OP11-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'prince-grus-when-attacking-blocker-restrict-2000-or-less',
            text: "[When Attacking] All of your opponent's Characters with 2000 power or less cannot activate [Blocker] during this turn.",
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 2000 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP11-014 Borsalino
    // [Blocker]
    // [Activate: Main] You may rest this Character: Up to 1 of your "Navy" type Leader or Character cards can also attack active Characters during this turn.
    {
      cardId: 'OP11-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'borsalino-activate-main-rest-self-navy-can-attack-active',
            text: '[Activate: Main] You may rest this Character: Up to 1 of your "Navy" type Leader or Character cards can also attack active Characters during this turn.',
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
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Navy'] },
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
    // OP11-015 Mocha
    {
      cardId: 'OP11-015',
      effects: [],
    },
    // OP11-016 Roronoa Zoro
    // [Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP11-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'roronoa-zoro-activate-main-once-per-turn-attach-rested-don',
            text: '[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
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
    // OP11-017 X.Drake
    {
      cardId: 'OP11-017',
      effects: [],
    },
    // OP11-018 Honesty Impact
    // [Main] Give up to 1 of your opponent's Characters 4000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 6000 power or less.
    // [Trigger] K.O. up to 1 of your opponent's Characters with 6000 power or less.
    {
      cardId: 'OP11-018',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'honesty-impact-main-minus-4000-then-ko-6000-or-less',
            text: "[Main] Give up to 1 of your opponent's Characters 4000 power during this turn. Then, K.O. up to 1 of your opponent's Characters with 6000 power or less.",
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
                  filter: { cardCategory: ['Character'], powerMax: 6000 },
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
            id: 'honesty-impact-trigger-ko-6000-or-less',
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
    // OP11-019 Glorp Web!!
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if your opponent has a Character with 6000 power or more, up to 1 of your Leader or Character cards gains +1000 power during this turn.
    // [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP11-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'glorp-web-counter-plus-2000',
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
            id: 'glorp-web-counter-additional-plus-1000-if-opponent-6000',
            text: 'Then, if your opponent has a Character with 6000 power or more, up to 1 of your Leader or Character cards gains +1000 power during this turn.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 6000 },
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
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'glorp-web-trigger-plus-1000',
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
    // OP11-020 X Calibur
    // [Main] Give up to 2 of your opponent's Characters 2000 power during this turn. Then, up to 1 of your "Navy" type Characters gains +1000 power during this turn.
    // [Trigger] K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'OP11-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'x-calibur-main-minus-2000-up-to-2-then-navy-plus-1000',
            text: '[Main] Give up to 2 of your opponent\'s Characters 2000 power during this turn. Then, up to 1 of your "Navy" type Characters gains +1000 power during this turn.',
            trigger: { type: 'activateMain' },
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
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Navy'] },
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
            id: 'x-calibur-trigger-ko-4000-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'trigger' },
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
    // OP11-021 Jinbe (021) (Alternate Art)
    // [End of Your Turn] If you have 6 or less cards in your hand, set up to 1 of your "Fish-Man" or "Merfolk" type Characters and up to 1 of your DON!! cards as active.
    {
      cardId: 'OP11-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-021-end-of-turn-hand-6-or-less-unrest-fishman-and-don',
            text: '[End of Your Turn] If you have 6 or less cards in your hand, set up to 1 of your "Fish-Man" or "Merfolk" type Characters and up to 1 of your DON!! cards as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [
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
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Fish-Man', 'Merfolk'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
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
    // OP11-022 Shirahoshi (022) (Alternate Art)
    // This Leader cannot attack.
    // [Activate: Main] [Once Per Turn] You may rest 1 of your DON!! cards and turn 1 card from the top of your Life cards face-up: Play up to 1 "Neptunian" type Character card or "Megalo" with a cost equal to or less than the number of DON!! cards on your field from your hand.
    {
      cardId: 'OP11-022',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-022-special',
        },
      ],
    },
    // OP11-023 Arlong
    // If your Leader has the "Fish-Man" type, you have 3 or less Life cards and your opponent has 5 or more rested cards, give this card in your hand 3 cost.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP11-023',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-023-special',
        },
      ],
    },
    // OP11-024 Aladine
    // When this Character is K.O.'d by your opponent's effect, you may trash 1 card from your hand and rest 1 of your DON!! cards. If you do, play up to 1 "Fish-Man" or "Merfolk" type Character card with a cost of 6 or less from your hand.
    {
      cardId: 'OP11-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'aladine-on-ko-by-opponent-trash-and-rest-don-play-fishman',
            text: 'When this Character is K.O.\'d by your opponent\'s effect, you may trash 1 card from your hand and rest 1 of your DON!! cards. If you do, play up to 1 "Fish-Man" or "Merfolk" type Character card with a cost of 6 or less from your hand.',
            trigger: { type: 'onKo', optional: true },
            conditions: [
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventReasonIs', value: 'effect' },
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
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
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
                    trait: ['Fish-Man', 'Merfolk'],
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
    // OP11-025 Ishilly
    // [On Your Opponent's Attack] [Once Per Turn] You may rest 1 of your DON!! cards and this Character: Up to 1 of your Leader or Character cards gains +1000 power during this battle.
    {
      cardId: 'OP11-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ishilly-on-opponent-attack-rest-don-and-self-plus-1000',
            text: "[On Your Opponent's Attack] [Once Per Turn] You may rest 1 of your DON!! cards and this Character: Up to 1 of your Leader or Character cards gains +1000 power during this battle.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: false }],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
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
    // OP11-026 Scaled Neptunian
    {
      cardId: 'OP11-026',
      effects: [],
    },
    // OP11-027 Bulge-Eyed Neptunian
    // If your Leader is [Shirahoshi], this Character can attack Characters on the turn in which it is played.
    {
      cardId: 'OP11-027',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'bulge-eyed-neptunian-shirahoshi-leader-rush',
            text: 'If your Leader is [Shirahoshi], this Character can attack Characters on the turn in which it is played.',
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
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
    // OP11-028 Lord of the Coast
    // [On Play] Up to 1 of your opponent's rested Characters will not become active in your opponent's next Refresh Phase.
    // [Trigger] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.
    {
      cardId: 'OP11-028',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lord-of-the-coast-on-play-skip-refresh-rested',
            text: "[On Play] Up to 1 of your opponent's rested Characters will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { rested: true },
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
            id: 'lord-of-the-coast-trigger-ko-rested-cost-3-or-less',
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
                    costMax: 3,
                    rested: true,
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
    // OP11-029 Charlotte Praline
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Rest up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP11-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-praline-on-play-rest-cost-1-or-less',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'onPlay' },
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
    // OP11-030 Shirahoshi (030)
    // [Activate: Main] You may rest 1 of your DON!! cards and this Character: Look at 5 cards from the top of your deck; reveal up to 1 "Neptunian" or "Fish-Man Island" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP11-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirahoshi-030-activate-main-rest-don-and-self-search',
            text: '[Activate: Main] You may rest 1 of your DON!! cards and this Character: Look at 5 cards from the top of your deck; reveal up to 1 "Neptunian" or "Fish-Man Island" type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
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
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Neptunian', 'Fish-Man Island'],
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
    // OP11-031 Jinbe (031)
    // [On Play] If your Leader has the "Fish-Man" or "Merfolk" type, rest up to 1 of your opponent's Characters with a cost of 5 or less.
    // [Activate: Main] [Once Per Turn] Up to 1 of your "Fish-Man" or "Merfolk" type Characters can attack Characters on the turn in which it is played.
    {
      cardId: 'OP11-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-031-on-play-leader-fishman-rest-cost-5-or-less',
            text: '[On Play] If your Leader has the "Fish-Man" or "Merfolk" type, rest up to 1 of your opponent\'s Characters with a cost of 5 or less.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Fish-Man',
              },
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'jinbe-031-activate-main-once-per-turn-fishman-rush',
            text: '[Activate: Main] [Once Per Turn] Up to 1 of your "Fish-Man" or "Merfolk" type Characters can attack Characters on the turn in which it is played.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Fish-Man', 'Merfolk'],
                  },
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
    // OP11-032 Surume
    {
      cardId: 'OP11-032',
      effects: [],
    },
    // OP11-033 Bird Neptunian
    {
      cardId: 'OP11-033',
      effects: [],
    },
    // OP11-034 Hatchan
    // [Activate: Main] You may rest this Character: If your Leader has the "Fish-Man" or "Merfolk" type, up to 1 of your opponent's Characters with a cost of 3 or less cannot be rested until the end of your opponent's next turn.
    {
      cardId: 'OP11-034',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-034-special',
        },
      ],
    },
    // OP11-035 Fisher Tiger
    // When this Character is K.O.'d by your opponent's effect, you may rest 1 of your DON!! cards. If you do, play up to 1 "Fish-Man" or "Merfolk" type Character card with a cost of 4 or less from your hand.
    // [On Play] Rest up to 1 of your opponent's Characters.
    {
      cardId: 'OP11-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fisher-tiger-on-ko-by-opponent-rest-don-play-fishman',
            text: 'When this Character is K.O.\'d by your opponent\'s effect, you may rest 1 of your DON!! cards. If you do, play up to 1 "Fish-Man" or "Merfolk" type Character card with a cost of 4 or less from your hand.',
            trigger: { type: 'onKo', optional: true },
            conditions: [
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventReasonIs', value: 'effect' },
            ],
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 1 },
                },
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
                    trait: ['Fish-Man', 'Merfolk'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'fisher-tiger-on-play-rest-opponent',
            text: "[On Play] Rest up to 1 of your opponent's Characters.",
            trigger: { type: 'onPlay' },
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
    // OP11-036 Spotted Neptunian
    // [On Play] If your Leader is "Shirahoshi", look at 5 cards from the top of your deck; reveal up to 1 "Neptunian" type card or "Shirahoshi" and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP11-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'spotted-neptunian-on-play-shirahoshi-search',
            text: '[On Play] If your Leader is "Shirahoshi", look at 5 cards from the top of your deck; reveal up to 1 "Neptunian" type card or "Shirahoshi" and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Neptunian'],
                  name: ['Shirahoshi'],
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
    // OP11-037 Ancient Weapon Poseidon
    // [Main] Look at 4 cards from the top of your deck; reveal up to 1 "Neptunian" or "Fish-Man Island" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP11-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'ancient-weapon-poseidon-main-search-neptunian',
            text: '[Main] Look at 4 cards from the top of your deck; reveal up to 1 "Neptunian" or "Fish-Man Island" type Character card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Neptunian', 'Fish-Man Island'],
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
            id: 'ancient-weapon-poseidon-trigger-draw-1',
            text: '[Trigger] Draw 1 card.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP11-038 Gum-Gum Elephant Gatling
    // [Main] You may rest 1 of your DON!! cards: Rest up to 1 of your opponent's Characters with a cost of 5 or less.
    // [Counter] Up to 1 of your Leader gains +3000 power during this battle.
    {
      cardId: 'OP11-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-elephant-gatling-main-rest-don-rest-cost-5-or-less',
            text: "[Main] You may rest 1 of your DON!! cards: Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
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
                  filter: { cardCategory: ['Character'], costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-elephant-gatling-counter-leader-plus-3000',
            text: '[Counter] Up to 1 of your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP11-039 Vagabond Drill
    // [Counter] Up to 1 of your "Fish-Man" or "Merfolk" type Leader or Character cards gains +3000 power during this battle. Then, rest up to 1 of your opponent's Characters with a cost of 3 or less.
    // [Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP11-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vagabond-drill-counter-fishman-plus-3000-then-rest-cost-3-or-less',
            text: '[Counter] Up to 1 of your "Fish-Man" or "Merfolk" type Leader or Character cards gains +3000 power during this battle. Then, rest up to 1 of your opponent\'s Characters with a cost of 3 or less.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Fish-Man', 'Merfolk'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 3000,
                duration: { type: 'untilEndOfBattle' },
              },
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
        {
          kind: 'standard',
          effect: {
            id: 'vagabond-drill-trigger-rest-cost-4-or-less',
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
    // OP11-040 Monkey.D.Luffy (040) (Alternate Art)
    // This effect can be activated at the start of your turn. If you have 8 or more DON!! cards on your field, look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card and add it to your hand. Then, place the rest at the top or bottom of the deck in any order.
    {
      cardId: 'OP11-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'luffy-040-start-of-turn-don-8-plus-search-straw-hat',
            text: 'This effect can be activated at the start of your turn. If you have 8 or more DON!! cards on your field, look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card and add it to your hand. Then, place the rest at the top or bottom of the deck in any order.',
            trigger: { type: 'onTurnStart' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 8 },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Straw Hat Crew'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
              },
            ],
          },
        },
      ],
    },
    // OP11-041 Nami (041)
    // [Your Turn] [Once Per Turn] This effect can be activated when a card is removed from your or your opponent's Life cards. If you have 7 or less cards in your hand, draw 1 card.[DON!! x1] [On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: This Leader gains +2000 power during this turn.
    {
      cardId: 'OP11-041',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-041-special',
        },
      ],
    },
    // OP11-042 Vito
    // [On Play] You may trash 1 "Firetank Pirates" type card from your hand: This Character gains [Rush] during this turn.
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP11-042',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vito-on-play-trash-firetank-rush',
            text: '[On Play] You may trash 1 "Firetank Pirates" type card from your hand: This Character gains [Rush] during this turn.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Firetank Pirates'] },
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
    // OP11-043 Vinsmoke Ichiji
    // [Blocker]
    // [On Your Opponent's Attack] [Once Per Turn] This effect can be activated when you only have Characters with a type including "GERMA". Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP11-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-ichiji-on-opponent-attack-only-germa-plus-1000-trash-2',
            text: '[On Your Opponent\'s Attack] [Once Per Turn] This effect can be activated when you only have Characters with a type including "GERMA". Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, trash 2 cards from the top of your deck.',
            trigger: { type: 'onAttacked', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'GERMA',
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
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
      ],
    },
    // OP11-044 Vinsmoke Judge
    // [Activate: Main] [Once Per Turn] You may trash 1 card from your hand: All of your "GERMA 66" type Characters gain +1000 power during this turn.
    {
      cardId: 'OP11-044',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-judge-activate-main-trash-1-germa-66-plus-1000',
            text: '[Activate: Main] [Once Per Turn] You may trash 1 card from your hand: All of your "GERMA 66" type Characters gain +1000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
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
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['GERMA 66'] },
                },
                amount: 1000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP11-045 Vinsmoke Niji
    {
      cardId: 'OP11-045',
      effects: [],
    },
    // OP11-046 Vinsmoke Yonji
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // If you only have Characters with a type including "GERMA", this Character cannot be K.O.'d or rested by your opponent's effects.
    {
      cardId: 'OP11-046',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'vinsmoke-yonji-only-germa-cannot-be-koed-or-rested',
            text: 'If you only have Characters with a type including "GERMA", this Character cannot be K.O.\'d or rested by your opponent\'s effects.',
            conditions: [
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'GERMA',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotBeKoedByEffects'],
            },
          },
        },
      ],
    },
    // OP11-047 Vinsmoke Reiju
    // [On Play] If your Leader has the "The Vinsmoke Family" type, look at 5 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP11-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vinsmoke-reiju-on-play-vinsmoke-leader-search-germa',
            text: '[On Play] If your Leader has the "The Vinsmoke Family" type, look at 5 cards from the top of your deck; reveal up to 1 card with a type including "GERMA" and add it to your hand. Then, trash the rest.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'The Vinsmoke Family',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['GERMA 66', 'The Vinsmoke Family'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP11-048 Capone"Gang"Bege (048)
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 "Firetank Pirates" or "Straw Hat Crew" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP11-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'capone-gang-bege-048-on-play-search-firetank-or-straw-hat',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 "Firetank Pirates" or "Straw Hat Crew" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Firetank Pirates', 'Straw Hat Crew'],
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
    // OP11-049 Carrot
    // [On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.
    // [On Your Opponent's Attack] You may trash this Character: Up to 1 of your Leader gains +1000 power during this battle.
    {
      cardId: 'OP11-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'carrot-on-play-arrange-top-3',
            text: '[On Play] Look at 3 cards from the top of your deck and place them at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'arrangeDeckWindow', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'carrot-on-opponent-attack-trash-self-leader-plus-1000',
            text: "[On Your Opponent's Attack] You may trash this Character: Up to 1 of your Leader gains +1000 power during this battle.",
            trigger: { type: 'onAttacked' },
            conditions: [{ type: 'controllerTurn', value: false }],
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
                  zones: ['leader'],
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
    // OP11-050 Gotti
    // [When Attacking] You may trash 1 "Firetank Pirates" type card from your hand: Return up to 1 Character with a cost of 1 or less to the owner's hand or place it at the bottom of their deck.
    {
      cardId: 'OP11-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gotti-when-attacking-trash-firetank-bounce-or-bottom',
            text: '[When Attacking] You may trash 1 "Firetank Pirates" type card from your hand: Return up to 1 Character with a cost of 1 or less to the owner\'s hand or place it at the bottom of their deck.',
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Firetank Pirates'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [
              {
                type: 'chooseActionBranch',
                message: 'Return to hand or place at bottom of deck?',
                choices: [
                  {
                    id: 'return-to-hand',
                    label: 'Return to hand',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { costMax: 1 },
                          count: { kind: 'upTo', value: 1 },
                        },
                        destinationPlayer: 'selectedCardOwner',
                        destinationZone: 'hand',
                      },
                    ],
                  },
                  {
                    id: 'place-at-bottom',
                    label: 'Place at bottom of deck',
                    actions: [
                      {
                        type: 'moveCard',
                        selector: {
                          player: 'opponent',
                          zones: ['characters'],
                          filter: { costMax: 1 },
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
    // OP11-051 Sanji
    // When this Character is K.O.'d by your opponent's effect, look at 5 cards from the top of your deck and play up to 1 "Straw Hat Crew" type Character card with a cost of 5 or less. Then, place the rest at the bottom of your deck in any order.
    // [On Play] Return up to 1 Character with 5000 base power or less to the owner's hand.
    {
      cardId: 'OP11-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'sanji-on-ko-by-opponent-search-5-play-straw-hat',
            text: 'When this Character is K.O.\'d by your opponent\'s effect, look at 5 cards from the top of your deck and play up to 1 "Straw Hat Crew" type Character card with a cost of 5 or less. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventReasonIs', value: 'effect' },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Straw Hat Crew'],
                  costMax: 5,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'characters',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'sanji-on-play-bounce-base-power-5000-or-less',
            text: "[On Play] Return up to 1 Character with 5000 base power or less to the owner's hand.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], basePowerMax: 5000 },
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
    // OP11-052 Charlotte Lola
    {
      cardId: 'OP11-052',
      effects: [],
    },
    // OP11-053 Tony Tony.Chopper
    {
      cardId: 'OP11-053',
      effects: [],
    },
    // OP11-054 Nami (054)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] If your Leader is multicolored, draw 3 cards and place 2 cards from your hand at the top or bottom of your deck in any order.
    {
      cardId: 'OP11-054',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'nami-054-on-play-multicolored-leader-draw-3-place-2',
            text: '[On Play] If your Leader is multicolored, draw 3 cards and place 2 cards from your hand at the top or bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 3 },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP11-055 Bartolomeo
    {
      cardId: 'OP11-055',
      effects: [],
    },
    // OP11-056 Brook
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Place up to 1 Character with a base cost of 1 at the bottom of the owner's deck.
    {
      cardId: 'OP11-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'brook-on-play-bottom-deck-base-cost-1',
            text: "[On Play] Place up to 1 Character with a base cost of 1 at the bottom of the owner's deck.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    baseCostMin: 1,
                    baseCostMax: 1,
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
    // OP11-057 Pedro
    // If you have 4 or less cards in your hand, this Character gains [Blocker].
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP11-057',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'pedro-hand-4-or-less-gains-blocker',
            text: 'If you have 4 or less cards in your hand, this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: { player: 'self', zones: ['hand'] },
                value: 4,
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
    // OP11-058 Monkey.D.Luffy (058)
    // If you have 5 or more cards in your hand, this Character cannot attack.
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP11-058',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'luffy-058-hand-5-or-more-cannot-attack',
            text: 'If you have 5 or more cards in your hand, this Character cannot attack.',
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['hand'] },
                value: 5,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              keywords: ['cannotAttack'],
            },
          },
        },
      ],
    },
    // OP11-059 Gum-Gum King Cobra
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 4 or less cards in your hand, that card gains an additional +2000 power during this battle.
    // [Trigger] Return up to 1 Character with a cost of 2 or less to the owner's hand.
    {
      cardId: 'OP11-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-king-cobra-counter-plus-2000',
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
            id: 'gum-gum-king-cobra-counter-additional-plus-2000-if-hand-4-or-less',
            text: 'Then, if you have 4 or less cards in your hand, that card gains an additional +2000 power during this battle.',
            trigger: { type: 'activateCounter' },
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
            id: 'gum-gum-king-cobra-trigger-bounce-cost-2-or-less',
            text: "[Trigger] Return up to 1 Character with a cost of 2 or less to the owner's hand.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 2 },
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
    // OP11-060 Let's Crash This Wedding!!!
    // [Main] If your Leader is multicolored, look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card other than [Let's Crash This Wedding!!!] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP11-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'lets-crash-this-wedding-main-search-straw-hat',
            text: '[Main] If your Leader is multicolored, look at 5 cards from the top of your deck; reveal up to 1 "Straw Hat Crew" type card other than [Let\'s Crash This Wedding!!!] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 2,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Straw Hat Crew'],
                  excludeName: ["Let's Crash This Wedding!!!"],
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
            id: 'lets-crash-this-wedding-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP11-060',
                effectId: 'lets-crash-this-wedding-main-search-straw-hat',
              },
            ],
          },
        },
      ],
    },
    // OP11-061 Gum-Gum Jet Culverin
    // [Main] Place up to 1 of your opponent's Characters with a base cost of 4 or less at the bottom of the owner's deck.
    // [Trigger] Place up to 1 Character with a cost of 1 or less at the bottom of the owner's deck.
    {
      cardId: 'OP11-061',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-jet-culverin-main-bottom-deck-base-cost-4-or-less',
            text: "[Main] Place up to 1 of your opponent's Characters with a base cost of 4 or less at the bottom of the owner's deck.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMax: 4 },
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
            id: 'gum-gum-jet-culverin-trigger-bottom-deck-cost-1-or-less',
            text: "[Trigger] Place up to 1 Character with a cost of 1 or less at the bottom of the owner's deck.",
            trigger: { type: 'trigger' },
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
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP11-062 Charlotte Katakuri (062) (Alternate Art)
    // [When Attacking]/[On Your Opponent's Attack] [Once Per Turn] DON!! 1: Look at 1 card from the top of your opponent's deck. Then, this Leader gains +1000 power during this battle.
    {
      cardId: 'OP11-062',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-katakuri-062-when-attacking-don-1-look-top-plus-1000',
            text: "[When Attacking] [Once Per Turn] DON!! 1: Look at 1 card from the top of your opponent's deck. Then, this Leader gains +1000 power during this battle.",
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'reveal',
                player: 'opponent',
                zone: 'deck',
                amount: 1,
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
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-katakuri-062-on-opponent-attack-don-1-look-top-plus-1000',
            text: "[On Your Opponent's Attack] [Once Per Turn] DON!! 1: Look at 1 card from the top of your opponent's deck. Then, this Leader gains +1000 power during this battle.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
            ],
            actions: [
              {
                type: 'reveal',
                player: 'opponent',
                zone: 'deck',
                amount: 1,
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
    // OP11-063 Little Sadi
    // [On Play] DON!! 1 (You may return the specified number of DON!! cards from your field to your DON!! deck.): If your Leader has the "Impel Down" type, rest up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP11-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'little-sadi-on-play-don-1-impel-down-rest-cost-3-or-less',
            text: '[On Play] DON!! 1: If your Leader has the "Impel Down" type, rest up to 1 of your opponent\'s Characters with a cost of 3 or less.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
              },
            ],
            costs: [{ type: 'removeDon', player: 'self', amount: 1 }],
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
    // OP11-064 Saldeath
    {
      cardId: 'OP11-064',
      effects: [],
    },
    // OP11-065 Charlotte Anana
    // If you have a purple "Big Mom Pirates" type Character other than [Charlotte Anana], this Character gains [Blocker].
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP11-065',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'charlotte-anana-has-purple-big-mom-character-gains-blocker',
            text: 'If you have a purple "Big Mom Pirates" type Character other than [Charlotte Anana], this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Big Mom Pirates'],
                    color: ['Purple'],
                    excludeName: ['Charlotte Anana'],
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
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP11-066 Charlotte Oven
    // [Activate: Main] You may rest this Character: Choose a cost and reveal 1 card from the top of your opponent's deck. If the revealed card has the chosen cost, K.O. up to 1 of your opponent's Characters with a base cost of 3 or less. Then, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP11-066',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-066-special',
        },
      ],
    },
    // OP11-067 Charlotte Katakuri (067)
    // [Blocker]
    // [End of Your Turn] Set up to 2 of your "Big Mom Pirates" type Characters with a cost of 3 or more as active. Then, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP11-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-katakuri-067-end-of-turn-unrest-big-mom-cost-3-plus-add-don',
            text: '[End of Your Turn] Set up to 2 of your "Big Mom Pirates" type Characters with a cost of 3 or more as active. Then, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onTurnEnd' },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Big Mom Pirates'],
                    costMin: 3,
                  },
                  count: { kind: 'upTo', value: 2 },
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
    // OP11-068 Charlotte Daifuku
    {
      cardId: 'OP11-068',
      effects: [],
    },
    // OP11-069 Charlotte Brulee
    // [On Play] You may add 1 card from the top of your Life cards to your hand: If your Leader has the "Big Mom Pirates" type, add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP11-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-brulee-on-play-life-to-hand-big-mom-leader-add-don',
            text: '[On Play] You may add 1 card from the top of your Life cards to your hand: If your Leader has the "Big Mom Pirates" type, add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Big Mom Pirates',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
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
    // OP11-070 Charlotte Pudding
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Big Mom Pirates" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.[Activate: Main] DON!! 1, You may rest this Character: Look at 1 card from the top of your opponent's deck.
    {
      cardId: 'OP11-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-on-play-search-big-mom',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 "Big Mom Pirates" type card with a cost of 2 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Big Mom Pirates'],
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
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-pudding-activate-main-don-1-rest-self-look-top',
            text: "[Activate: Main] DON!! 1, You may rest this Character: Look at 1 card from the top of your opponent's deck.",
            trigger: { type: 'activateMain' },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
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
                type: 'reveal',
                player: 'opponent',
                zone: 'deck',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // OP11-071 Charlotte Perospero
    // [Activate: Main] [Once Per Turn] You may trash 1 card from your hand: Choose a cost and reveal 1 card from the top of your opponent's deck. If the revealed card has the chosen cost, draw 1 card and add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP11-071',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-071-special',
        },
      ],
    },
    // OP11-072 Charlotte Mont-d'or
    // [Activate: Main] [Once Per Turn] DON!! 1, You may rest this Character: Your opponent places 2 cards from their trash at the bottom of their deck in any order. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'OP11-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'charlotte-mont-dor-activate-main-don-1-rest-self-opponent-bottom-trash-then-life-to-hand',
            text: '[Activate: Main] [Once Per Turn] DON!! 1, You may rest this Character: Your opponent places 2 cards from their trash at the bottom of their deck in any order. Then, add 1 card from the top of your Life cards to your hand.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
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
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'deck',
                toBottom: true,
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
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
    // OP11-073 Charlotte Linlin
    // If your Leader has the "Big Mom Pirates" type, this Character gains [Rush].
    // [On Your Opponent's Attack] [Once Per Turn] DON!! 5: Choose a cost and reveal 1 card from the top of your opponent's deck. If the revealed card has the chosen cost, up to 1 of your Leader gains +2000 power during this turn.
    {
      cardId: 'OP11-073',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'charlotte-linlin-big-mom-leader-rush',
            text: 'If your Leader has the "Big Mom Pirates" type, this Character gains [Rush].',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Big Mom Pirates',
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
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-073-special',
        },
      ],
    },
    // OP11-074 Streusen
    // [Activate: Main] [Once Per Turn] DON!! 1, You may rest this Character: Choose a cost and reveal 1 card from the top of your opponent's deck. If the revealed card has the chosen cost, rest up to 1 of your opponent's Characters with a cost of 4 or less.
    {
      cardId: 'OP11-074',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-074-special',
        },
      ],
    },
    // OP11-075 Jaguar.D.Saul
    // [On Play] If your Leader is [Nico Robin] and you have 7 or more DON!! cards on your field, draw 2 cards.
    // [Trigger] Activate this card's [On Play] effect.
    {
      cardId: 'OP11-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jaguar-d-saul-on-play-nico-robin-leader-don-7-draw-2',
            text: '[On Play] If your Leader is [Nico Robin] and you have 7 or more DON!! cards on your field, draw 2 cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Nico Robin',
              },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 7 },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'jaguar-d-saul-trigger-activate-on-play',
            text: "[Trigger] Activate this card's [On Play] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP11-075',
                effectId:
                  'jaguar-d-saul-on-play-nico-robin-leader-don-7-draw-2',
              },
            ],
          },
        },
      ],
    },
    // OP11-076 Hannyabal
    // [Blocker]
    // [On Play] If your Leader has the "Impel Down" type, play up to 1 "Impel Down" type Character card with a cost of 3 or less from your hand.
    {
      cardId: 'OP11-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'hannyabal-on-play-impel-down-leader-play-impel-down',
            text: '[On Play] If your Leader has the "Impel Down" type, play up to 1 "Impel Down" type Character card with a cost of 3 or less from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
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
                    trait: ['Impel Down'],
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
    // OP11-077 Randolph
    // [Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, up to 1 of your "Big Mom Pirates" type Characters gains +2 cost until the end of your opponent's next turn.
    {
      cardId: 'OP11-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'randolph-your-turn-on-don-returned-big-mom-plus-2-cost',
            text: '[Your Turn] [Once Per Turn] When a DON!! card on your field is returned to your DON!! deck, up to 1 of your "Big Mom Pirates" type Characters gains +2 cost until the end of your opponent\'s next turn.',
            trigger: { type: 'onDonReturned', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: true }],
            actions: [
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Big Mom Pirates'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 2,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP11-078 Decuplets
    {
      cardId: 'OP11-078',
      effects: [],
    },
    // OP11-079 When Two Men Are Fighting the Last Thing I Need Is Some Half-Hearted Assistance!!!!
    // [Counter] Choose a cost and reveal 1 card from the top of your opponent's deck. If the revealed card has the chosen cost, up to 1 of your Leader or Character cards gains +5000 power during this battle.
    // [Trigger] Draw 1 card.
    {
      cardId: 'OP11-079',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-079-special',
        },
      ],
    },
    // OP11-080 Gear Two
    // [Main] You may rest 2 of your DON!! cards: If your Leader's colors include blue, add up to 1 DON!! card from your DON!! deck and rest it.
    // [Counter] Up to 1 of your Leader gains +3000 power during this battle.
    {
      cardId: 'OP11-080',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gear-two-main-rest-2-don-blue-leader-add-don',
            text: "[Main] You may rest 2 of your DON!! cards: If your Leader's colors include blue, add up to 1 DON!! card from your DON!! deck and rest it.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
            conditions: [
              {
                type: 'playerHasLeaderColorsAtLeast',
                player: 'self',
                value: 0,
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
        {
          kind: 'standard',
          effect: {
            id: 'gear-two-counter-leader-plus-3000',
            text: '[Counter] Up to 1 of your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP11-081 Cognac Mama-Mash
    // [Main] Choose a cost and reveal 1 card from the top of your opponent's deck. If the revealed card has the chosen cost, K.O. up to 1 of your opponent's Characters with a base cost of 8 or less.
    // [Trigger] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP11-081',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-081-special',
        },
      ],
    },
    // OP11-082 Aramaki
    // [Activate: Main] You may trash this Character: If your Leader has the "Navy" type, up to 1 of your "Navy" type Characters can also attack active Characters during this turn. Then, trash 2 cards from the top of your deck.
    {
      cardId: 'OP11-082',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'aramaki-activate-main-trash-self-navy-can-attack-active-trash-2',
            text: '[Activate: Main] You may trash this Character: If your Leader has the "Navy" type, up to 1 of your "Navy" type Characters can also attack active Characters during this turn. Then, trash 2 cards from the top of your deck.',
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
            ],
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
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], trait: ['Navy'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 2,
              },
            ],
          },
        },
      ],
    },
    // OP11-083 Caribou
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] Trash 2 cards from your hand.
    {
      cardId: 'OP11-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'caribou-on-play-trash-2-from-hand',
            text: '[On Play] Trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
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
    // OP11-084 Kuzan
    // [On Play] Trash 3 cards from the top of your deck.
    // [When Attacking] Up to 1 of your "Navy" type Leader or Character cards can also attack active Characters during this turn.
    {
      cardId: 'OP11-084',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-on-play-trash-3-from-deck',
            text: '[On Play] Trash 3 cards from the top of your deck.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'kuzan-when-attacking-navy-can-attack-active',
            text: '[When Attacking] Up to 1 of your "Navy" type Leader or Character cards can also attack active Characters during this turn.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Navy'] },
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
    // OP11-085 Kurozumi Orochi
    // [On Play] Add up to 1 "SMILE" type card with a cost of 5 or less from your trash to your hand.
    {
      cardId: 'OP11-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'kurozumi-orochi-on-play-search-smile-trash',
            text: '[On Play] Add up to 1 "SMILE" type card with a cost of 5 or less from your trash to your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  trait: ['SMILE'],
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
    // OP11-086 Coribou
    // [On Play] Trash 1 card from your hand.
    // [Activate: Main] You may trash this Character: Play up to 1 [Caribou] with a cost of 4 or less from your trash.
    {
      cardId: 'OP11-086',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'coribou-on-play-trash-1-from-hand',
            text: '[On Play] Trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
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
        {
          kind: 'standard',
          effect: {
            id: 'coribou-activate-main-trash-self-play-caribou',
            text: '[Activate: Main] You may trash this Character: Play up to 1 [Caribou] with a cost of 4 or less from your trash.',
            trigger: { type: 'activateMain' },
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    name: ['Caribou'],
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
    // OP11-087 Miss Sarahebi
    {
      cardId: 'OP11-087',
      effects: [],
    },
    // OP11-088 Shu
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Once Per Turn] This effect can be activated when your opponent's Character attacks. If that Character has the (Slash) attribute, this Character gains +5000 power during this battle.
    {
      cardId: 'OP11-088',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shu-on-opponent-attack-slash-self-plus-5000',
            text: "[Once Per Turn] This effect can be activated when your opponent's Character attacks. If that Character has the (Slash) attribute, this Character gains +5000 power during this battle.",
            trigger: { type: 'onAttacked', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: false }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 5000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP11-089 Black Maria
    {
      cardId: 'OP11-089',
      effects: [],
    },
    // OP11-090 Briscola
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP11-090',
      effects: [],
    },
    // OP11-091 Berry Good
    // [On Play] Your opponent places 3 Events from their trash at the bottom of their deck in any order.
    {
      cardId: 'OP11-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'berry-good-on-play-opponent-bottom-deck-3-events',
            text: '[On Play] Your opponent places 3 Events from their trash at the bottom of their deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['trash'],
                  filter: { cardCategory: ['Event'] },
                  count: { kind: 'exact', value: 3 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
          },
        },
      ],
    },
    // OP11-092 Helmeppo
    // [On Play] You may trash 1 card from your hand: Draw 1 card and play up to 1 "SWORD" type Character card with a cost of 8 or less other than [Helmeppo] from your trash. Then, place the 1 Character played by this effect at the bottom of the owner's deck at the end of this turn.
    {
      cardId: 'OP11-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'helmeppo-on-play-trash-1-draw-1-play-sword-then-schedule-bottom',
            text: '[On Play] You may trash 1 card from your hand: Draw 1 card and play up to 1 "SWORD" type Character card with a cost of 8 or less other than [Helmeppo] from your trash. Then, place the 1 Character played by this effect at the bottom of the owner\'s deck at the end of this turn.',
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
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['SWORD'],
                    costMax: 8,
                    excludeName: ['Helmeppo'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'scheduleActionsAtTurnEnd',
                actions: [
                  {
                    type: 'moveCard',
                    selector: {
                      player: 'self',
                      zones: ['characters'],
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
        },
      ],
    },
    // OP11-093 Bogard
    {
      cardId: 'OP11-093',
      effects: [],
    },
    // OP11-094 Morgan
    {
      cardId: 'OP11-094',
      effects: [],
    },
    // OP11-095 Monkey.D.Garp
    // [On Play] You may place 3 "Navy" type cards from your trash at the bottom of your deck in any order: Give up to 1 rested DON!! card to 1 of your Leader. Then, if there is a Character with a cost of 9 or more, K.O. up to 1 of your opponent's Characters with a cost of 7 or less.
    {
      cardId: 'OP11-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'monkey-d-garp-on-play-place-3-navy-trash-to-bottom-attach-don',
            text: '[On Play] You may place 3 "Navy" type cards from your trash at the bottom of your deck in any order: Give up to 1 rested DON!! card to 1 of your Leader.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { trait: ['Navy'] },
                  count: { kind: 'exact', value: 3 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
              },
            ],
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'upTo', value: 1 },
                },
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
            id: 'monkey-d-garp-on-play-conditional-ko-cost-7-or-less',
            text: "Then, if there is a Character with a cost of 9 or more, K.O. up to 1 of your opponent's Characters with a cost of 7 or less.",
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'either',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMin: 9 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], costMax: 7 },
                  count: { kind: 'upTo', value: 1 },
                },
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // OP11-096 Ripper
    // If you have a black "Navy" type Character other than [Ripper], this Character gains [Blocker].
    // (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP11-096',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'ripper-has-black-navy-character-gains-blocker',
            text: 'If you have a black "Navy" type Character other than [Ripper], this Character gains [Blocker].',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Navy'],
                    color: ['Black'],
                    excludeName: ['Ripper'],
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
              keywords: ['mustBeAttackTarget'],
            },
          },
        },
      ],
    },
    // OP11-097 After All These Years I'm Losing My Edge!!!
    // [Counter] Up to 1 of your Leader or Character cards gains +1000 power during this battle. Then, if you have 10 or more cards in your trash, add up to 1 black Character card with a cost of 3 or less from your trash to your hand.
    {
      cardId: 'OP11-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'losing-my-edge-counter-plus-1000',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +1000 power during this battle.',
            trigger: { type: 'activateCounter' },
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
        {
          kind: 'standard',
          effect: {
            id: 'losing-my-edge-counter-trash-10-plus-add-black-trash',
            text: 'Then, if you have 10 or more cards in your trash, add up to 1 black Character card with a cost of 3 or less from your trash to your hand.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: { player: 'self', zones: ['trash'] },
                value: 10,
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
                  color: ['Black'],
                  costMax: 3,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP11-098 Blue Hole
    // [Main] You may trash 3 cards from the top of your deck: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    // [Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'OP11-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'blue-hole-main-trash-3-ko-cost-2-or-less',
            text: "[Main] You may trash 3 cards from the top of your deck: K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'activateMain' },
            costs: [{ type: 'trashFromDeck', player: 'self', amount: 3 }],
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
            id: 'blue-hole-trigger-plus-1000',
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
    // OP11-099 I'm Gonna Be a Navy Officer!!!
    // [Main] Look at 3 cards from the top of your deck; reveal up to 1 "Navy" type card other than [I'm Gonna Be a Navy Officer!!!] and add it to your hand. Then, trash the rest.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'OP11-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'im-gonna-be-a-navy-officer-main-search-navy',
            text: '[Main] Look at 3 cards from the top of your deck; reveal up to 1 "Navy" type card other than [I\'m Gonna Be a Navy Officer!!!] and add it to your hand. Then, trash the rest.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {
                  trait: ['Navy'],
                  excludeName: ["I'm Gonna Be a Navy Officer!!!"],
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
            id: 'im-gonna-be-a-navy-officer-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP11-099',
                effectId: 'im-gonna-be-a-navy-officer-main-search-navy',
              },
            ],
          },
        },
      ],
    },
    // OP11-100 Otohime
    // [On Play] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-down: Draw 1 card.
    {
      cardId: 'OP11-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'otohime-on-play-shirahoshi-leader-turn-life-face-down-draw-1',
            text: '[On Play] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-down: Draw 1 card.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: true,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP11-101 Capone"Gang"Bege (101)
    // [Blocker]
    // [Once Per Turn] If your "Supernovas" type Character other than [Capone"Gang"Bege] would be removed from the field by your opponent's effect, you may add it to the top of your Life cards face-down instead.
    {
      cardId: 'OP11-101',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op11-101-special',
        },
      ],
    },
    // OP11-102 Camie
    // [Your Turn] [Once Per Turn] This effect can be activated when your opponent activates an Event or [Trigger]. If your opponent has 2 or more Life cards, trash 1 card from the top of each of your and your opponent's Life cards.
    {
      cardId: 'OP11-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'camie-your-turn-on-event-or-trigger-opponent-life-2-trash-life',
            text: "[Your Turn] [Once Per Turn] This effect can be activated when your opponent activates an Event or [Trigger]. If your opponent has 2 or more Life cards, trash 1 card from the top of each of your and your opponent's Life cards.",
            trigger: { type: 'onEventActivated', oncePerTurn: true },
            conditions: [
              { type: 'controllerTurn', value: true },
              {
                type: 'playerHasLifeAtMost',
                player: 'opponent',
                value: 99,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'trash',
              },
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
        },
      ],
    },
    // OP11-103 Long-Jaw Neptunian
    // [Activate: Main] If your Leader is [Shirahoshi], you may rest this Character and turn 1 card from the top of your Life cards face-down: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'OP11-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'long-jaw-neptunian-activate-main-shirahoshi-rest-self-turn-life-ko',
            text: "[Activate: Main] If your Leader is [Shirahoshi], you may rest this Character and turn 1 card from the top of your Life cards face-down: K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
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
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: true,
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
    // OP11-104 Shirley
    // [Blocker]
    // [On Play] You may turn 1 card from the top of your Life cards face-down: Look at 3 cards from the top of your deck; reveal up to 1 "Fish-Man Island" type card and add it to your hand. Then, place the rest at the top or bottom of the deck in any order.
    {
      cardId: 'OP11-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'shirley-on-play-turn-life-face-down-search-fish-man-island',
            text: '[On Play] You may turn 1 card from the top of your Life cards face-down: Look at 3 cards from the top of your deck; reveal up to 1 "Fish-Man Island" type card and add it to your hand. Then, place the rest at the top or bottom of the deck in any order.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: true,
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Fish-Man Island'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
              },
            ],
          },
        },
      ],
    },
    // OP11-105 Charlotte Chiffon
    {
      cardId: 'OP11-105',
      effects: [],
    },
    // OP11-106 Zeus
    // [On Play] You may add 1 card from the top or bottom of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP11-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'zeus-on-play-life-to-hand-ko-cost-5-or-less',
            text: "[On Play] You may add 1 card from the top or bottom of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 5 or less.",
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
    // OP11-107 Topknot Neptunian
    // [Blocker]
    // [Activate: Main] [Once Per Turn] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-down: Set this Character as active at the end of this turn.
    {
      cardId: 'OP11-107',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'topknot-neptunian-activate-main-shirahoshi-turn-life-unrest-end',
            text: '[Activate: Main] [Once Per Turn] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-down: Set this Character as active at the end of this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: true,
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
                      source: 'effectSource',
                      zones: ['characters'],
                      count: { kind: 'exact', value: 1 },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP11-108 Neptune
    // [On Play] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-down: Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP11-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'neptune-on-play-shirahoshi-turn-life-draw-2-trash-1',
            text: '[On Play] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-down: Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'onPlay', optional: true },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: true,
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
    // OP11-109 Pappag
    // [On Play] If you have [Camie], draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP11-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'pappag-on-play-have-camie-draw-2-trash-2',
            text: '[On Play] If you have [Camie], draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], name: ['Camie'] },
                },
              },
            ],
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
    // OP11-110 Fukaboshi
    // If this Character would be K.O.'d, you may rest 1 of your [Fish-Man Island] or your [Shirahoshi] Leader instead.
    // [On Play] You may add 1 card from the top or bottom of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP11-110',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'fukaboshi-would-be-koed-rest-leader-instead',
            text: "If this Character would be K.O.'d, you may rest 1 of your [Fish-Man Island] or your [Shirahoshi] Leader instead.",
            event: 'wouldKoCharacter',
            optional: true,
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: {
                    name: ['Fish-Man Island', 'Shirahoshi'],
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'fukaboshi-on-play-life-to-hand-ko-cost-1-or-less',
            text: "[On Play] You may add 1 card from the top or bottom of your Life cards to your hand: K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
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
    // OP11-111 Mamboshi
    {
      cardId: 'OP11-111',
      effects: [],
    },
    // OP11-112 Megalo
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Opponent's Turn] If your Leader is [Shirahoshi], this Character gains +4000 power.
    {
      cardId: 'OP11-112',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'megalo-opponent-turn-shirahoshi-leader-plus-4000',
            text: "[Opponent's Turn] If your Leader is [Shirahoshi], this Character gains +4000 power.",
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
              },
              power: 4000,
            },
          },
        },
      ],
    },
    // OP11-113 Ryuboshi
    {
      cardId: 'OP11-113',
      effects: [],
    },
    // OP11-114 Gum-Gum Fire-Fist Pistol Red Hawk
    // [Main] You may rest 3 of your DON!! cards: If you and your opponent have a total of 5 or more Life cards, K.O. up to 1 of your opponent's Characters with a base cost of 5 or less.
    // [Counter] Up to 1 of your Leader gains +3000 power during this battle.
    {
      cardId: 'OP11-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'gum-gum-red-hawk-main-rest-3-don-total-life-5-ko-base-cost-5-or-less',
            text: "[Main] You may rest 3 of your DON!! cards: If you and your opponent have a total of 5 or more Life cards, K.O. up to 1 of your opponent's Characters with a base cost of 5 or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 3 },
                },
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], baseCostMax: 5 },
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
            id: 'gum-gum-red-hawk-counter-leader-plus-3000',
            text: '[Counter] Up to 1 of your Leader gains +3000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP11-115 You're Just Not My Type!
    // [Counter] If your Leader is [Shirahoshi], up to 1 of your Leader or Character cards gains +4000 power during this battle.
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    {
      cardId: 'OP11-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'youre-just-not-my-type-counter-shirahoshi-leader-plus-4000',
            text: '[Counter] If your Leader is [Shirahoshi], up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
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
        {
          kind: 'standard',
          effect: {
            id: 'youre-just-not-my-type-trigger-ko-cost-2-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
            trigger: { type: 'trigger' },
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
      ],
    },
    // OP11-116 Merman Combat Ultramarine
    // [Main] Add up to 1 Character with a cost of 6 or less to the top or bottom of the owner's Life cards face-up.
    // [Trigger] Add up to 1 of your opponent's Characters with a cost of 4 or less to the top or bottom of the owner's Life cards face-up.
    {
      cardId: 'OP11-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'merman-combat-ultramarine-main-add-to-life-cost-6-or-less',
            text: "[Main] Add up to 1 Character with a cost of 6 or less to the top or bottom of the owner's Life cards face-up.",
            trigger: { type: 'activateMain' },
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
            id: 'merman-combat-ultramarine-trigger-opponent-add-to-life-cost-4-or-less',
            text: "[Trigger] Add up to 1 of your opponent's Characters with a cost of 4 or less to the top or bottom of the owner's Life cards face-up.",
            trigger: { type: 'trigger' },
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
                destinationZone: 'life',
                faceDown: false,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP11-117 Fish-Man Island
    // [Activate: Main] [Once Per Turn] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-up: Up to 1 of your "Neptunian", "Fish-Man", or "Merfolk" type Characters gains +1000 power during this turn.
    {
      cardId: 'OP11-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'fish-man-island-activate-main-shirahoshi-turn-life-face-up-plus-1000',
            text: '[Activate: Main] [Once Per Turn] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-up: Up to 1 of your "Neptunian", "Fish-Man", or "Merfolk" type Characters gains +1000 power during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Shirahoshi',
              },
            ],
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
                faceDown: false,
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
                    trait: ['Neptunian', 'Fish-Man', 'Merfolk'],
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
    // OP11-118 Monkey.D.Luffy (118)
    // [Rush]
    // [When Attacking] You may trash 1 card from your hand: Return up to 1 Character with a cost of 4 or less to the owner's hand. Then, give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP11-118',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'luffy-118-when-attacking-trash-1-bounce-cost-4-or-less-attach-don',
            text: "[When Attacking] You may trash 1 card from your hand: Return up to 1 Character with a cost of 4 or less to the owner's hand. Then, give up to 1 rested DON!! card to your Leader or 1 of your Characters.",
            trigger: { type: 'whenAttacking', optional: true },
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
                  filter: { cardCategory: ['Character'], costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
              },
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
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
    // OP11-119 Koby (119)
    // [On Play] Up to 1 of your Characters can also attack active Characters during this turn.
    // [When Attacking] You may place 2 cards from your trash at the bottom of your deck in any order: Up to 1 of your Leader or Character cards gains +1000 power until the end of your opponent's next turn.
    {
      cardId: 'OP11-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'koby-119-on-play-character-can-attack-active',
            text: '[On Play] Up to 1 of your Characters can also attack active Characters during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['canAttackActiveCharacters'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'koby-119-when-attacking-place-2-trash-to-bottom-plus-1000',
            text: "[When Attacking] You may place 2 cards from your trash at the bottom of your deck in any order: Up to 1 of your Leader or Character cards gains +1000 power until the end of your opponent's next turn.",
            trigger: { type: 'whenAttacking', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'self',
                destinationZone: 'deck',
                toBottom: true,
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
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
  ],
};
