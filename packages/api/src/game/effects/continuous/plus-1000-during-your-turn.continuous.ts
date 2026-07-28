import type { ContinuousPrimitiveDefinition } from '../types/effect-definition-source';

export const plus1000DuringYourTurnContinuous: ContinuousPrimitiveDefinition = {
  id: 'plus-1000-during-your-turn',
  effect: {
    id: 'plus-1000-during-your-turn',
    text: '[Your Turn] This Character gets +1000 power.',
    conditions: [{ type: 'controllerTurn', value: true }],
    modifier: {
      selector: {
        player: 'self',
        zones: ['characters'],
      },
      power: 1000,
    },
  },
};
