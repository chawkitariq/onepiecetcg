import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op11071SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-071-special',
  cardId: 'OP11-071',
  resolve(event, engine) {
    // Charlotte Perospero: Activate: Main Once Per Turn trash 1 from hand -> choose cost,
    // reveal top of opponent deck. If matches, draw 1 and add 1 DON active.
  },
};
