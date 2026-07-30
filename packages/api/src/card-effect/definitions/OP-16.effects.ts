import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op16EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-16',
  cards: [
    // OP16-001 Portgas.D.Ace (001)
    // [Activate:Main] [Once Per Turn] Up to 1 of your [Monkey.D.Luffy] Characters or up to 1 of your Characters with a type including "Whitebeard Pirates", with 8000 power or more, gains [Rush] during this turn.
    {
      cardId: 'OP16-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-001-activate-main-grant-rush',
            text: '[Activate:Main] [Once Per Turn] Up to 1 of your [Monkey.D.Luffy] Characters or up to 1 of your Characters with a type including "Whitebeard Pirates", with 8000 power or more, gains [Rush] during this turn.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    powerMin: 8000,
                    trait: ['Whitebeard Pirates'],
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
    // OP16-002 Izo
    // [On Play] You may reveal 1 Character card with 8000 power from your hand: Draw 1 card.
    {
      cardId: 'OP16-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-002-on-play-reveal-8000-draw',
            text: '[On Play] You may reveal 1 Character card with 8000 power from your hand: Draw 1 card.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP16-003 Edward.Newgate (Alternate Art)
    // [Your Turn] Your Leader gains [Double Attack] and +2000 power.
    // [On Play] You may reveal 2 Character cards with 8000 power from your hand: Give up to 1 of your opponent's Characters -6000 power during this turn.
    {
      cardId: 'OP16-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-003-your-turn-leader-double-attack-2000',
            text: '[Your Turn] Your Leader gains [Double Attack] and +2000 power.',
            conditions: [{ type: 'controllerTurn', value: true }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader'],
              },
              power: 2000,
              keywords: ['doubleAttack'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-003-on-play-minus-6000',
            text: "[On Play] You may reveal 2 Character cards with 8000 power from your hand: Give up to 1 of your opponent's Characters -6000 power during this turn.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 2,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
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
    // OP16-004 Curiel
    // (no effect text)
    {
      cardId: 'OP16-004',
      effects: [],
    },
    // OP16-005 Thatch
    // If you have a Character with 8000 power or more and a type including "Whitebeard Pirates" give this card in your hand -3 cost.
    // [Blocker]
    {
      cardId: 'OP16-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-005-hand-cost-reduction',
            text: 'If you have a Character with 8000 power or more and a type including "Whitebeard Pirates" give this card in your hand -3 cost.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    powerMin: 8000,
                    trait: ['Whitebeard Pirates'],
                  },
                },
              },
            ],
            costs: [
              {
                type: 'registerNextPlayCostModifier',
                player: 'self',
                filter: {
                  cardCategory: ['Character'],
                },
                sourceZone: 'hand',
                amount: -3,
              },
            ],
            actions: [],
          },
        },
      ],
    },
    // OP16-006 Shanks
    // [On Play] You may rest 2 of your DON!! cards: K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'OP16-006',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-006-on-play-rest-2-don-ko-4000',
            text: "[On Play] You may rest 2 of your DON!! cards: K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'onPlay', optional: true },
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
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { powerMax: 4000 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-007 Jozu
    // [Blocker]
    // [On Play] You may reveal 1 Character card with 8000 power from your hand: Give up to 1 of your opponent's Characters -1000 power during this turn.
    {
      cardId: 'OP16-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-007-on-play-minus-1000',
            text: "[On Play] You may reveal 1 Character card with 8000 power from your hand: Give up to 1 of your opponent's Characters -1000 power during this turn.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
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
    // OP16-008 Squard
    // [On Play] You may trash 1 of your Characters with 10000 base power: K.O. up to 1 of your opponent's Characters with 8000 power or less.
    {
      cardId: 'OP16-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-008-on-play-trash-10000-base-ko-8000',
            text: "[On Play] You may trash 1 of your Characters with 10000 base power: K.O. up to 1 of your opponent's Characters with 8000 power or less.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'ko',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { basePowerMin: 10000, basePowerMax: 10000 },
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
                  filter: { powerMax: 8000 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-009 Speed Jil
    // [On Play] You may trash 1 Character card with 8000 power from your hand: This Character gains [Rush] and +2000 power until the end of your opponent's next End Phase.
    {
      cardId: 'OP16-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-009-on-play-trash-8000-gain-rush-2000',
            text: "[On Play] You may trash 1 Character card with 8000 power from your hand: This Character gains [Rush] and +2000 power until the end of your opponent's next End Phase.",
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
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['rush'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
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
    // OP16-010 Namule
    // [On Play] You may reveal 1 Character card with 8000 power from your hand: K.O. up to 1 of your opponent's Characters with 2000 base power or less.
    {
      cardId: 'OP16-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-010-on-play-reveal-8000-ko-base-2000',
            text: "[On Play] You may reveal 1 Character card with 8000 power from your hand: K.O. up to 1 of your opponent's Characters with 2000 base power or less.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 1,
              },
            ],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { basePowerMax: 2000 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-011 Vista
    // [On Play] You may reveal 1 Character card with 8000 power from your hand: Draw 1 card.
    // [DON!! x1] [When Attacking] K.O. Up to 2 of your opponent's Characters with 2000 base power or less.
    {
      cardId: 'OP16-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-011-on-play-reveal-8000-draw',
            text: '[On Play] You may reveal 1 Character card with 8000 power from your hand: Draw 1 card.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 1,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-011-don-1-when-attacking-ko-base-2000',
            text: "[DON!! x1] [When Attacking] K.O. Up to 2 of your opponent's Characters with 2000 base power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { basePowerMax: 2000 },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-012 Benn.Beckman
    // [Blocker] [On Play] You may rest 1 of your DON!! cards: If your Leader has the {Red-Haired Pirates} type and have 10 DON!! cards on your field, play up to 1 [Shanks] from your hand.
    {
      cardId: 'OP16-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-012-on-play-rest-1-don-play-shanks',
            text: '[On Play] You may rest 1 of your DON!! cards: If your Leader has the {Red-Haired Pirates} type and have 10 DON!! cards on your field, play up to 1 [Shanks] from your hand.',
            trigger: { type: 'onPlay', optional: true },
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Red-Haired Pirates',
              },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 10 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Shanks'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-013 McGuy
    // [On K.O.] K.O. Up to 1 of your opponent's Characters with 8000 base power or less.
    {
      cardId: 'OP16-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-013-on-ko-ko-base-8000',
            text: "[On K.O.] K.O. Up to 1 of your opponent's Characters with 8000 base power or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { basePowerMax: 8000 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-014 Marco
    // If one of your Characters would be removed from the field by your opponent's effect, you may K.O. this character instead.
    // [On K.O.] You may trash 1 Character card with 8000 power from your hand: Play this Character card from your trash.
    {
      cardId: 'OP16-014',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'op16-014-replace-remove-with-self-ko',
            text: "If one of your Characters would be removed from the field by your opponent's effect, you may K.O. this character instead.",
            event: 'wouldKoCharacter',
            optional: true,
            replacement: [
              {
                type: 'ko',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [{ type: 'eventReasonIs', value: 'effect' }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-014-on-ko-trash-8000-play-self',
            text: '[On K.O.] You may trash 1 Character card with 8000 power from your hand: Play this Character card from your trash.',
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
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  source: 'effectSource',
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-015 Monkey.D.Luffy (Alternate Art)
    // If your Leader's card name includes "Ace" and you have 6 or more DON!! cards on your field, give this card in your hand -2 cost.
    // [On Your Opponent's Attack] You may trash 1 Character card with 8000 power from your hand: Your Leader and this Character's base power becomes 7000 during this turn.
    {
      cardId: 'OP16-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-015-hand-cost-reduction',
            text: 'If your Leader\'s card name includes "Ace" and you have 6 or more DON!! cards on your field, give this card in your hand -2 cost.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Ace'] },
                },
              },
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 6 },
            ],
            costs: [
              {
                type: 'registerNextPlayCostModifier',
                player: 'self',
                filter: { cardCategory: ['Character'] },
                sourceZone: 'hand',
                amount: -2,
              },
            ],
            actions: [],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-015-on-opponent-attack-base-power-7000',
            text: "[On Your Opponent's Attack] You may trash 1 Character card with 8000 power from your hand: Your Leader and this Character's base power becomes 7000 during this turn.",
            trigger: { type: 'onAttacked', optional: true },
            conditions: [{ type: 'controllerTurn', value: false }],
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
                  count: { kind: 'exact', value: 1 },
                },
                amount: 2000,
                duration: { type: 'untilEndOfTurn' },
              },
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
    // OP16-016 Ramba
    // (no effect text)
    {
      cardId: 'OP16-016',
      effects: [],
    },
    // OP16-017 LittleOars Jr.
    // If you have no Characters with a type including "Whitebeard Pirates" and a cost of 8 or more give this Character -4000 power.
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP16-017',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-017-minus-4000-no-whitebeard-8-cost',
            text: 'If you have no Characters with a type including "Whitebeard Pirates" and a cost of 8 or more give this Character -4000 power.',
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    trait: ['Whitebeard Pirates'],
                    costMin: 8,
                  },
                },
                value: 0,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
                count: { kind: 'exact', value: 1 },
              },
              power: -4000,
            },
          },
        },
      ],
    },
    // OP16-018 Rockstar
    // [Once Per Turn] If your {Red-Haired Pirates} type Character would be K.O.'d, you may trash 1 Character card with 6000 power or more from your hand instead.
    {
      cardId: 'OP16-018',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'op16-018-replace-red-haired-ko-with-trash',
            text: "[Once Per Turn] If your {Red-Haired Pirates} type Character would be K.O.'d, you may trash 1 Character card with 6000 power or more from your hand instead.",
            event: 'wouldKoCharacter',
            optional: true,
            oncePerTurn: true,
            replacement: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { powerMin: 6000 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Red-Haired Pirates'] },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-019 Let's Show 'Em What We're Made Of!!
    // [Main] Play up to 2 Character cards with a type including "Whitebeard Pirates" and 8000 power from your hand.  [Trigger] Your Leader gains +1000 power during this turn.
    {
      cardId: 'OP16-019',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-019-main-play-whitebeard-8000',
            text: '[Main] Play up to 2 Character cards with a type including "Whitebeard Pirates" and 8000 power from your hand.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    trait: ['Whitebeard Pirates'],
                    powerMin: 8000,
                    powerMax: 8000,
                  },
                  count: { kind: 'upTo', value: 2 },
                },
                destination: 'characters',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-019-trigger-leader-plus-1000',
            text: '[Trigger] Your Leader gains +1000 power during this turn.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader'],
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
    // OP16-020 If You're Coming with Me...Kiss Your Lives Goodbye!!
    // [Main] You may rest 1 of your DON!! cards and reveal 1 Character card with 8000 power from your hand: Draw 1 card.  [Counter] You may trash 1 card from your hand: Up to 1 of your Leader or Character cards gains +3000 power during this battle.
    {
      cardId: 'OP16-020',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-020-main-rest-1-don-reveal-8000-draw',
            text: '[Main] You may rest 1 of your DON!! cards and reveal 1 Character card with 8000 power from your hand: Draw 1 card.',
            trigger: { type: 'activateMain', optional: true },
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
                type: 'reveal',
                player: 'self',
                zone: 'hand',
                amount: 1,
              },
              { type: 'draw', player: 'self', amount: 1 },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-020-counter-trash-1-plus-3000',
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
      ],
    },
    // OP16-021 Moby Dick (Alternate Art)
    // [On Play] If your Leader has the {Whitebeard Pirates} type, look at 3 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Activate:Main] You may trash this Stage: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP16-021',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-021-on-play-search-whitebeard-leader',
            text: '[On Play] If your Leader has the {Whitebeard Pirates} type, look at 3 cards from the top of your deck and add up to 1 card to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {},
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
            id: 'op16-021-activate-main-trash-stage-give-don',
            text: '[Activate:Main] You may trash this Stage: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
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
    // OP16-022 Monkey.D.Luffy (022)
    // [Activate:Main] [Once Per Turn] If the only Characters on your field are {Impel Down} type Characters, set up to 2 of your DON!! cards as active.
    {
      cardId: 'OP16-022',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-022-activate-main-restand-don',
            text: '[Activate:Main] [Once Per Turn] If the only Characters on your field are {Impel Down} type Characters, set up to 2 of your DON!! cards as active.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [
              {
                type: 'playerHasOnlyCharactersWithTrait',
                player: 'self',
                trait: 'Impel Down',
              },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 2,
                rested: false,
              },
            ],
          },
        },
      ],
    },
    // OP16-023 Arlong
    // (no effect text)
    {
      cardId: 'OP16-023',
      effects: [],
    },
    // OP16-024 Inazuma
    // When this Character is K.O.'d by your opponent's effect, rest up to 1 of your opponent's Characters.
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP16-024',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-024-on-ko-by-opponent-effect-rest',
            text: "When this Character is K.O.'d by your opponent's effect, rest up to 1 of your opponent's Characters.",
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'eventPlayerIs', player: 'opponent' },
              { type: 'eventReasonIs', value: 'effect' },
            ],
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-025 Bunkov
    // [When Attacking] If you have [Antlerkov], play up to 1 Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP16-025',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-025-when-attacking-if-antlerkov-play-2-cost',
            text: '[When Attacking] If you have [Antlerkov], play up to 1 Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Antlerkov'] },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-026 Emporio.Ivankov (026) (Alternate Art)
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Impel Down} type card, add it to your hand and place the rest at the bottom of your deck in any order. Then, play up to 1 Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP16-026',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-026-on-play-search-impel-down-play-2-cost',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Impel Down} type card, add it to your hand and place the rest at the bottom of your deck in any order. Then, play up to 1 Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Impel Down'] },
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
                  filter: { costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-027 Jinbe (027)
    // [DON!! X1] This Character gains +2000 power.
    {
      cardId: 'OP16-027',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-027-don-1-plus-2000',
            text: '[DON!! X1] This Character gains +2000 power.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
                count: { kind: 'exact', value: 1 },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // OP16-028 Smoker
    // (no effect text)
    {
      cardId: 'OP16-028',
      effects: [],
    },
    // OP16-029 Antlerkov
    // [When Attacking] If you have [Bunkov], play up to 1 Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP16-029',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-029-when-attacking-if-bunkov-play-2-cost',
            text: '[When Attacking] If you have [Bunkov], play up to 1 Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Bunkov'] },
                },
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-030 Trafalgar Law (030)
    // [On Play] Up to 1 of your opponent's rested Characters will not become active in your opponent's next Refresh Phase.
    // [End of Your Turn] Set all of your green Characters with a cost of 5 or less as active.
    {
      cardId: 'OP16-030',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-030-on-play-skip-refresh-rested',
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
            id: 'op16-030-end-of-turn-restand-green-5-cost',
            text: '[End of Your Turn] Set all of your green Characters with a cost of 5 or less as active.',
            trigger: { type: 'onTurnEnd' },
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    color: ['Green'],
                    costMax: 5,
                  },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-031 Buggy (031)
    // [On K.O.] Play up to 1 [Prisoner of Impel Down] card from your hand.
    {
      cardId: 'OP16-031',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-031-on-ko-play-prisoner',
            text: '[On K.O.] Play up to 1 [Prisoner of Impel Down] card from your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Prisoner of Impel Down'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-032 Boa Hancock (Alternate Art)
    // [Unblockable] (This card cannot be blocked.)
    // [On Play] Up to 1 of your opponent's Characters other than [Monkey.D.Luffy] cannot be rested until the end of your opponent's next End Phase.
    {
      cardId: 'OP16-032',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-032-cannot-be-rested',
        },
      ],
    },
    // OP16-033 Morley
    // If this Character would be K.O'd, you may rest 2 of your cards instead.
    // [Unblockable] (This card cannot be blocked.)
    {
      cardId: 'OP16-033',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'op16-033-replace-ko-with-rest-2',
            text: "If this Character would be K.O'd, you may rest 2 of your cards instead.",
            event: 'wouldKoCharacter',
            optional: true,
            replacement: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters', 'leader'],
                  count: { kind: 'exact', value: 2 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-034 Monkey.D.Luffy (034)
    // [DON!! x1] [Your Turn] This Character gains +1000 power for each of your Characters with a different card name.
    // [On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Impel Down} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP16-034',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-034-don-1-your-turn-power-per-different-name',
            text: '[DON!! x1] [Your Turn] This Character gains +1000 power for each of your Characters with a different card name.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
                count: { kind: 'exact', value: 1 },
              },
              powerPerCount: {
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  distinctBy: 'name',
                },
                amount: 1000,
              },
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-034-on-play-search-impel-down',
            text: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Impel Down} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: { trait: ['Impel Down'] },
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
    // OP16-035 Roronoa Zoro (035)
    // [On Play] Rest up to 1 of your opponent's cards. Then, you may trash 1 card from your hand. If you do, give up to 3 rested DON!! cards to your Leader.
    {
      cardId: 'OP16-035',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-035-on-play-rest-opponent-then-may-trash-give-don',
            text: "[On Play] Rest up to 1 of your opponent's cards. Then, you may trash 1 card from your hand. If you do, give up to 3 rested DON!! cards to your Leader.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters', 'leader'],
                  count: { kind: 'upTo', value: 1 },
                },
              },
              {
                type: 'chooseActionBranch',
                message:
                  'You may trash 1 card from your hand to give up to 3 rested DON!! to your Leader.',
                choices: [
                  {
                    id: 'trash-and-give-don',
                    label: 'Trash 1 card and give DON!!',
                    actions: [
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
                        selector: {
                          player: 'self',
                          zones: ['leader'],
                          count: { kind: 'upTo', value: 3 },
                        },
                        player: 'self',
                        amount: 3,
                        rested: true,
                      },
                    ],
                  },
                  {
                    id: 'skip',
                    label: 'Skip',
                    actions: [],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    // OP16-036 Mr.2.Bon.Kurei(Bentham) (036)
    // [On Play] Rest up to 1 of your opponent's Characters with a cost of 4 or less.
    // [When Attacking] This Character's base power becomes the same as your opponent's Leader during this turn.
    {
      cardId: 'OP16-036',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-036-on-play-rest-cost-4-or-less',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-036-when-attacking-copy-leader-power',
            text: "[When Attacking] This Character's base power becomes the same as your opponent's Leader during this turn.",
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
                amount: 0,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP16-037 Mr.3(Galdino) (037)
    // [On Play] If your Leader has the {Impel Down} type, rest up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP16-037',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-037-on-play-rest-impel-down-leader',
            text: "[On Play] If your Leader has the {Impel Down} type, rest up to 1 of your opponent's Characters with a cost of 5 or less.",
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
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-038 Let's Go!! To the Navy Headquarters..
    // [Main] You may rest 6 of your DON!! cards: If you have 5 {Impel Down} type Characters with different card names, set your Leader and all of your Characters as active.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP16-038',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-038-main-rest-6-don-restand-all',
            text: '[Main] You may rest 6 of your DON!! cards: If you have 5 {Impel Down} type Characters with different card names, set your Leader and all of your Characters as active.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 6 },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Impel Down'] },
                  distinctBy: 'name',
                },
                value: 5,
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-038-counter-leader-plus-3000',
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
    // OP16-039 Gum-Gum Twin Jet Pistol
    // [Main] Up to 1 of your [Monkey.D.Luffy] cards gains [Double Attack] during this turn. Then, if your Leader has the {Impel Down} type, rest up to 2 of your opponent's Characters with a cost or 3 or less.
    // [Trigger] Rest your opponent's Leader.
    {
      cardId: 'OP16-039',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-039-main-double-attack-then-rest',
            text: "[Main] Up to 1 of your [Monkey.D.Luffy] cards gains [Double Attack] during this turn. Then, if your Leader has the {Impel Down} type, rest up to 2 of your opponent's Characters with a cost or 3 or less.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
              },
            ],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['doubleAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 3 },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-039-trigger-rest-opponent-leader',
            text: "[Trigger] Rest your opponent's Leader.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-040 Gum-Gum Hammer Rifle
    // [Main] If you have [Monkey.D.Luffy] and [Mr.3(Galdino)], up to 1 of your opponent's rested Characters with a cost of 6 or less will not become active in your opponent's next Refresh Phase.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP16-040',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-040-main-skip-refresh-rested',
            text: "[Main] If you have [Monkey.D.Luffy] and [Mr.3(Galdino)], up to 1 of your opponent's rested Characters with a cost of 6 or less will not become active in your opponent's next Refresh Phase.",
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Monkey.D.Luffy'] },
                },
              },
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Mr.3(Galdino)'] },
                },
              },
            ],
            actions: [
              {
                type: 'skipNextRefreshPhases',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    rested: true,
                    costMax: 6,
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
            id: 'op16-040-counter-leader-plus-3000',
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
    // OP16-041 Buggy (041)
    // [DON!! X1] [Once Per Turn] This effect can be activated when your {Impel Down} type Character card is removed from the field. Play up to 1 [Prisoner of Impel Down] card from your hand.
    {
      cardId: 'OP16-041',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-041-impel-down-removed-play-prisoner',
        },
      ],
    },
    // OP16-042 Prisoner of Impel Down
    // Under the rules of this game, you may have any number of this card in your deck.
    {
      cardId: 'OP16-042',
      effects: [],
    },
    // OP16-043 Usopp
    // [Blocker]
    // [On K.O.] Return up to 1 of tour opponent's Characters with a cost of 5 or less to the owner's hand.
    {
      cardId: 'OP16-043',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-043-on-ko-return-cost-5-or-less',
            text: "[On K.O.] Return up to 1 of your opponent's Characters with a cost of 5 or less to the owner's hand.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 5 },
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
    // OP16-044 Emporio.Ivankov (044)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP16-044',
      effects: [],
    },
    // OP16-045 Crocodile
    // [Blocker]
    // [On Play] You may return 1 of your Characters with a cost of 2 or more to the owner's hand: Play up to 1 {Impel Down} type Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP16-045',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-045-on-play-return-character-play-impel-down',
            text: "[On Play] You may return 1 of your Characters with a cost of 2 or more to the owner's hand: Play up to 1 {Impel Down} type Character card with a cost of 2 or less from your hand.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { costMin: 2 },
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
                  filter: {
                    trait: ['Impel Down'],
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
    // OP16-046 Jinbe (046)
    // (no effect text)
    {
      cardId: 'OP16-046',
      effects: [],
    },
    // OP16-047 Donquixote Doflamingo (047)
    // [Activate:Main] You may rest this Character: If your opponent has 8 or more cards in their hand, they place 2 cards from their hand at the bottom of their deck in any order.
    {
      cardId: 'OP16-047',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-047-activate-main-rest-move-opponent-hand-to-bottom',
            text: '[Activate:Main] You may rest this Character: If your opponent has 8 or more cards in their hand, they place 2 cards from their hand at the bottom of their deck in any order.',
            trigger: { type: 'activateMain', optional: true },
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
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                },
                value: 8,
              },
            ],
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['hand'],
                  count: { kind: 'exact', value: 2 },
                },
                destinationPlayer: 'opponent',
                destinationZone: 'deck',
                toBottom: true,
                chooseDestinationPosition: true,
              },
            ],
          },
        },
      ],
    },
    // OP16-048 Buggy (048) (Alternate Art)
    // [On Play] If your Leader has the {Impel Down} type, draw 1 card and play up to 1 [Prisoner of Impel Down] card from your hand.
    // [Once Per Turn] This effect can be activated when your opponent attacks. Up to 1 of your [Prisoner of Impel Down] cards gains [Blocker] during this turn.
    {
      cardId: 'OP16-048',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-048-on-play-draw-play-prisoner',
            text: '[On Play] If your Leader has the {Impel Down} type, draw 1 card and play up to 1 [Prisoner of Impel Down] card from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Impel Down',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Prisoner of Impel Down'] },
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
            id: 'op16-048-on-opponent-attack-grant-blocker',
            text: '[Once Per Turn] This effect can be activated when your opponent attacks. Up to 1 of your [Prisoner of Impel Down] cards gains [Blocker] during this turn.',
            trigger: { type: 'onAttacked', oncePerTurn: true },
            conditions: [{ type: 'controllerTurn', value: false }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Prisoner of Impel Down'] },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP16-049 Portgas.D.Ace (049)
    // [Activate:Main] You may rest this Character: Draw 1 card.
    {
      cardId: 'OP16-049',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-049-activate-main-rest-draw',
            text: '[Activate:Main] You may rest this Character: Draw 1 card.',
            trigger: { type: 'activateMain', optional: true },
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
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP16-050 Miss Olive
    // [Blocker]
    // [On Play] You may return 1 of your Characters with a cost of 2 or more to the owner's hand: Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP16-050',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-050-on-play-return-character-draw-2-trash-1',
            text: "[On Play] You may return 1 of your Characters with a cost of 2 or more to the owner's hand: Draw 2 cards and trash 1 card from your hand.",
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { costMin: 2 },
                  count: { kind: 'exact', value: 1 },
                },
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'hand',
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
    // OP16-051 Mohji & Cabaji
    // [On Play] If you have 5 or less cards in your hand, draw 2 cards.
    {
      cardId: 'OP16-051',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-051-on-play-draw-if-5-or-less-hand',
            text: '[On Play] If you have 5 or less cards in your hand, draw 2 cards.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                },
                value: 5,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP16-052 Monkey.D.Luffy (052)
    // [Activate:Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP16-052',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-052-activate-main-give-rested-don',
            text: '[Activate:Main] [Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
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
    // OP16-053 Roronoa Zoro (053)
    // [When Attacking] If you have 6 or less cards in your hand, draw 1 card.
    {
      cardId: 'OP16-053',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-053-when-attacking-draw-if-6-or-less-hand',
            text: '[When Attacking] If you have 6 or less cards in your hand, draw 1 card.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'targetCountAtMost',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                },
                value: 6,
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP16-054 Mr.1(Daz.Bonez)
    // [DON!! X1] [Your Turn] If you have 5 or more cards in your hand, this Character gains +3000 power.
    // [On Play] Draw 1 card.
    {
      cardId: 'OP16-054',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-054-don-1-your-turn-plus-3000-if-5-hand',
            text: '[DON!! X1] [Your Turn] If you have 5 or more cards in your hand, this Character gains +3000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                },
                value: 5,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
                count: { kind: 'exact', value: 1 },
              },
              power: 3000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-054-on-play-draw',
            text: '[On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
      ],
    },
    // OP16-055 Mr.2.Bon.Kurei(Bentham) (055)
    // [On Play] Draw 1 card.
    // [DON!! x1] [When Attacking] This Character's base power becomes the same as your opponent's Leader's power during this turn.
    {
      cardId: 'OP16-055',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-055-on-play-draw',
            text: '[On Play] Draw 1 card.',
            trigger: { type: 'onPlay' },
            actions: [{ type: 'draw', player: 'self', amount: 1 }],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-055-don-1-when-attacking-copy-leader-power',
            text: "[DON!! x1] [When Attacking] This Character's base power becomes the same as your opponent's Leader's power during this turn.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                amount: 0,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP16-056 Mr.3(Galdino) (056)
    // [Activate: Main] You may trash this Character: Draw 2 cards, and up to 1 of your opponent's Characters with a cost of 9 or less cannot attack until the end of your opponent's next End Phase.
    {
      cardId: 'OP16-056',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-056-activate-main-trash-draw-2-restrict-attack',
            text: "[Activate: Main] You may trash this Character: Draw 2 cards, and up to 1 of your opponent's Characters with a cost of 9 or less cannot attack until the end of your opponent's next End Phase.",
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
              { type: 'draw', player: 'self', amount: 2 },
              {
                type: 'restrictAttack',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 9 },
                  count: { kind: 'upTo', value: 1 },
                },
                turns: 1,
              },
            ],
          },
        },
      ],
    },
    // OP16-057 Captain Buggy's Our Savior!!
    // [Counter] If you have 2 or more [Prisoner of Impel Down] cards, up to 1 of your Leader or Character cards gains +4000 power during this battle.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP16-057',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-057-counter-plus-4000-if-2-prisoner',
            text: '[Counter] If you have 2 or more [Prisoner of Impel Down] cards, up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Prisoner of Impel Down'] },
                },
                value: 2,
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
            id: 'op16-057-trigger-draw-2-trash-1',
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
    // OP16-058 The Prisoners Are Rioting!!
    // [Main] If you have 10 DON!! cards on your field, all of your [Prisoner of Impel Down] cards' base power becomes 7000 during this turn.
    // [Counter] Up to 1 of your [Buggy] gains +4000 power during this battle.
    {
      cardId: 'OP16-058',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-058-main-base-power-7000-prisoner',
            text: "[Main] If you have 10 DON!! cards on your field, all of your [Prisoner of Impel Down] cards' base power becomes 7000 during this turn.",
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 10 },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Prisoner of Impel Down'] },
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
            id: 'op16-058-counter-buggy-plus-4000',
            text: '[Counter] Up to 1 of your [Buggy] gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { name: ['Buggy'] },
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
    // OP16-059 We'll Change This Mission from Sneaky to Flashy!
    // [Main] You may rest 7 of your DON!! cards: Look at 5 cards from the top of your deck; play up to 2 {Impel Down} type Character cards with 6000 power or less. Then, place the rest at the bottom of your deck in any order.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP16-059',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-059-main-rest-7-don-search-play-impel-down',
            text: '[Main] You may rest 7 of your DON!! cards: Look at 5 cards from the top of your deck; play up to 2 {Impel Down} type Character cards with 6000 power or less. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 7 },
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
                  trait: ['Impel Down'],
                  powerMax: 6000,
                },
                count: { kind: 'upTo', value: 2 },
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
            id: 'op16-059-counter-leader-plus-3000',
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
    // OP16-060 Sengoku (060)
    // [Activate: Main] You may return 8 of your active DON!! cards to your DON!! deck: Play up to 3 {Admiral} type Character cards with different card names from your hand.
    {
      cardId: 'OP16-060',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-060-activate-main-return-8-don-play-admirals',
            text: '[Activate: Main] You may return 8 of your active DON!! cards to your DON!! deck: Play up to 3 {Admiral} type Character cards with different card names from your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 8,
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Admiral'] },
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
    // OP16-061 Older Brother Marine
    // (no effect text)
    {
      cardId: 'OP16-061',
      effects: [],
    },
    // OP16-062 Younger Brother Marine
    // (no effect text)
    {
      cardId: 'OP16-062',
      effects: [],
    },
    // OP16-063 Kuzan
    // [On Play] Add up to 2 DON!! cards from your DON!! deck and rest them.
    // [Activate: Main] [Once Per Turn] DON!! 1: Up to 1 of your opponent's Characters cannot activate [Blocker] during this turn.
    {
      cardId: 'OP16-063',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-063-on-play-add-2-don-rested',
            text: '[On Play] Add up to 2 DON!! cards from your DON!! deck and rest them.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 2,
                rested: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-063-activate-main-don-1-blocker-lock',
            text: "[Activate: Main] [Once Per Turn] DON!! 1: Up to 1 of your opponent's Characters cannot activate [Blocker] during this turn.",
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
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP16-064 Koby
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Navy} type card other than [Koby] and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP16-064',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-064-on-play-search-navy-except-koby',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Navy} type card other than [Koby] and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: {
                  trait: ['Navy'],
                  excludeName: ['Koby'],
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
    // OP16-065 Sakazuki (Alternate Art)
    // [On Play] DON!! -1: Give up to 1 of your opponent's Characters -6000 power until the end of your opponent's next End Phase.
    // [Activate:Main] [Once Per Turn] You may rest 1 of your DON!! cards: If your Leader has the {Navy} type, add up to 2 DON!! cards from your DON!! deck and set them as active.
    {
      cardId: 'OP16-065',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-065-on-play-remove-1-don-minus-6000',
            text: "[On Play] DON!! -1: Give up to 1 of your opponent's Characters -6000 power until the end of your opponent's next End Phase.",
            trigger: { type: 'onPlay' },
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
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -6000,
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-065-activate-main-rest-1-don-add-2-active',
            text: '[Activate:Main] [Once Per Turn] You may rest 1 of your DON!! cards: If your Leader has the {Navy} type, add up to 2 DON!! cards from your DON!! deck and set them as active.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
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
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 2,
                rested: false,
              },
            ],
          },
        },
      ],
    },
    // OP16-066 Sengoku (066)
    // [On Play] If your Leader has the {Navy} type, add up to 2 DON!! cards from your DON!! deck and rest them. Then, draw 2 cards and trash 2 cards from your hand.
    {
      cardId: 'OP16-066',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-066-on-play-add-2-don-rested-draw-2-trash-2',
            text: '[On Play] If your Leader has the {Navy} type, add up to 2 DON!! cards from your DON!! deck and rest them. Then, draw 2 cards and trash 2 cards from your hand.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 2,
                rested: true,
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
    // OP16-067 Tsuru
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Navy} type card, add it to your hand and place the rest at the bottom of your deck in any order. Then, trash 1 card from your hand.
    {
      cardId: 'OP16-067',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-067-on-play-search-navy-trash-1',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Navy} type card, add it to your hand and place the rest at the bottom of your deck in any order. Then, trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Navy'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
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
    // OP16-068 Trafalgar Law (068)
    // [On Play] Add up to 1 DON!! card from your DON!! deck and set it as active.
    // [When Attacking] If your Leader has the {Donquixote Pirates} type, this Character gains +3000 power during this turn.
    {
      cardId: 'OP16-068',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-068-on-play-add-1-don-active',
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
          kind: 'standard',
          effect: {
            id: 'op16-068-when-attacking-plus-3000-if-donquixote',
            text: '[When Attacking] If your Leader has the {Donquixote Pirates} type, this Character gains +3000 power during this turn.',
            trigger: { type: 'whenAttacking' },
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
                  source: 'effectSource',
                  zones: ['characters'],
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
    // OP16-069 Donquixote Doflamingo (069)
    // [On Play]/[When Attacking] Add up to 1 DON!! card from your DON!! deck and set it as active.
    {
      cardId: 'OP16-069',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-069-on-play-add-1-don-active',
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
          kind: 'standard',
          effect: {
            id: 'op16-069-when-attacking-add-1-don-active',
            text: '[When Attacking] Add up to 1 DON!! card from your DON!! deck and set it as active.',
            trigger: { type: 'whenAttacking' },
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
    // OP16-070 Donquixote Rosinante
    // [Blocker]
    // [On Play] You may rest 2 of your DON!! cards: If your Leader has the {Navy} type, add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP16-070',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-070-on-play-rest-2-don-add-1-rested',
            text: '[On Play] You may rest 2 of your DON!! cards: If your Leader has the {Navy} type, add up to 1 DON!! card from your DON!! deck and rest it.',
            trigger: { type: 'onPlay', optional: true },
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
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
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
    // OP16-071 Benevolent King of the Waves
    // [On Play] You may trash 1 card from your hand: Add up to 1 DON!! card from your DON!! deck and rest it.
    // [On K.O.] Add up to 1 DON!! card from your DON!! deck and rest it.
    {
      cardId: 'OP16-071',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-071-on-play-trash-1-add-1-don-rested',
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
            id: 'op16-071-on-ko-add-1-don-rested',
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
    // OP16-072 Hannyabal
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Impel Down} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'OP16-072',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-072-on-play-search-impel-down',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Impel Down} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Impel Down'] },
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
    // OP16-073 Borsalino
    // [On Play] Add up to 1 DON!! card from your DON!! deck and set it as active, and add up to 1 additional DON!! card and rest it.
    // [End of Your Turn] DON!! -2: Set this Character as active. Then, this Character gains [Blocker] until the end of your opponent's next End Phase.
    {
      cardId: 'OP16-073',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-073-on-play-add-2-don-one-active-one-rested',
            text: '[On Play] Add up to 1 DON!! card from your DON!! deck and set it as active, and add up to 1 additional DON!! card and rest it.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
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
        {
          kind: 'standard',
          effect: {
            id: 'op16-073-end-of-turn-remove-2-don-restand-grant-blocker',
            text: "[End of Your Turn] DON!! -2: Set this Character as active. Then, this Character gains [Blocker] until the end of your opponent's next End Phase.",
            trigger: { type: 'onTurnEnd' },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 2,
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
              },
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  source: 'effectSource',
                  zones: ['characters'],
                  count: { kind: 'exact', value: 1 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilStartOfYourNextTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP16-074 Magellan
    // [On Play] If your Leader has the {Impel Down} type, your opponent returns 1 DON!! card from their field to their DON!! deck.
    // [On K.O.] Your opponent returns 4 DON!! cards from their field to their DON!! deck.
    {
      cardId: 'OP16-074',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-074-on-play-opponent-return-1-don',
            text: '[On Play] If your Leader has the {Impel Down} type, your opponent returns 1 DON!! card from their field to their DON!! deck.',
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
                type: 'removeDon',
                player: 'opponent',
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-074-on-ko-opponent-return-4-don',
            text: '[On K.O.] Your opponent returns 4 DON!! cards from their field to their DON!! deck.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'removeDon',
                player: 'opponent',
                amount: 4,
              },
            ],
          },
        },
      ],
    },
    // OP16-075 Monkey.D.Garp
    // [On Play] If your Leader has the {Navy} type, add up to 1 DON!! card from your DON!! deck and set it as active, and add up to 1 additional DON!! card and rest it.
    {
      cardId: 'OP16-075',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-075-on-play-add-2-don-one-active-one-rested',
            text: '[On Play] If your Leader has the {Navy} type, add up to 1 DON!! card from your DON!! deck and set it as active, and add up to 1 additional DON!! card and rest it.',
            trigger: { type: 'onPlay' },
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'Navy' },
            ],
            actions: [
              {
                type: 'addDon',
                player: 'self',
                amount: 1,
                rested: false,
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
    // OP16-076 The Three Admirals!!
    // [Main] You may rest 3 of your DON!! cards: Up to 3 of your {Admiral} type Characters gain +2000 power during this turn.
    // [Counter] If you have an {Admiral} type Character, up to 1 of your Leader or Character cards gains +4000 power during this battle.
    {
      cardId: 'OP16-076',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-076-main-rest-3-don-admiral-plus-2000',
            text: '[Main] You may rest 3 of your DON!! cards: Up to 3 of your {Admiral} type Characters gain +2000 power during this turn.',
            trigger: { type: 'activateMain', optional: true },
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
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Admiral'] },
                  count: { kind: 'upTo', value: 3 },
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
            id: 'op16-076-counter-plus-4000-if-admiral',
            text: '[Counter] If you have an {Admiral} type Character, up to 1 of your Leader or Character cards gains +4000 power during this battle.',
            trigger: { type: 'activateCounter' },
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { trait: ['Admiral'] },
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
                amount: 4000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // OP16-077 "Buddha" Sengoku
    // [Main] Look at 5 cards from the top of your deck; reveal up to 2 {Navy} type cards, add them to your hand and place the rest at the bottom of your deck in any order. Then, trash 1 card from your hand.
    {
      cardId: 'OP16-077',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-077-main-search-navy-up-to-2-trash-1',
            text: '[Main] Look at 5 cards from the top of your deck; reveal up to 2 {Navy} type cards, add them to your hand and place the rest at the bottom of your deck in any order. Then, trash 1 card from your hand.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Navy'] },
                count: { kind: 'upTo', value: 2 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
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
    // OP16-078 Marineford
    // [On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Navy} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Activate: Main] DON!! 1, You may rest this Stage: Draw 1 card and trash 1 card from your hand.
    {
      cardId: 'OP16-078',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-078-on-play-search-navy',
            text: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Navy} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 5,
                filter: { trait: ['Navy'] },
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
            id: 'op16-078-activate-main-don-1-rest-stage-draw-1-trash-1',
            text: '[Activate: Main] DON!! 1, You may rest this Stage: Draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'removeDon',
                player: 'self',
                amount: 1,
              },
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
    // OP16-079 Yamato (079)
    // When a {Land of Wano} type Character card is played from your trash, that Character gains [Rush] during this turn.
    // (This card can attack on the turn in which it is played.)
    {
      cardId: 'OP16-079',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-079-land-of-wano-from-trash-rush',
        },
      ],
    },
    // OP16-080 Marshall.D.Teach (080)
    // [Opponent's Turn] All of your Characters gain +1 cost. [On your Opponent's Attack] [Once Per Turn] You may trash 1 card with a [Trigger] from your hand: Change the target of that attack to this Leader or to one of your {Blackbeard Pirates} type Character cards.
    {
      cardId: 'OP16-080',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-080-opponent-turn-characters-plus-1-cost',
            text: "[Opponent's Turn] All of your Characters gain +1 cost.",
            conditions: [{ type: 'controllerTurn', value: false }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
              },
              cost: 1,
            },
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-080-attack-redirect',
        },
      ],
    },
    // OP16-081 Otama
    // [Activate: Main] You may rest this Character: If you have a Character with a cost of 8 or more, give up to 1 of your opponent's Characters 2000 power during this turn.
    {
      cardId: 'OP16-081',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-081-activate-main-rest-minus-2000-if-cost-8',
            text: "[Activate: Main] You may rest this Character: If you have a Character with a cost of 8 or more, give up to 1 of your opponent's Characters 2000 power during this turn.",
            trigger: { type: 'activateMain', optional: true },
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
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { costMin: 8 },
                },
              },
            ],
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
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
    // OP16-082 Kin'emon (Alternate Art)
    // This Character gains +3 cost.
    // [On Play] If your Leader has the {Land of Wano} type, look at 5 cards from the top of your deck; reveal up to 1 {Land of Wano} type card and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP16-082',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-082-plus-3-cost',
            text: 'This Character gains +3 cost.',
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
                count: { kind: 'exact', value: 1 },
              },
              cost: 3,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-082-on-play-search-land-of-wano-trash-rest',
            text: '[On Play] If your Leader has the {Land of Wano} type, look at 5 cards from the top of your deck; reveal up to 1 {Land of Wano} type card and add it to your hand. Then, trash the rest.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Land of Wano',
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
                restDestination: 'trash',
              },
            ],
          },
        },
      ],
    },
    // OP16-083 Kouzuki Oden
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [On Play] You may trash 1 Character card with a cost of 8 or more from your hand: Draw 2 cards.
    {
      cardId: 'OP16-083',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-083-on-play-trash-cost-8-draw-2',
            text: '[On Play] You may trash 1 Character card with a cost of 8 or more from your hand: Draw 2 cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { costMin: 8 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP16-084 Kouzuki Momonosuke (084)
    // [Activate: Main] You may trash this Character with a cost of 20 or more: If you have 9 or more DON!! cards on your field, play up to 1 [Kouzuki Momonosuke] with a cost of 9 from your trash.
    {
      cardId: 'OP16-084',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-084-trash-self-cost-20-play-momo',
        },
      ],
    },
    // OP16-085 Kouzuki Momonosuke (085) (Alternate Art)
    // [Blocker]
    // [On Play] Play up to 1 {Land of Wano} type Character card with a cost of 6 or less other than [Kouzuki Momonosuke] from your trash.
    {
      cardId: 'OP16-085',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-085-on-play-play-land-of-wano-from-trash',
            text: '[On Play] Play up to 1 {Land of Wano} type Character card with a cost of 6 or less other than [Kouzuki Momonosuke] from your trash.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    trait: ['Land of Wano'],
                    costMax: 6,
                    excludeName: ['Kouzuki Momonosuke'],
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
    // OP16-086 Sanji
    // (no effect text)
    {
      cardId: 'OP16-086',
      effects: [],
    },
    // OP16-087 Shinobu
    // [On Play] You may trash this Character: If your Leader has the {Land of Wano} type, draw 1 card and up to 1 of your [Kouzuki Momonosuke] gains +20 cost during this turn.
    {
      cardId: 'OP16-087',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-087-on-play-trash-self-draw-modify-cost',
            text: '[On Play] You may trash this Character: If your Leader has the {Land of Wano} type, draw 1 card and up to 1 of your [Kouzuki Momonosuke] gains +20 cost during this turn.',
            trigger: { type: 'onPlay', optional: true },
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
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Land of Wano',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'modifyCost',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Kouzuki Momonosuke'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 20,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP16-088 Shimotsuki Ushimaru
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'OP16-088',
      effects: [],
    },
    // OP16-089 Dracule Mihawk
    // [Rush: Character] (This card can attack Characters on the turn in which it is played.)
    // [On Play] Draw 2 cards and trash 2 cards from your hand. Then, give up to 1 of your opponent's Characters 4 cost during this turn.
    {
      cardId: 'OP16-089',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-089-on-play-draw-2-trash-2-plus-4-cost',
            text: "[On Play] Draw 2 cards and trash 2 cards from your hand. Then, give up to 1 of your opponent's Characters 4 cost during this turn.",
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
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 4,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // OP16-090 Tony Tony.Chopper
    // [On Play] Draw 2 cards and trash 2 cards from your hand. Then, K.O. up to 1 of your opponent's Characters with a cost of 1 or less.
    {
      cardId: 'OP16-090',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-090-on-play-draw-2-trash-2-ko-cost-1',
            text: "[On Play] Draw 2 cards and trash 2 cards from your hand. Then, K.O. up to 1 of your opponent's Characters with a cost of 1 or less.",
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 1 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // OP16-091 Nami
    // [On Play] If your Leader has the {Land of Wano} type, look at 4 cards from the top of your deck; reveal up to 1 {Land of Wano} type card other than [Nami] and add it to your hand. Then, trash the rest.
    {
      cardId: 'OP16-091',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-091-on-play-search-land-of-wano-except-nami',
            text: '[On Play] If your Leader has the {Land of Wano} type, look at 4 cards from the top of your deck; reveal up to 1 {Land of Wano} type card other than [Nami] and add it to your hand. Then, trash the rest.',
            trigger: { type: 'onPlay' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Land of Wano',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: {
                  trait: ['Land of Wano'],
                  excludeName: ['Nami'],
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
    // OP16-092 Nico Robin
    // [On Play] You may trash 1 Character card with a cost of 8 or more from your hand: Draw 2 cards.
    {
      cardId: 'OP16-092',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-092-on-play-trash-cost-8-draw-2',
            text: '[On Play] You may trash 1 Character card with a cost of 8 or more from your hand: Draw 2 cards.',
            trigger: { type: 'onPlay', optional: true },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { costMin: 8 },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP16-093 Bartholomew Kuma (093)
    // [On Play] Draw 2 cards and trash 2 cards from your hand. Then, give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'OP16-093',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-093-on-play-draw-2-trash-2-give-don',
            text: '[On Play] Draw 2 cards and trash 2 cards from your hand. Then, give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
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
    // OP16-094 Portgas.D.Ace (094)
    // [On K.O.] Your opponent trashes 2 cards from their hand.
    // [Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your {Land of Wano} type Leader or Character cards.
    {
      cardId: 'OP16-094',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-094-on-ko-opponent-trash-2',
            text: '[On K.O.] Your opponent trashes 2 cards from their hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'opponent',
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
            id: 'op16-094-activate-main-give-don-land-of-wano',
            text: '[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your {Land of Wano} type Leader or Character cards.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Land of Wano'] },
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
    // OP16-095 Monkey.D.Luffy (095)
    // [On Play] Up to 1 of your black {Land of Wano} type Characters gains [Unblockable] during this turn. (This card cannot be blocked.)
    {
      cardId: 'OP16-095',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-095-on-play-grant-unblockable',
            text: '[On Play] Up to 1 of your black {Land of Wano} type Characters gains [Unblockable] during this turn.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    color: ['Black'],
                    trait: ['Land of Wano'],
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
    // OP16-096 Yamato (096)
    // [Unblockable] (This card cannot be blocked.) [On K.O.] Play up to 1 [Yamato] with a cost of 6 or less from your trash.
    {
      cardId: 'OP16-096',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-096-on-ko-play-yamato-6-or-less',
            text: '[On K.O.] Play up to 1 [Yamato] with a cost of 6 or less from your trash.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    name: ['Yamato'],
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
    // OP16-097 Yamato (097)
    // [On Play] Add up to 1 {Land of Wano} type Character card with a cost of 6 or less from your trash to your hand. Then, play up to 1 Character card with a cost of 2 or less from your hand.
    {
      cardId: 'OP16-097',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-097-on-play-add-land-of-wano-to-hand-play-2-cost',
            text: '[On Play] Add up to 1 {Land of Wano} type Character card with a cost of 6 or less from your trash to your hand. Then, play up to 1 Character card with a cost of 2 or less from your hand.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  trait: ['Land of Wano'],
                  costMax: 6,
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-098 Yamato (098)
    // [On Play] Draw 1 card and trash 1 card from your hand.
    // [Activate:Main] You may trash this Character: Play up to 1 black [Yamato] with a cost of 8 from your trash.
    {
      cardId: 'OP16-098',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-098-on-play-draw-1-trash-1',
            text: '[On Play] Draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'op16-098-activate-main-trash-play-yamato-8',
            text: '[Activate:Main] You may trash this Character: Play up to 1 black [Yamato] with a cost of 8 from your trash.',
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
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    name: ['Yamato'],
                    costMin: 8,
                    costMax: 8,
                    color: ['Black'],
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
    // OP16-099 I've Come Here... To Cut Those Chains!!!
    // [Main] You may rest 6 of your DON!! cards: Trash 5 cards from the top of your deck. Then, play up to 1 {Land of Wano} type Character card with a cost of 6 or less from your trash.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP16-099',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-099-main-rest-6-don-trash-5-play-land-of-wano',
            text: '[Main] You may rest 6 of your DON!! cards: Trash 5 cards from the top of your deck. Then, play up to 1 {Land of Wano} type Character card with a cost of 6 or less from your trash.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['cost'],
                  count: { kind: 'exact', value: 6 },
                },
              },
            ],
            actions: [
              {
                type: 'trashFromDeck',
                player: 'self',
                amount: 5,
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    trait: ['Land of Wano'],
                    costMax: 6,
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
            id: 'op16-099-counter-leader-plus-3000',
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
    // OP16-100 Hallowed Glacier Slash
    // [Main] You may rest 2 of your DON!! cards: If your opponent's Character has been K.O.'d during this turn, set your Leader [Yamato] as active.
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'OP16-100',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-100-main-rest-2-don-restand-yamato-leader',
            text: "[Main] You may rest 2 of your DON!! cards: If your opponent's Character has been K.O.'d during this turn, set your Leader [Yamato] as active.",
            trigger: { type: 'activateMain', optional: true },
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
                type: 'targetExists',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { basePowerMax: 0 },
                },
              },
            ],
            actions: [
              {
                type: 'restand',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Yamato'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-100-counter-leader-plus-3000',
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
    // OP16-101 Mahoroba
    // [Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if you have 10 or more cards in your trash, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.
    // [Trigger] Add up to 1 [Yamato] from your trash to your hand.
    {
      cardId: 'OP16-101',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-101-main-plus-3000-then-ko-if-10-trash',
            text: "[Main] Up to 1 of your Leader or Character cards gains +3000 power during this turn. Then, if you have 10 or more cards in your trash, K.O. up to 1 of your opponent's Characters with a cost of 2 or less.",
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
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 2 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
            conditions: [
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                },
                value: 10,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-101-trigger-add-yamato-from-trash',
            text: '[Trigger] Add up to 1 [Yamato] from your trash to your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { name: ['Yamato'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP16-102 Avalo Pizarro
    // [On K.O.] Draw 1 card, then play up to 1 [Fullalead] from your hand or trash.
    // [Trigger] Activate this card's [On K.O.] effect.
    {
      cardId: 'OP16-102',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-102-on-ko-draw-play-fullalead',
            text: '[On K.O.] Draw 1 card, then play up to 1 [Fullalead] from your hand or trash.',
            trigger: { type: 'onKo' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand', 'trash'],
                  filter: { name: ['Fullalead'] },
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
            id: 'op16-102-trigger-activate-on-ko',
            text: "[Trigger] Activate this card's [On K.O.] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP16-102',
                effectId: 'op16-102-on-ko-draw-play-fullalead',
              },
            ],
          },
        },
      ],
    },
    // OP16-103 Van Augur
    // [Opponent's Turn] [On K.O.] If your Leader has the {Blackbeard Pirates} type, draw 1 card and give up to 1 of your opponent's Leader or Character cards 3000 power during this turn.
    // [Trigger] Activate this card's [On K.O.] effect.
    {
      cardId: 'OP16-103',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-103-on-ko-draw-3000-opponent',
            text: "[Opponent's Turn] [On K.O.] If your Leader has the {Blackbeard Pirates} type, draw 1 card and give up to 1 of your opponent's Leader or Character cards 3000 power during this turn.",
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'controllerTurn', value: false },
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
        {
          kind: 'standard',
          effect: {
            id: 'op16-103-trigger-activate-on-ko',
            text: "[Trigger] Activate this card's [On K.O.] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP16-103',
                effectId: 'op16-103-on-ko-draw-3000-opponent',
              },
            ],
          },
        },
      ],
    },
    // OP16-104 Catarina Devon
    // [When Attacking] Select up to 1 of your opponent's Characters. This Character's base power becomes the same as the selected Character's power during this turn.
    // [Trigger] Draw 1 card and play up to 1 {Blackbeard Pirates} type Character with a cost of 1 from your trash.
    {
      cardId: 'OP16-104',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-104-when-attacking-copy-power',
            text: "[When Attacking] Select up to 1 of your opponent's Characters. This Character's base power becomes the same as the selected Character's power during this turn.",
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
                amount: 0,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-104-trigger-draw-play-blackbeard-1',
            text: '[Trigger] Draw 1 card and play up to 1 {Blackbeard Pirates} type Character with a cost of 1 from your trash.',
            trigger: { type: 'trigger' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    trait: ['Blackbeard Pirates'],
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
    // OP16-105 Gecko Moria
    // [Trigger] If you have 1 or less Life cards, play up to 1 [Absalom], up to 1 [Dr. Hogback], and up to 1 [Perona], with a cost of 4 or less from your trash.
    {
      cardId: 'OP16-105',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-105-trigger-play-absalom-hogback-perona',
            text: '[Trigger] If you have 1 or less Life cards, play up to 1 [Absalom], up to 1 [Dr. Hogback], and up to 1 [Perona], with a cost of 4 or less from your trash.',
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
                  filter: {
                    name: ['Absalom'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    name: ['Dr. Hogback'],
                    costMax: 4,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    name: ['Perona'],
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
    // OP16-106 Sanjuan.Wolf
    // [On K.O.] If your Leader has the {Blackbeard Pirates} type, draw 1 card, then up to 1 of your Leader or Character cards' base power becomes 7000 during this turn.
    // [Trigger] Activate this card's [On K.O.] effect.
    {
      cardId: 'OP16-106',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-106-on-ko-draw-base-power-7000',
            text: "[On K.O.] If your Leader has the {Blackbeard Pirates} type, draw 1 card, then up to 1 of your Leader or Character cards' base power becomes 7000 during this turn.",
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
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
            id: 'op16-106-trigger-activate-on-ko',
            text: "[Trigger] Activate this card's [On K.O.] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP16-106',
                effectId: 'op16-106-on-ko-draw-base-power-7000',
              },
            ],
          },
        },
      ],
    },
    // OP16-107 Jesus Burgess
    // [On K.O.] Add up to 1 card from the top of your opponent's Life cards to the owner's hand.
    // [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'OP16-107',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-107-on-ko-add-opponent-life-to-hand',
            text: "[On K.O.] Add up to 1 card from the top of your opponent's Life cards to the owner's hand.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
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
            id: 'op16-107-trigger-trash-play',
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
                  zones: ['hand'],
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-108 Shiryu (Full Art)
    // [On Play] You may trash 1 card from your hand: Add up to 1 {Blackbeard Pirates} type card with a cost of 6 or less from your trash to the top of your Life cards face-up.
    // [Trigger] Draw 2 cards.
    {
      cardId: 'OP16-108',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-108-on-play-trash-add-to-life',
            text: '[On Play] You may trash 1 card from your hand: Add up to 1 {Blackbeard Pirates} type card with a cost of 6 or less from your trash to the top of your Life cards face-up.',
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
                type: 'addToLife',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: {
                    trait: ['Blackbeard Pirates'],
                    costMax: 6,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
                player: 'self',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-108-trigger-draw-2',
            text: '[Trigger] Draw 2 cards.',
            trigger: { type: 'trigger' },
            actions: [{ type: 'draw', player: 'self', amount: 2 }],
          },
        },
      ],
    },
    // OP16-109 Doc Q
    // [On K.O.] If your Leader has the {Blackbeard Pirates} type, draw 1 card and K.O. up to 2 of your opponent's Characters with a cost of 1 or less.
    // [Trigger] Activate this card's [On K.O.] effect.
    {
      cardId: 'OP16-109',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-109-on-ko-draw-ko-cost-1',
            text: "[On K.O.] If your Leader has the {Blackbeard Pirates} type, draw 1 card and K.O. up to 2 of your opponent's Characters with a cost of 1 or less.",
            trigger: { type: 'onKo' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 1 },
                  count: { kind: 'upTo', value: 2 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-109-trigger-activate-on-ko',
            text: "[Trigger] Activate this card's [On K.O.] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP16-109',
                effectId: 'op16-109-on-ko-draw-ko-cost-1',
              },
            ],
          },
        },
      ],
    },
    // OP16-110 Vasco Shot
    // [On K.O.] Draw 1 card and rest up to 1 of your opponent's Characters with a cost of 6 or less.
    // [Trigger] Activate this card's [On K.O.] effect.
    {
      cardId: 'OP16-110',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-110-on-ko-draw-rest',
            text: "[On K.O.] Draw 1 card and rest up to 1 of your opponent's Characters with a cost of 6 or less.",
            trigger: { type: 'onKo' },
            actions: [
              { type: 'draw', player: 'self', amount: 1 },
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 6 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-110-trigger-activate-on-ko',
            text: "[Trigger] Activate this card's [On K.O.] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP16-110',
                effectId: 'op16-110-on-ko-draw-rest',
              },
            ],
          },
        },
      ],
    },
    // OP16-111 Boa Sandersonia
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Trigger] If you have 2 or less Life cards, play this card.
    {
      cardId: 'OP16-111',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-111-trigger-play-if-life-2-or-less',
            text: '[Trigger] If you have 2 or less Life cards, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-112 Boa Hancock (112)
    // (no effect text)
    {
      cardId: 'OP16-112',
      effects: [],
    },
    // OP16-113 Boa Marigold
    // If you have 2 or less Life cards, this Character gains [Blocker].
    // [Trigger] If your Leader has the {Kuja Pirates} type, play this card.
    {
      cardId: 'OP16-113',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'op16-113-gain-blocker-if-life-2-or-less',
            text: 'If you have 2 or less Life cards, this Character gains [Blocker].',
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            modifier: {
              selector: {
                player: 'self',
                source: 'effectSource',
                zones: ['characters'],
                count: { kind: 'exact', value: 1 },
              },
              keywords: ['cannotBlock'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-113-trigger-play-if-kuja-leader',
            text: '[Trigger] If your Leader has the {Kuja Pirates} type, play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Kuja Pirates',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  source: 'effectSource',
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // OP16-114 Laffitte
    // [On K.O.] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.
    // [Trigger] Activate this card's [On K.O.] effect.
    {
      cardId: 'OP16-114',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-114-on-ko-ko-cost-4',
            text: "[On K.O.] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 4 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-114-trigger-activate-on-ko',
            text: "[Trigger] Activate this card's [On K.O.] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'OP16-114',
                effectId: 'op16-114-on-ko-ko-cost-4',
              },
            ],
          },
        },
      ],
    },
    // OP16-115 Black Vortex
    // [Main] If your Leader has the {Blackbeard Pirates} type, add up to 1 card with a [Trigger] other than [Black Vortex] from your trash to your hand.
    // [Trigger] Negate the effect of up to 1 of your opponent's Leader or Character cards during this turn.
    {
      cardId: 'OP16-115',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-115-main-add-trigger-card-from-trash',
            text: '[Main] If your Leader has the {Blackbeard Pirates} type, add up to 1 card with a [Trigger] other than [Black Vortex] from your trash to your hand.',
            trigger: { type: 'activateMain' },
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Blackbeard Pirates',
              },
            ],
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: {
                  hasTrigger: true,
                  excludeName: ['Black Vortex'],
                },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-115-negate-effect-trigger',
        },
      ],
    },
    // OP16-116 Zehahahahaha!
    // [Main] If you have 10 DON!! cards on your field, play up to 1 [Marshall.D.Teach] from your hand. Then, add up to 1 card from the top of your opponent's Life cards to the owner's hand.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'OP16-116',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-116-main-play-marshall-d-teach-add-life-to-hand',
            text: "[Main] If you have 10 DON!! cards on your field, play up to 1 [Marshall.D.Teach] from your hand. Then, add up to 1 card from the top of your opponent's Life cards to the owner's hand.",
            trigger: { type: 'activateMain' },
            conditions: [
              { type: 'playerHasTotalDonAtLeast', player: 'self', value: 10 },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { name: ['Marshall.D.Teach'] },
                  count: { kind: 'upTo', value: 1 },
                },
                destination: 'characters',
              },
              {
                type: 'moveCard',
                selector: {
                  player: 'opponent',
                  zones: ['life'],
                  filter: { zonePosition: 'top' },
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
            id: 'op16-116-trigger-draw-2-trash-1',
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
    // OP16-117 Black Hole
    // [Main] You may trash 1 card with a [Trigger] from your hand: Negate the effects of up to 1 of your opponent's Characters with a cost of 8 or less during this turn.
    // [Trigger] Add up to 1 {Blackbeard Pirates} type card from your trash to your hand.
    {
      cardId: 'OP16-117',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-117-main-trash-trigger-card-negate',
            text: "[Main] You may trash 1 card with a [Trigger] from your hand: Negate the effects of up to 1 of your opponent's Characters with a cost of 8 or less during this turn.",
            trigger: { type: 'activateMain', optional: true },
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
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 8 },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotAttack'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'op16-117-trigger-add-blackbeard-from-trash',
            text: '[Trigger] Add up to 1 {Blackbeard Pirates} type card from your trash to your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'trash',
                amount: 99,
                filter: { trait: ['Blackbeard Pirates'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
              },
            ],
          },
        },
      ],
    },
    // OP16-118 Portgas.D.Ace (118)
    // The counter of all of your Character cards with 8000 power in your hand becomes +2000.
    // [On Play]/[On K.O.] Look at 5 cards from the top of your deck; reveal up to 1 [Monkey.D.Luffy] or up to 1 card with a type including "Whitebeard Pirates" and add it to your hand. Then, place the rest a the bottom of your deck in any order.
    {
      cardId: 'OP16-118',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-118-counter-mod-and-search',
        },
      ],
    },
    // OP16-119 Marshall.D.Teach (119)
    // [On Play] Look at 3 cards from the top of your deck; add up to 1 card to the top of your Life cards. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] Negate the effect of up to 1 of your opponent's Characters during this turn. Then, K.O. up to 1 of your opponent's Characters with a cost of 5 or less.
    {
      cardId: 'OP16-119',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'op16-119-on-play-reveal-add-to-life',
            text: '[On Play] Look at 3 cards from the top of your deck; add up to 1 card to the top of your Life cards. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 3,
                filter: {},
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restDestination: 'deck',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'special-ref',
          specialHandlerId: 'op16-119-negate-and-ko-trigger',
        },
      ],
    },
  ],
};
