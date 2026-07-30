import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const st02EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'ST-02',
  cards: [
    // ST02-001 Eustass"Captain"Kid (001)
    // [Activate: Main] [Once Per Turn] (3) (You may rest the specified number of DON!! cards in your cost area.) You may trash 1 card from your hand: Set this Leader as active.
    {
      cardId: 'ST02-001',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eustass-kid-leader-main-pay-3-trash-1-restand',
            text: '[Activate: Main] [Once Per Turn] (3) You may trash 1 card from your hand: Set this Leader as active.',
            trigger: {
              type: 'activateMain',
              oncePerTurn: true,
              optional: true,
            },
            costs: [
              { type: 'removeDon', player: 'self', amount: 3 },
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
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['leader'],
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST02-003 Urouge
    // [DON!! x1] If you have 3 or more Characters, this card gains +2000 power.
    {
      cardId: 'ST02-003',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'urouge-don-x1-3-characters-plus-2000',
            text: '[DON!! x1] If you have 3 or more Characters, this card gains +2000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              {
                type: 'targetCountAtLeast',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                },
                value: 3,
              },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['characters'],
                filter: { name: ['Urouge'] },
              },
              power: 2000,
            },
          },
        },
      ],
    },
    // ST02-004 Capone"Gang"Bege (ST02-004) (Alternate Art)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)
    {
      cardId: 'ST02-004',
    },
    // ST02-005 Killer
    // [On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less. [Trigger] Play this card.
    {
      cardId: 'ST02-005',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'killer-on-play-ko-rested-cost-3-or-less',
            text: "[On Play] K.O. up to 1 of your opponent's rested Characters with a cost of 3 or less.",
            trigger: { type: 'onPlay' },
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
        {
          kind: 'standard',
          effect: {
            id: 'killer-trigger-play-this-card',
            text: '[Trigger] Play this card.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'play',
                selector: {
                  player: 'self',
                  zones: ['trash'],
                  filter: { name: ['Killer'] },
                  count: { kind: 'exact', value: 1 },
                },
                destination: 'characters',
              },
            ],
          },
        },
      ],
    },
    // ST02-007 Jewelry Bonney (SP)
    // [Activate: Main] (1) (You may rest the specified number of DON!! cards in your cost area.) You may rest this Character: Look at 5 cards from the top of your deck; reveal up to 1 {Supernovas} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.
    {
      cardId: 'ST02-007',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'jewelry-bonney-main-pay-1-rest-search-supernovas',
            text: '[Activate: Main] (1) You may rest this Character: Look at 5 cards from the top of your deck; reveal up to 1 {Supernovas} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.',
            trigger: { type: 'activateMain', optional: true },
            costs: [
              { type: 'removeDon', player: 'self', amount: 1 },
              {
                type: 'rest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Jewelry Bonney'], rested: false },
                  source: 'effectSource',
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
                filter: { trait: ['Supernovas'] },
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
    // ST02-008 Scratchmen Apoo
    // [DON!! x1] [When Attacking] Rest up to 1 of your opponent's DON!! cards.
    {
      cardId: 'ST02-008',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'scratchmen-apoo-when-attacking-rest-opponent-don',
            text: "[DON!! x1] [When Attacking] Rest up to 1 of your opponent's DON!! cards.",
            trigger: { type: 'whenAttacking' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
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
    // ST02-009 Trafalgar Law
    // [On Play] Set up to 1 of your "Supernovas" or "Heart Pirates" type rested Characters with a cost of 5 or less as active.
    {
      cardId: 'ST02-009',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'trafalgar-law-on-play-unrest-supernovas-heart-pirates-cost-5-or-less',
            text: '[On Play] Set up to 1 of your "Supernovas" or "Heart Pirates" type rested Characters with a cost of 5 or less as active.',
            trigger: { type: 'onPlay' },
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    trait: ['Supernovas', 'Heart Pirates'],
                    rested: true,
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
    // ST02-010 Basil Hawkins
    // [DON!! x1] [Once Per Turn] [Your Turn] If this Character battles your opponent's Character, set this card as active.
    {
      cardId: 'ST02-010',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'basil-hawkins-when-attacking-restand',
            text: "[DON!! x1] [Once Per Turn] [Your Turn] If this Character battles your opponent's Character, set this card as active.",
            trigger: { type: 'whenAttacking', oncePerTurn: true },
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
            ],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Basil Hawkins'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST02-013 Eustass"Captain"Kid (013)
    // [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) [DON!! x1] [End of Your Turn] Set this card as active.  This card has been officially errata'd.
    {
      cardId: 'ST02-013',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'eustass-kid-013-end-of-turn-restand',
            text: '[DON!! x1] [End of Your Turn] Set this card as active.',
            trigger: { type: 'onTurnEnd' },
            conditions: [{ type: 'sourceHasAttachedDonAtLeast', value: 1 }],
            actions: [
              {
                type: 'unrest',
                selector: {
                  player: 'self',
                  zones: ['characters'],
                  filter: { name: ['Eustass"Captain"Kid'] },
                  count: { kind: 'exact', value: 1 },
                },
              },
            ],
          },
        },
      ],
    },
    // ST02-014 X.Drake
    // [DON!! x1] [Your Turn] If this Character is rested, your "Supernovas" or "Navy" type Leaders and Characters gain +1000 power.
    {
      cardId: 'ST02-014',
      effects: [
        {
          kind: 'continuous',
          effect: {
            id: 'x-drake-don-x1-rested-buff-supernovas-navy',
            text: '[DON!! x1] [Your Turn] If this Character is rested, your "Supernovas" or "Navy" type Leaders and Characters gain +1000 power.',
            conditions: [
              { type: 'sourceHasAttachedDonAtLeast', value: 1 },
              { type: 'controllerTurn', value: true },
              { type: 'sourceIsRested', value: true },
            ],
            modifier: {
              selector: {
                player: 'self',
                zones: ['leader', 'characters'],
                filter: { trait: ['Supernovas', 'Navy'] },
              },
              power: 1000,
            },
          },
        },
      ],
    },
    // ST02-015 Scalpel
    // [Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, set up to 1 of your DON!! cards as active. [Trigger] Set up to 2 of your DON!! cards as active.
    {
      cardId: 'ST02-015',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'scalpel-counter-plus-2000-restand-1-don',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle. Then, set up to 1 of your DON!! cards as active.',
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
                type: 'restand',
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
            id: 'scalpel-trigger-restand-2-don',
            text: '[Trigger] Set up to 2 of your DON!! cards as active.',
            trigger: { type: 'trigger' },
            actions: [
              {
                type: 'restand',
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
    // ST02-016 Repel
    // [Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, set up to 1 of your DON!! cards as active.
    {
      cardId: 'ST02-016',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'repel-counter-plus-4000-restand-1-don',
            text: '[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, set up to 1 of your DON!! cards as active.',
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
                type: 'restand',
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
    // ST02-017 Straw Sword
    // [Main] Rest up to 1 of your opponent's Characters.
    {
      cardId: 'ST02-017',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'straw-sword-main-rest-opponent-character',
            text: "[Main] Rest up to 1 of your opponent's Characters.",
            trigger: { type: 'activateMain' },
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
  ],
};
