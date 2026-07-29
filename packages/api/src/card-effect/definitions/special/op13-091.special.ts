import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13091SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-091-special',
  cardId: 'OP13-091',
  resolve(event, engine) {
    // TODO: If you have 7 or more cards in your trash, this Character cannot be removed from the field by your opponent's effects and gains [Blocker].
    // TODO: [On Play] You may trash 1 card from your hand: K.O. up to 1 of your opponent's Characters with a base cost of 5 or less.
  },
};
