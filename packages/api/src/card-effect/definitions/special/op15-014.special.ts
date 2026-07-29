import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15014SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-014-special',
  cardId: 'OP15-014',
  resolve(event, engine) {
    // TODO: [On Play] Activate up to 1 {Dressrosa} type Event with base cost 3 or less from hand.
  },
};
