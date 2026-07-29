import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13002SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-002-special',
  cardId: 'OP13-002',
  resolve(event, engine) {
    // TODO: [On Your Opponent's Attack] [Once Per Turn] You may trash 1 card from your hand: Give up to 1 of your opponent's Leader or Character cards 2000 power during this battle.
    // TODO: [DON!! x1] [Once Per Turn] When you take damage or your Character with 6000 base power or more is K.O.'d, draw 1 card.
  },
};
