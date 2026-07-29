import type { SpecialHandlerDefinition } from '../../types/effect-registry';

export const op15086SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-086-special',
  cardId: 'OP15-086',
  resolve(event, engine) {
    // TODO: [On Play] If Leader has {Straw Hat Crew} type, play up to 1 {Straw Hat Crew} Character with cost 7 or less from trash.
    // That Character gains [Rush] during this turn.
  },
};
