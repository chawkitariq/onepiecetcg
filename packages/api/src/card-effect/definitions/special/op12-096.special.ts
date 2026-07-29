import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP12-096
 * [Activate: Main] [Once Per Turn] Trash 2 from hand: Set up to 2 DON!! active.
 */
export const op12096SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-096-special',
  cardId: 'OP12-096',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const definition: StandardEffectDefinition = {
      id: 'op12-096-activate-main',
      text: '[Activate: Main] [Once Per Turn] Trash 2 from hand: Set up to 2 DON!! active.',
      trigger: { type: 'activateMain', oncePerTurn: true },
      costs: [
        {
          type: 'trashFromHand',
          selector: {
            player: 'self',
            zones: ['hand'],
            count: { kind: 'exact', value: 2 },
          },
        },
      ],
      actions: [
        {
          type: 'addDon',
          player: 'self',
          amount: 2,
          rested: false,
        },
      ],
    };

    engine.queueEffect(
      event.playerSessionId,
      event.sourceInstanceId,
      event.sourceCardId,
      definition,
    );
  },
};
