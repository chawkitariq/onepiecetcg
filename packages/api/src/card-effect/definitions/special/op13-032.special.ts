import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13032SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-032-special',
  cardId: 'OP13-032',
  resolve(event, engine) {
    // TODO: [On Play] Up to 1 of your opponent's Characters with a cost of 8 or less cannot be rested until the end of your opponent's next End Phase.
  },
};
