import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15119SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-119-special',
  cardId: 'OP15-119',
  resolve(event, engine) {
    // TODO: When opponent activates Event or [Blocker], reveal up to 1 card from top of Life.
    // This Character gains +1000 power during this turn per 1 cost on revealed card.
  },
};
