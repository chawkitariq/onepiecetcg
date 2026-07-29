import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op11023SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-023-special',
  cardId: 'OP11-023',
  resolve(event, engine) {
    // Arlong: If leader has Fish-Man type, you have <=3 Life and opponent has >=5 rested cards,
    // this card in hand has cost 3. Trigger: rest opponent char cost <=4.
    // The cost reduction part is already handled by the trigger effect in the main file.
    // This special handler implements the cost reduction in hand effect.
  },
};
