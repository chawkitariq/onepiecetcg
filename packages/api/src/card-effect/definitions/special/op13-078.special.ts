import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13078SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-078-special',
  cardId: 'OP13-078',
  resolve(event, engine) {
    // TODO: [Once Per Turn] When your Character with a type including "Roger Pirates" is removed from the field by your opponent's effect, add up to 1 DON!! card from your DON!! deck and rest it.
  },
};
