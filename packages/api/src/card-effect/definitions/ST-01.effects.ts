import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st01EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-01',
  cards: [
    // ST01-001 Monkey.D.Luffy (001)
    // [Activate: Main] [Once Per Turn] Give this Leader or 1 of your Characters up to 1 rested DON!! card.
    {
      cardId: 'ST01-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-001-activate-main-attach-don',
            text: '[Activate: Main] [Once Per Turn] Give this Leader or 1 of your Characters up to 1 rested DON!! card.',
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
    // ST01-002 Usopp
    // [DON!! x2] [When Attacking] Your opponent cannot activate a [Blocker] Character that has 5000 or more power during this battle. [Trigger] Play this card.
    {
      cardId: 'ST01-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-002-when-attacking-blockers-5000plus-cannot-block',
            text: '[DON!! x2] [When Attacking] Your opponent cannot activate a [Blocker] Character that has 5000 or more power during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            actions: [
              {
                type: 'grantKeywords',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMin: 5000 },
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
            id: 'st01-002-trigger-play',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Usopp'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST01-004 Sanji
    // [DON!! x2] This Character gains [Rush]. (This card can attack on the turn in which it is played.)
    {
      cardId: 'ST01-004',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st01-004-don-x2-rush',
            text: '[DON!! x2] This Character gains [Rush].',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Sanji'] },
              },
              keywords: ['rush'],
            },
          },
        },
      ],
    },
    // ST01-005 Jinbe
    // [DON!! x1] [When Attacking] Up to 1 of your Leader or Character cards other than this card gains +1000 power during this turn.
    {
      cardId: 'ST01-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-005-when-attacking-plus-1000-other',
            text: '[DON!! x1] [When Attacking] Up to 1 of your Leader or Character cards other than this card gains +1000 power during this turn.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // ST01-006 Tony Tony.Chopper (ST01-006) (Jolly Roger Foil)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST01-006',
      effects: [],
    },
    // ST01-007 Nami (TR)
    // [Activate:Main][Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST01-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-007-activate-main-attach-don',
            text: '[Activate:Main][Once Per Turn] Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
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
    // ST01-011 Brook - ST01-011 (Pirate Foil)
    // [On Play] Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.
    {
      cardId: 'ST01-011',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-011-on-play-attach-don',
            text: '[On Play] Give up to 2 rested DON!! cards to your Leader or 1 of your Characters.',
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
                amount: 2,
                rested: true,
              },
            ],
          },
        },
      ],
    },
    // ST01-012 Monkey.D.Luffy (012) (Alternate Art)
    // [Rush] (This card can attack on the turn in which it is played.) [DON!! x2][When Attacking] Your opponent cannot activate [Blocker] during this battle.
    {
      cardId: 'ST01-012',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st01-012-rush',
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
            id: 'st01-012-when-attacking-no-blockers',
            text: '[DON!! x2] [When Attacking] Your opponent cannot activate [Blocker] during this battle.',
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 2 }],
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
      ],
    },
    // ST01-013 Roronoa Zoro
    // [DON!! x1] This Character gains +1000 power.
    {
      cardId: 'ST01-013',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st01-013-don-x1-plus-1000',
            text: '[DON!! x1] This Character gains +1000 power.',
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Roronoa Zoro'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // ST01-014 Guard Point (Jolly Roger Foil)
    // [Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle.[Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.
    {
      cardId: 'ST01-014',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-014-counter-plus-3000',
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
            id: 'st01-014-trigger-plus-1000',
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
    // ST01-015 Gum-Gum Jet Pistol
    // [Main] K.O. up to 1 of your opponent's Characters with 6000 power or less. [Trigger] Activate this card's [Main] effect.
    {
      cardId: 'ST01-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-015-main-ko-6000-or-less',
            text: "[Main] K.O. up to 1 of your opponent's Characters with 6000 power or less.",
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], powerMax: 6000 },
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
            id: 'st01-015-trigger-activate-main',
            text: "[Trigger] Activate this card's [Main] effect.",
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'activateEffect',
                cardId: 'ST01-015',
                effectId: 'st01-015-main-ko-6000-or-less',
              },
            ],
          },
        },
      ],
    },
    // ST01-016 Diable Jambe
    // [Main] Select up to 1 of your {Straw Hat Crew} type Leader or Character cards. Your opponent cannot activate [Blocker] if that Leader or Character attacks during this turn. [Trigger] K.O. up to 1 of your opponent's [Blocker] Characters with a cost of 3 or less.
    {
      cardId: 'ST01-016',
      effects: [
        {
          kind: 'special-ref',
          specialHandlerId: 'st01-016-special',
        },
      ],
    },
    // ST01-017 Thousand Sunny
    // [Activate: Main] You may rest this Stage: Up to 1 {Straw Hat Crew} type Leader or Character card on your field gains +1000 power during this turn.
    {
      cardId: 'ST01-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st01-017-activate-main-rest-plus-1000-straw-hat',
            text: '[Activate: Main] You may rest this Stage: Up to 1 {Straw Hat Crew} type Leader or Character card on your field gains +1000 power during this turn.',
            trigger: { type: 'activateMain' },
            costs: [
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['stage'],
                  filter: { name: ['Thousand Sunny'] },
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
                  filter: { trait: ['Straw Hat Crew'] },
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
  ],
};
