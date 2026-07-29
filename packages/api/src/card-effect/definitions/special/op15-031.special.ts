import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15031SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-031-special',
  cardId: 'OP15-031',
  resolve(event, engine) {
    // TODO: [On Play] Select up to 1 opponent's rested Character.
    // If its cost equals the number of DON!! cards given to it, K.O. it.
  },
};
