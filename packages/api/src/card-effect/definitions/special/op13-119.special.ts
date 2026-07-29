import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-119-special',
  cardId: 'OP13-119',
  resolve(event, engine) {
    // TODO: If you have 3 or less Life cards, this Character gains [Rush].
    // TODO: [On Play] Give up to 1 rested DON!! card to your Leader. Then, you may return up to 1 of your opponent's Characters with a cost of 5 or less to the owner's hand. If you do, your opponent plays up to 1 Character card with a cost of 4 or less from their hand.
  },
};
