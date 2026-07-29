import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13118SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-118-special',
  cardId: 'OP13-118',
  resolve(event, engine) {
    // TODO: [Double Attack]
    // TODO: [On Play] If your Leader is multicolored, set up to 4 of your DON!! cards as active. Then, you cannot play Character cards with a base cost of 5 or more during this turn.
  },
};
