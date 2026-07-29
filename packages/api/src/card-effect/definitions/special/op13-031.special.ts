import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13031SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-031-special',
  cardId: 'OP13-031',
  resolve(event, engine) {
    // TODO: If you have 1 or less Life cards, this Character gains [Blocker].
    // TODO: [On Play] You may return 1 of your Characters to the owner's hand: Play up to 1 Character card with a cost of 5 or less from your hand rested.
  },
};
