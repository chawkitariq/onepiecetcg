import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13028SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-028-special',
  cardId: 'OP13-028',
  resolve(event, engine) {
    // TODO: [On Play] Set all of your DON!! cards as active. Then, you cannot play cards from your hand during this turn.
  },
};
