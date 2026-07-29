import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op11073SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-073-special',
  cardId: 'OP11-073',
  resolve(event, engine) {
    // Charlotte Linlin: On Opponent Attack Once Per Turn DON!! 5 -> choose cost,
    // reveal top of opponent deck. If matches, leader +2000 during turn.
    // Rush part is handled by continuous effect in main file.
  },
};
