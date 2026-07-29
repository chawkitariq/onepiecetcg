import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15008SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-008-special',
  cardId: 'OP15-008',
  resolve(event, engine) {
    // TODO: [Activate: Main] [Once Per Turn] If this Character was played this turn, give all opponent's Characters -1000 power per DON!! given to each.
  },
};
