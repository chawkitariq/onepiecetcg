import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op11041SpecialHandler: SpecialHandlerDefinition = {
  id: 'op11-041-special',
  cardId: 'OP11-041',
  resolve(event, engine) {
    // Nami Leader has two effects:
    // 1. Your Turn Once Per Turn when a card is removed from Life (any player's), if hand <=7, draw 1
    // 2. DON!! x1 On Opponent's Attack Once Per Turn trash 1 from hand: Leader +2000
  },
};
