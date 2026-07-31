import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

export const st21EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-21',
  cards: [
    // ST21-001 Monkey.D.Luffy (001) (Parallel)
    // [DON!! x1] [Activate: Main] [Once Per Turn] Give up to 2 rested DON!! cards to 1 of your Characters.
    {
      cardId: 'ST21-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st21-001-activate-main-don-x1-attach-2-rested',
            text: '[DON!! x1] [Activate: Main] [Once Per Turn] Give up to 2 rested DON!! cards to 1 of your Characters.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['characters'],
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
    // ST21-002 Usopp
    // [DON!! x2] [Opponent's Turn] This Character gains +2000 power.
    {
      cardId: 'ST21-002',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st21-002-don-x2-opponent-turn-plus-2000',
            text: "[DON!! x2] [Opponent's Turn] This Character gains +2000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'controllerTurn', value: false },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Usopp'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // ST21-003 Sanji (Parallel)
    // [On Play] Select up to 1 of your {Straw Hat Crew} type Characters with 6000 power or more. If the selected Character attacks during this turn, your opponent cannot activate [Blocker].
    {
      cardId: 'ST21-003',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st21-003-special',
        },
      ],
    },
    // ST21-004 Jewelry Bonney
    // [DON!! x2] [On K.O.] Draw 1 card.
    {
      cardId: 'ST21-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st21-004-don-x2-on-ko-draw-1',
            text: '[DON!! x2] [On K.O.] Draw 1 card.',
            trigger: { type: 'onKo' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            actions: [
              {
                type: 'draw',
                player: 'self',
                amount: 1,
              },
            ],
          },
        },
      ],
    },
    // ST21-007 Sentomaru
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST21-007',
      effects: [],
    },
    // ST21-009 Nami (Parallel)
    // [Activate: Main] [Once Per Turn] Give up to 2 rested DON!! cards to 1 of your {Straw Hat Crew} type Leader or Character cards.
    {
      cardId: 'ST21-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st21-009-activate-main-once-per-turn-attach-2-rested-straw-hat',
            text: '[Activate: Main] [Once Per Turn] Give up to 2 rested DON!! cards to 1 of your {Straw Hat Crew} type Leader or Character cards.',
            trigger: { type: 'activateMain', oncePerTurn: true },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  filter: { trait: ['Straw Hat Crew'] },
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
    // ST21-010 Nico Robin (Parallel)
    // [DON!! x2] [When Attacking] K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'ST21-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st21-010-don-x2-when-attacking-ko-4000-or-less',
            text: "[DON!! x2] [When Attacking] K.O. up to 1 of your opponent's Characters with 4000 power or less.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 4000 },
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
    // ST21-011 Franky
    // [DON!! x2] [Opponent's Turn] All of your {Straw Hat Crew} type Characters with 4000 base power or less gain +1000 power.
    {
      cardId: 'ST21-011',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st21-011-don-x2-opponent-turn-straw-hat-base-4000-plus-1000',
            text: "[DON!! x2] [Opponent's Turn] All of your {Straw Hat Crew} type Characters with 4000 base power or less gain +1000 power.",
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 2 },
              { type: 'controllerTurn', value: false },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: {
                  cardCategory: ['Character'],
                  trait: ['Straw Hat Crew'],
                  basePowerMax: 4000,
                },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // ST21-012 Brook (Parallel)
    // [When Attacking] Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.
    {
      cardId: 'ST21-012',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st21-012-when-attacking-attach-2-rested-don',
            text: '[When Attacking] Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
            trigger: { type: 'whenAttacking' },
            actions: [
              {
                type: 'attachDon',
                player: 'self',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
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
    // ST21-014 Monkey.D.Luffy (014) (Parallel)
    // [Rush] (This card can attack on the turn in which it is played.)
    // [When Attacking] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST21-014',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st21-014-rush',
            text: '[Rush]',
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Monkey.D.Luffy'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st21-014-when-attacking-attach-1-rested-don',
            text: '[When Attacking] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
            trigger: { type: 'whenAttacking' },
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
    // ST21-015 Roronoa Zoro (Parallel)
    // [DON!! x2] This Character gains [Rush].
    // [On K.O.] Play up to 1 red Character card with 6000 power or less other than [Roronoa Zoro] from your hand.
    {
      cardId: 'ST21-015',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st21-015-don-x2-rush',
            text: '[DON!! x2] This Character gains [Rush].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Roronoa Zoro'] },
              },
              keywords: ['rush'],
            },
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st21-015-on-ko-play-red-6000-or-less-from-hand',
            text: '[On K.O.] Play up to 1 red Character card with 6000 power or less other than [Roronoa Zoro] from your hand.',
            trigger: { type: 'onKo' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: {
                    cardCategory: ['Character'],
                    color: ['Red'],
                    powerMax: 6000,
                    excludeName: ['Roronoa Zoro'],
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
    // ST21-016 Gum-Gum Dawn Whip
    // [Main] Up to 1 of your Leader or Character cards gains +1000 power during this turn. Then, up to 1 of your opponent's Characters with 4000 power or less cannot activate [Blocker] during this turn.
    // [Trigger] K.O. up to 1 of your opponent's Characters with 4000 power or less.
    {
      cardId: 'ST21-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st21-016-main-power-and-cannot-block',
            text: "[Main] Up to 1 of your Leader or Character cards gains +1000 power during this turn. Then, up to 1 of your opponent's Characters with 4000 power or less cannot activate [Blocker] during this turn.",
            trigger: { type: 'activateMain' },
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
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 4000 },
                  count: { kind: 'upTo', value: 1 },
                },
                keywords: ['cannotBlock'],
                duration: { type: 'untilEndOfTurn' },
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st21-016-trigger-ko-4000-or-less',
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
    // ST21-017 Gum-Gum Mole Pistol
    // [Main] Give up to 1 of your opponent's Characters 5000 power during this turn. Then, if you have a Character with 6000 power or more, K.O. up to 1 of your opponent's Characters with 2000 power or less.
    // [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'ST21-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st21-017-main-power-and-conditional-ko',
            text: "[Main] Give up to 1 of your opponent's Characters 5000 power during this turn. Then, if you have a Character with 6000 power or more, K.O. up to 1 of your opponent's Characters with 2000 power or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amount: 5000,
                duration: { type: 'untilEndOfTurn' },
              },
              {
                type: 'ifConditionsMatch',
                conditions: [
                  {
                    type: 'targetExists',
                    selector: {
                      player: 'self',
                      zones: ['characters'],
                      filter: { cardCategory: ['Character'], powerMin: 6000 },
                    },
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
                    upTo: true,
                    reason: 'effect',
                  },
                ],
              },
            ],
          },
        },
        {
          kind: 'standard',
          effect: {
            id: 'st21-017-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'ST21-017',
                effectId: 'st21-017-main-power-and-conditional-ko',
              },
            ],
          },
        },
      ],
    },
  ],
};
