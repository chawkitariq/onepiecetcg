import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15092SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-092-special',
  cardId: 'OP15-092',
  resolve(event, engine) {
    // TODO: If 20+ trash, during opponent's turn, Leader's base power becomes 7000.
  },
};
