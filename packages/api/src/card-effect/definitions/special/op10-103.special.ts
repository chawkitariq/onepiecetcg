import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op10103SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-103-special',
  cardId: 'OP10-103',
  resolve(event, engine) {
    // TODO: Implement special handler for OP10-103
    // [On Play] Add Life top/bottom to hand: Add Supernovas Character from hand to top of Life face-up
  },
};
