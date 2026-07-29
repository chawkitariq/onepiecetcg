import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op10104SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-104-special',
  cardId: 'OP10-104',
  resolve(event, engine) {
    // TODO: Implement special handler for OP10-104
    // [DON!! x1] If Leader Supernovas + opponent Life >=3, cannot be KO'd in battle
  },
};
