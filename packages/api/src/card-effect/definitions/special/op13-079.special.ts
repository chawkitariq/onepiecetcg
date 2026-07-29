import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13079SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-079-special',
  cardId: 'OP13-079',
  resolve(event, engine) {
    // TODO: Under the rules of this game, you cannot include Events with a cost of 2 or more in your deck.
    // TODO: At the start of the game, play up to 1 [Mary Geoise] type Stage card from your deck.
    // TODO: [Activate: Main] [Once Per Turn] You may trash 1 of your [Celestial Dragons] type Characters or 1 card from your hand: Draw 1 card.
  },
};
