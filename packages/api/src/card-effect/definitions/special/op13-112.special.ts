import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13112SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-112-special',
  cardId: 'OP13-112',
  resolve(event, engine) {
    // TODO: If you have a total of 2 or more given DON!! cards, this Character gains [Blocker].
  },
};
