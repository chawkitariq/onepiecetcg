import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15058SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-058-special',
  cardId: 'OP15-058',
  resolve(event, engine) {
    // TODO: DON!! deck size becomes 6.
    // [Activate: Main] [Once Per Turn] If second turn or later, add up to 1 DON!! active + up to 4 rested.
    // Then give up to 4 rested DON!! to 1 Character.
  },
};
