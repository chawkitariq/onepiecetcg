import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op13001SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-001-special',
  cardId: 'OP13-001',
  resolve(event, engine) {
    // TODO: [DON!! x1] [On Your Opponent's Attack] If you have 5 or less active DON!! cards, you may rest any number of your DON!! cards. For every DON!! card rested this way, this Leader or up to 1 of your "Straw Hat Crew" type Characters gains +2000 power during this battle.
  },
};
