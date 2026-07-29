import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13023SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-023-special',
  cardId: 'OP13-023',
  resolve(event, engine) {
    // TODO: [On Play] Set up to 2 of your DON!! cards as active. Then, you cannot play Character cards with a base cost of 5 or more during this turn.
    // TODO: [On K.O.] Play up to 1 Character card with a cost of 5 or less from your hand rested.
  },
};
