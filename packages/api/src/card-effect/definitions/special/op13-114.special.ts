import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13114SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-114-special',
  cardId: 'OP13-114',
  resolve(event, engine) {
    // TODO: [On Play]/[When Attacking] You may turn 1 card from the top of your Life cards face-up: Give up to 1 of your opponent's Characters 2000 power during this turn.
    // TODO: [Trigger] You may trash 1 card from your hand: Play this card.
  },
};
