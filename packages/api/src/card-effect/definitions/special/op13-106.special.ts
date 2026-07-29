import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13106SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-106-special',
  cardId: 'OP13-106',
  resolve(event, engine) {
    // TODO: [Opponent's Turn] When a [Trigger] activates, this Character gains [Blocker] during this turn.
    // TODO: [Trigger] Play this card.
  },
};
