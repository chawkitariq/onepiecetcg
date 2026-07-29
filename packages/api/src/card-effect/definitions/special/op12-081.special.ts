import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op12081SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-081-special',
  cardId: 'OP12-081',
  resolve(event, engine) {
    // TODO: Implement special handler for OP12-081
    // When this Leader attacks your opponent's Leader, if you have 2 or more Characters with a cost of 8 or more, draw 1 card.
    // [Once Per Turn] When your opponent plays a Character with a base cost of 8 or more, or when your opponent plays a Character
    // using a Character's effect: Your opponent adds 1 card from the top of their Life cards to their hand.
  },
};
