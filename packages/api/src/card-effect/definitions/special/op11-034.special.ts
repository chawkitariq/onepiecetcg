import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op11034SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-034-special',
  cardId: 'OP11-034',
  resolve(event, engine) {
    // Hatchan: Activate: Main rest self, if leader Fish-Man/Merfolk, opponent char cost <=3
    // cannot be rested until end of opponent's next turn (grants immunity to rest)
  },
};
