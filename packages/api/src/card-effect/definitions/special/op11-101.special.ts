import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op11101SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-101-special',
  cardId: 'OP11-101',
  resolve(event, engine) {
    // Capone Bege: Once Per Turn, if Supernovas char other than Bege would be removed
    // from field by opponent effect, player may add it to top of life face-down instead.
  },
};
