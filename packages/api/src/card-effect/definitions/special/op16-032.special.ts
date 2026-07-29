import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op16032SpecialHandler: SpecialHandlerDefinition = {
  id: 'op16-032-cannot-be-rested',
  cardId: 'OP16-032',
  resolve(_event, _engine) {
    // TODO: Implement special handler for OP16-032
    // [On Play] Up to 1 of your opponent's Characters other than [Monkey.D.Luffy]
    // cannot be rested until the end of your opponent's next End Phase.
  },
};
