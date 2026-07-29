import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13082SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-082-special',
  cardId: 'OP13-082',
  resolve(event, engine) {
    // TODO: [Activate: Main] If your Leader is [Imu], you may rest 1 of your DON!! cards and trash 1 card from your hand: Trash all of your Characters and play up to 5 "Five Elders" type Character cards with 5000 power and different card names from your trash.
  },
};
