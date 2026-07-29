import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13089SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-089-special',
  cardId: 'OP13-089',
  resolve(event, engine) {
    // TODO: If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects and gains [Blocker].
    // TODO: [On K.O.] Draw 1 card.
  },
};
