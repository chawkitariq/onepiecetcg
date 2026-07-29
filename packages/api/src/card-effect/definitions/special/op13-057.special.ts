import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13057SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-057-special',
  cardId: 'OP13-057',
  resolve(event, engine) {
    // TODO: [Main] You may rest 1 of your DON!! cards: If you have 1 or less Life cards, your opponent cannot activate [Blocker] whenever your Leader attacks during this turn.
    // TODO: [Counter] Your Leader gains +3000 power during this battle.
  },
};
