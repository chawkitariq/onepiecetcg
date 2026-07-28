import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { EffectEvent, EffectEngine } from './effect-engine';

/** Special-card handlers isolated from the generic resolver. */
export const specialEffectRegistry = new Map<
  string,
  (event: EffectEvent, engine: EffectEngine) => void
>([
  [
    'trafalgar-law-on-play',
    (event, engine) => {
      if (event.type !== 'onPlay') {
        return;
      }

      const effect: StandardEffectDefinition = {
        id: 'trafalgar-law-special',
        text: '[On Play] Return 1 of your Characters to the owner hand: play up to 1 Character card with a cost of 5 or less from your hand.',
        trigger: { type: 'onPlay' },
        actions: [
          {
            type: 'moveCard',
            selector: {
              player: 'self',
              zones: ['characters'],
              filter: { cardCategory: ['Character'] },
              count: { kind: 'exact', value: 1 },
            },
            destinationPlayer: 'self',
            destinationZone: 'hand',
          },
          {
            type: 'play',
            selector: {
              player: 'self',
              zones: ['hand'],
              filter: { cardCategory: ['Character'], costMax: 5 },
              count: { kind: 'upTo', value: 1 },
            },
            destination: 'characters',
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        effect,
      );
    },
  ],
]);
