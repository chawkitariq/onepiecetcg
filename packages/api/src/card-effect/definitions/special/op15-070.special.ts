import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15070SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-070-special',
  cardId: 'OP15-070',
  resolve(event, engine) {
    // TODO: [Opponent's Turn] All your [Shura] cards' base power and this Character's base power become 6000.
  },
};
