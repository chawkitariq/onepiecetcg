import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op11066SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-066-special',
  cardId: 'OP11-066',
  resolve(event, engine) {
    // Charlotte Oven: Activate: Main rest self -> choose a cost, reveal top of opponent deck.
    // If revealed card has chosen cost, KO opponent char base cost <=3. Then add 1 DON from DON!! deck rested.
  },
};
