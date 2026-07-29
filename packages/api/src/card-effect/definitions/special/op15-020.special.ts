import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15020SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-020-special',
  cardId: 'OP15-020',
  resolve(event, engine) {
    // TODO: [Main] Leader +3000 power during turn, opponent Character -8000 until end of opponent's next End Phase.
    // Then, may trash 2 from hand. If so, KO up to 1 opponent Character with 0 power or less.
  },
};
