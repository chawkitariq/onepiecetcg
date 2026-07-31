import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st29EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-29',
  cards: [
    // ST29-001 Monkey.D.Luffy (001) (Parallel)
    // [When Attacking] If you have 2 or less Life cards, draw 1 card and trash 1 card from your hand.
    {
      cardId: 'ST29-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-001-when-attacking-life-2-draw-trash',
            text: '[When Attacking] If you have 2 or less Life cards, draw 1 card and trash 1 card from your hand.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
            ],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
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
    // ST29-004 Sanji (Full Art)
    // [On Play] Look at 4 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    // [Trigger] You may trash 1 card from your hand: Play this card.
    {
      cardId: 'ST29-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-004-on-play-search-straw-hat-crew',
            text: '[On Play] Look at 4 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'search',
                player: 'self',
                sourceZone: 'deck',
                amount: 4,
                filter: { trait: ['Straw Hat Crew'] },
                count: { kind: 'upTo', value: 1 },
                destination: 'hand',
                restToBottom: true,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st29-004-trigger-play',
            text: '[Trigger] You may trash 1 card from your hand: Play this card.',
            trigger: { type: 'trigger' },
            costs: [
              {
                type: 'trashFromHand',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 1 },
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
    // ST29-009 Nico Robin (Full Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Trigger] If your Leader is [Monkey.D.Luffy], play this card.
    {
      cardId: 'ST29-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-009-trigger-play-if-luffy-leader',
            text: '[Trigger] If your Leader is [Monkey.D.Luffy], play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Monkey.D.Luffy',
              },
            ],
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Nico Robin'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST29-016 Kizaru!! Compared to Two Years Ago We're a Hundred Times Stronger Now!!
    // [Main] Your [Monkey.D.Luffy] Leader gains [Unblockable] during this turn.
    // (This card cannot be blocked.)
    // [Counter] Your Leader gains +3000 power during this battle.
    {
      cardId: 'ST29-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-016-main-unblockable-luffy',
            text: '[Main] Your [Monkey.D.Luffy] Leader gains [Unblockable] during this turn.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'exact', value: 1 },
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
            id: 'st29-016-counter-leader-plus-3000',
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
    // ST29-014 Roronoa Zoro (Full Art)
    // [Rush: Character] (This card can attack Characters on the turn in which it is played.)
    // [Activate: Main] [Once Per Turn] You may trash 1 card with a [Trigger] from your hand: Draw 1 card and give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST29-014',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st29-014-rush-character',
            text: '[Rush: Character] (This card can attack Characters on the turn in which it is played.)',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Roronoa Zoro'] },
              },
              keywords: ['canAttackActiveCharacters'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st29-014-activate-main-trash-trigger-draw-attach-don',
            text: '[Activate: Main] [Once Per Turn] You may trash 1 card with a [Trigger] from your hand: Draw 1 card and give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
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
                type: 'draw',
                player: 'self',
                amount: 1,
              },
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
    // ST29-008 Nami
    // If your {Egghead} type Character would be K.O.'d by your opponent's effect, you may turn 1 card from the top of your Life cards face-up instead.
    // [Trigger] If your Leader is [Monkey.D.Luffy], play this card.
    {
      cardId: 'ST29-008',
      effects: [
        {
          kind: 'replacement',
          effect: {
            id: 'st29-008-replacement-ko-protection-egghead',
            text: "If your {Egghead} type Character would be K.O.'d by your opponent's effect, you may turn 1 card from the top of your Life cards face-up instead.",
            event: 'wouldKoCharacter',
            optional: true,
            conditions: [
              {
                type: 'eventReasonIs',
                value: 'effect',
              },
              {
                type: 'eventTargetMatchesFilter',
                filter: { trait: ['Egghead'] },
              },
            ],
            replacement: [
              {
                type: 'reveal',
                player: 'self',
                zone: 'life',
                amount: 1,
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st29-008-trigger-play-if-luffy-leader',
            text: '[Trigger] If your Leader is [Monkey.D.Luffy], play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Monkey.D.Luffy',
              },
            ],
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
    // ST29-005 Jinbe (Full Art)
    // [Trigger] If your Leader is [Monkey.D.Luffy], play this card.
    {
      cardId: 'ST29-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-005-trigger-play-if-luffy-leader',
            text: '[Trigger] If your Leader is [Monkey.D.Luffy], play this card.',
            trigger: { type: 'trigger' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Monkey.D.Luffy',
              },
            ],
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
    // ST29-007 Tony Tony.Chopper
    // [On K.O.] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.
    // [Trigger] Up to 1 of your [Monkey.D.Luffy] cards gains +2000 power during this turn.
    {
      cardId: 'ST29-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-007-on-ko-life-to-hand-then-hand-to-life',
            text: '[On K.O.] You may add 1 card from the top or bottom of your Life cards to your hand: Add up to 1 card from your hand to the top of your Life cards.',
            trigger: { type: 'onKo' },
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
                type: 'moveCard',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  count: { kind: 'upTo', value: 1 },
                },
                destinationPlayer: 'self',
                destinationZone: 'life',
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st29-007-trigger-plus-2000-luffy',
            text: '[Trigger] Up to 1 of your [Monkey.D.Luffy] cards gains +2000 power during this turn.',
            trigger: { type: 'trigger' },
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
    // ST29-011 Brook
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST29-011',
    },
    // ST29-012 Monkey.D.Luffy (012)
    // [Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your [Monkey.D.Luffy] cards.
    // [Trigger] Play this card.
    {
      cardId: 'ST29-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-012-activate-main-attach-rested-don-luffy',
            text: '[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your [Monkey.D.Luffy] cards.',
            trigger: { type: 'activateMain', oncePerTurn: true },
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
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st29-012-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Monkey.D.Luffy'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST29-013 Rob Lucci
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the total of your and your opponent's Life cards.
    {
      cardId: 'ST29-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-013-trigger-ko-cost-less-than-total-life',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost equal to or less than the total of your and your opponent's Life cards.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
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
    // ST29-002 Usopp
    // [On Play] / [When Attacking] Rest up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.
    {
      cardId: 'ST29-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-002-on-play-rest-opp-cost-life',
            text: "[On Play] Rest up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'st29-002-when-attacking-rest-opp-cost-life',
            text: "[When Attacking] Rest up to 1 of your opponent's Characters with a cost equal to or less than the number of your opponent's Life cards.",
            trigger: { type: 'whenAttacking' },
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
    // ST29-003 Kaku
    // If the number of your Life cards is equal to or less than the number of your opponent's Life cards, this Character gains +1000 power.
    // [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    {
      cardId: 'ST29-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st29-003-life-less-equal-opp-life-plus-1000',
            text: "If the number of your Life cards is equal to or less than the number of your opponent's Life cards, this Character gains +1000 power.",
            conditions: [
              {
                type: 'playerHasLessLifeThan',
                player: 'self',
                thanPlayer: 'opponent',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Kaku'] },
              },
              power: 1000,
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st29-003-trigger-ko-cost-3-or-less',
            text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { costMax: 3 },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST29-015 Raw Heat Strike
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 1 or less Life cards, give up to 1 of your opponent's Leader or Character cards -2000 power during this turn.
    {
      cardId: 'ST29-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-015-counter-plus-2000-then-minus-2000-if-life-1',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, if you have 1 or less Life cards, give up to 1 of your opponent's Leader or Character cards -2000 power during this turn.",
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
                type: 'ifConditionsMatch',
                conditions: [
                  { type: 'playerHasLifeAtMost', player: 'self', value: 1 },
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
    // ST29-017 Iai Death Lion Song
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 2 or less Life cards, K.O. up to 1 of your opponent's Characters with a cost of 3 or less.
    // [Trigger] Draw 2 cards and trash 1 card from your hand.
    {
      cardId: 'ST29-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st29-017-counter-plus-4000-then-ko-if-life-2',
            text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, if you have 2 or less Life cards, K.O. up to 1 of your opponent's Characters with a cost of 3 or less.",
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
                type: 'ifConditionsMatch',
                conditions: [
                  { type: 'playerHasLifeAtMost', player: 'self', value: 2 },
                ],
                actions: [
                  {
                    type: 'ko',
                    selector: {
                      player: 'opponent',
                      zones: ['characters'],
                      filter: { costMax: 3 },
                      count: { kind: 'upTo', value: 1 },
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
            id: 'st29-017-trigger-draw-2-trash-1',
            text: '[Trigger] Draw 2 cards and trash 1 card from your hand.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 2,
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
  ],
};
