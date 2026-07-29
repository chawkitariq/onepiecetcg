import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15046SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-046-special',
  cardId: 'OP15-046',
  resolve(event, engine) {
    // TODO: [On Play] If Leader has {Dressrosa} type, activate up to 1 {Dressrosa} type Event from hand.
  },
};
