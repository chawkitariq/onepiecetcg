import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op02EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP02',
  cards: [
    {
      cardId: 'OP02-004',
      effects: [
        {
          kind: 'standard',
          effect: {
            id: 'vista-when-attacking',
            text: '[When Attacking] KO up to 1 rested Character with a cost of 3 or less.',
            trigger: { type: 'whenAttacking' },
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
                upTo: true,
                reason: 'effect',
              },
            ],
          },
        },
      ],
    },
  ],
};
