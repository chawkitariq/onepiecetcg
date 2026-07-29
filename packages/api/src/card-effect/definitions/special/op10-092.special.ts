import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op10092SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-092-special',
  cardId: 'OP10-092',
  resolve(event, engine) {
    // TODO: Implement special handler for OP10-092
    // [Activate: Main] [Once Per Turn] Place 2 Thriller Bark Pirates from trash at bottom of deck:
    // Character other than Perona gains +2000 power this turn
  },
};
