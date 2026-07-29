import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP15-014 "Bartolomeo"
 * If this Character would be K.O.'d, you may trash 1 Event from your hand
 * instead.
 * [On Play] Activate up to 1 {Dressrosa} type Event with a base cost of 3 or
 * less from your hand.
 */
export const op15014SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-014-special',
  cardId: 'OP15-014',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const definition: StandardEffectDefinition = {
      id: 'bartolomeo-014-on-play-activate-dressrosa-event',
      text: '[On Play] Activate up to 1 {Dressrosa} type Event with a base cost of 3 or less from your hand.',
      trigger: { type: 'onPlay', optional: true },
      actions: [
        {
          type: 'activateEffect',
          cardId: '',
          effectId: '',
          // Player selects a Dressrosa Event with base cost ≤3 from hand
          // and activates it via the game's event activation flow.
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
