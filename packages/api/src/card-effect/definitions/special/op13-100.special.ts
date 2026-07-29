import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13100SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-100-special',
  cardId: 'OP13-100',
  resolve(event, engine) {
    // TODO: [Your Turn] [Once Per Turn] This effect can be activated when you play a Character with a [Trigger]. Give up to 2 rested DON!! cards to 1 of your Leader or Character cards.
  },
};
