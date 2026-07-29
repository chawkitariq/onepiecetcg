import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op12020SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-020-special',
  cardId: 'OP12-020',
  resolve(event, engine) {
    // TODO: Implement special handler for OP12-020
    // [DON!! x3] [Activate: Main] [Once Per Turn] If this Leader battles your opponent's Character during this turn,
    // set this Leader as active. Then, this Leader cannot attack your opponent's Characters with a base cost of 7 or less during this turn.
  },
};
