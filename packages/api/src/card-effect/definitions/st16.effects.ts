import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st16EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST16',
  cards: [
    // ST16-001 Uta (ST16-001)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    // [Activate: Main] [Once Per Turn] You may trash 1 "FILM" type card from your hand: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.
    {
      cardId: 'ST16-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st16-001-activate-main-trash-film-attach-don',
            text: '[Activate: Main] [Once Per Turn] You may trash 1 "FILM" type card from your hand: Give up to 1 rested DON!! card to your Leader or 1 of your Characters.',
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
                  filter: { trait: ['FILM'] },
                  count: { kind: 'exact', value: 1 },
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
    // ST16-002 Gordon
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)[On Your Opponent's Attack] You may trash any number of "Music" type cards from your hand. Your Leader or 1 of your Characters gains +1000 power during this battle for every card trashed.
    {
      cardId: 'ST16-002',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st16-002-on-opponent-attack-trash-music-power-boost',
            text: '[On Your Opponent\'s Attack] You may trash any number of "Music" type cards from your hand. Your Leader or 1 of your Characters gains +1000 power during this battle for every card trashed.',
            trigger: { type: 'onAttacked', optional: true },
            actions: [
              {
                type: 'storeSelectedCards',
                key: 'st16-002-trash-count',
                selector: {
                  player: 'self',
                  zones: ['hand'],
                  filter: { trait: ['Music'] },
                  count: { kind: 'any' },
                },
              },
              {
                type: 'moveStoredCards',
                key: 'st16-002-trash-count',
                destinationPlayer: 'selectedCardOwner',
                destinationZone: 'trash',
              },
              {
                type: 'modifyPowerByStoredCount',
                key: 'st16-002-trash-count',
                selector: {
                  player: 'self',
                  zones: ['leader', 'characters'],
                  count: { kind: 'upTo', value: 1 },
                },
                amountPerCard: 1000,
                duration: { type: 'untilEndOfBattle' },
              },
            ],
          },
        },
      ],
    },
    // ST16-003 Charlotte Katakuri (Pirate Foil)
    // If your Leader has the "FILM" type and you have 6 or more rested cards, this Character gains +2000 power.
    {
      cardId: 'ST16-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st16-003-continuous-plus-2000-if-film-leader-and-6-rested',
            text: 'If your Leader has the "FILM" type and you have 6 or more rested cards, this Character gains +2000 power.',
            conditions: [
              { type: 'playerHasLeaderTrait', player: 'self', value: 'FILM' },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters', 'leader'],
                  filter: { rested: true },
                },
                value: 6,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Charlotte Katakuri (Pirate Foil)'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // ST16-004 Shanks (SP)
    // [On Play] K.O. up to 1 of your opponent's rested Characters.
    {
      cardId: 'ST16-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'st16-004-on-play-ko-rested',
            text: "[On Play] K.O. up to 1 of your opponent's rested Characters.",
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'], rested: true },
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
    // ST16-005 Monkey.D.Luffy - ST16-005 (Pirate Foil)
    // If you have a rested [Uta], this Character gains +1000 power.
    {
      cardId: 'ST16-005',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'st16-005-continuous-plus-1000-if-rested-uta',
            text: 'If you have a rested [Uta], this Character gains +1000 power.',
            conditions: [
              {
                type: 'targetExists',
                selector: {
                  player: 'self',
                  zones: ['characters', 'leader'],
                  filter: { name: ['Uta (ST16-001)'], rested: true },
                },
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Monkey.D.Luffy - ST16-005 (Pirate Foil)'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
  ],
};
