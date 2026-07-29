import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op12040SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-040-special',
  cardId: 'OP12-040',
  resolve(event, engine) {
    // TODO: Implement special handler for OP12-040
    // When a card is trashed from your hand by your "Navy" type card's effect, draw cards equal to the number of cards trashed.
  },
};
