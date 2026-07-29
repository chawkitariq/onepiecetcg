import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13105SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-105-special',
  cardId: 'OP13-105',
  resolve(event, engine) {
    // TODO: [On Play] Look at all of your Life cards and place them back in your Life area in any order.
  },
};
