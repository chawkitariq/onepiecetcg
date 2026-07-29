import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13109SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-109-special',
  cardId: 'OP13-109',
  resolve(event, engine) {
    // TODO: If this Character would be removed from the field by your opponent's effect, you may turn 1 card from the top of your Life cards face-up instead.
    // TODO: [Trigger] Draw 2 cards and trash 1 card from your hand.
  },
};
