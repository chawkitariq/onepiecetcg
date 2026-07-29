import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP12-102
 * [On Play] Look at 5 cards from top of deck; reveal up to 1 cost 6+ and add
 * to hand. Then place rest at bottom.
 */
export const op12102SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-102-special',
  cardId: 'OP12-102',
  resolve(event, engine) {
    if (event.type !== 'onPlay') return;

    const definition: StandardEffectDefinition = {
      id: 'op12-102-on-play',
      text: '[On Play] Look at 5 cards from top of deck; reveal up to 1 cost 6+ and add to hand. Then place rest at bottom.',
      trigger: { type: 'onPlay' },
      actions: [
        {
          type: 'search',
          player: 'self',
          sourceZone: 'deck',
          amount: 5,
          filter: { costMin: 6 },
          count: { kind: 'upTo', value: 1 },
          destination: 'hand',
          restToBottom: true,
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
