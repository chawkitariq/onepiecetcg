import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13017SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-017-special',
  cardId: 'OP13-017',
  resolve(event, engine) {
    // TODO: [Once Per Turn] If your "Revolutionary Army" type Character would be removed from the field by your opponent's effect, you may give this Character 2000 power during this turn instead.
  },
};
