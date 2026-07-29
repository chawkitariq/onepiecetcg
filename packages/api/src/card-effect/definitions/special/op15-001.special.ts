import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15001SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-001-special',
  cardId: 'OP15-001',
  resolve(event, engine) {
    // TODO: [Activate: Main] [Once Per Turn] Rest up to 1 of opponent's Characters with 2+ DON!! cards given.
  },
};
