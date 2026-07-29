import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15071SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-071-special',
  cardId: 'OP15-071',
  resolve(event, engine) {
    // TODO: [Opponent's Turn] All your [Ohm] cards' base power and this Character's base power become 6000.
  },
};
