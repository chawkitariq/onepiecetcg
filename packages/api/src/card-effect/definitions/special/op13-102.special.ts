import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13102SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-102-special',
  cardId: 'OP13-102',
  resolve(event, engine) {
    // TODO: [Activate: Main] You may trash this Character: If the number of your Life cards is equal to or less than the number of your opponent's Life cards, draw 1 card. Then, rest up to 1 of your opponent's Characters with a cost of 3 or less.
    // TODO: [Trigger] Draw 1 card and rest up to 1 of your opponent's Characters with a cost of 3 or less.
  },
};
