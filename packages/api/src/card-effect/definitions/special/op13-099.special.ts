import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13099SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-099-special',
  cardId: 'OP13-099',
  resolve(event, engine) {
    // TODO: [Your Turn] If you have 19 or more cards in your trash, your Leader gains +1000 power.
    // TODO: [Activate: Main] You may rest this card and 3 of your DON!! cards: Play up to 1 black "Five Elders" type Character card with a cost equal to or less than the number of DON!! cards on your field from your hand.
  },
};
