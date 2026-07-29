import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13016SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-016-special',
  cardId: 'OP13-016',
  resolve(event, engine) {
    // TODO: [On Play] If your Leader is [Sabo], [Portgas.D.Ace] or [Monkey.D.Luffy], look at 4 cards from the top of your deck; reveal up to 1 card with a cost of 3 or more and add it to your hand. Then, place the rest at the bottom of your deck in any order.
  },
};
