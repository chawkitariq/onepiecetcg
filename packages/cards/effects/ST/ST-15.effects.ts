import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st15EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-15',
  cards: [
    // ST15-001 Atmos
    // [When Attacking] If your Leader is [Edward.Newgate], you cannot add Life cards to your hand using your own effects during this turn.
    {
      cardId: 'ST15-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st15-001-when-attacking-prevent-life-to-hand',
            text: '[When Attacking] If your Leader is [Edward.Newgate], you cannot add Life cards to your hand using your own effects during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [
              {
                type: 'playerHasLeaderName',
                player: 'self',
                value: 'Edward.Newgate',
              },
            ],
            actions: [
              {
                type: 'preventOwnEffectLifeToHand',
                player: 'self',
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
    // ST15-002 Edward.Newgate (SP)
    // [On Play] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    // [Activate: Main] You may rest this Character: K.O. up to 1 of your opponent's Characters with 5000 power or less.
    {
      cardId: 'ST15-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st15-002-on-play-attach-don-rested',
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
            id: 'st15-002-activate-main-ko-5000-or-less',
            text: "[Activate: Main] You may rest this Character: K.O. up to 1 of your opponent's Characters with 5000 power or less.",
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Edward.Newgate'] },
                  count: { kind: 'upTo', value: 1 },
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // ST15-003 Kingdew
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Opponent's Turn] When this Character is K.O.'d by an effect, up to 1 of your Leader gains +2000 power during this turn.
    {
      cardId: 'ST15-003',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st15-003-on-ko-by-effect-leader-plus-2000',
            text: "[Opponent's Turn] When this Character is K.O.'d by an effect, up to 1 of your Leader gains +2000 power during this turn.",
            trigger: { type: 'onKo' },
            conditions: [
              { type: 'controllerTurn', value: false },
              { type: 'eventReasonIs', value: 'effect' },
            ],
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
    // ST15-004 Thatch
    // [On Play] If your Leader's type includes "Whitebeard Pirates", give up to 1 of your opponent's Characters -2000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.
    {
      cardId: 'ST15-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st15-004-on-play-minus-2000-and-life-to-hand',
            text: '[On Play] If your Leader\'s type includes "Whitebeard Pirates", give up to 1 of your opponent\'s Characters -2000 power during this turn. Then, add 1 card from the top of your Life cards to your hand.',
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
    // ST15-005 Portgas.D.Ace (SP)
    // If your Leader's type includes "Whitebeard Pirates", this Character gains [Rush].
    // [Once Per Turn] If this Character would be removed from the field by your opponent's effect, you may give this Character -2000 power during this turn instead.
    {
      cardId: 'ST15-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st15-005-rush-if-whitebeard',
            text: 'If your Leader\'s type includes "Whitebeard Pirates", this Character gains [Rush].',
            conditions: [
              {
                type: 'playerHasLeaderTrait',
                player: 'self',
                value: 'Whitebeard Pirates',
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Portgas.D.Ace'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'replacement',
          effect: {
            id: 'st15-005-protection-from-opponent-effect',
            text: "[Once Per Turn] If this Character would be removed from the field by your opponent's effect, you may give this Character -2000 power during this turn instead.",
            event: 'wouldKoCharacter',
            optional: true,
            oncePerTurn: true,
            replacement: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Portgas.D.Ace'] },
                  count: { kind: 'exact', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
      ],
    },
  ],
};
