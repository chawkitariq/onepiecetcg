import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op10119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-119-special',
  cardId: 'OP10-119',
  resolve(event, engine) {
    // TODO: Implement special handler for OP10-119
    // [On Play] Reveal Supernovas Character from hand, add to top of Life face-down.
    // Give rested DON!! to Supernovas Leader.
  },
};
