import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15029SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-029-special',
  cardId: 'OP15-029',
  resolve(event, engine) {
    // TODO: [On Play] Up to 1 opponent Character with cost 5 or less cannot be rested until end of opponent's next End Phase.
  },
};
