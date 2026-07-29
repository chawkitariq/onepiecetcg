import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13064SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-064-special',
  cardId: 'OP13-064',
  resolve(event, engine) {
    // TODO: Your Leader and all of your Characters that do not have a type including "Roger Pirates" have their effects negated.
    // TODO: [On Play] DON!! 3: Your Leader gains +2000 power until the end of your opponent's next End Phase. Then, give all of your opponent's Characters -2000 power until the end of your opponent's next End Phase.
  },
};
