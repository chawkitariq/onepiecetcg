/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Handles Jewelry Bonney (109):
 * 1. If this Character would be removed from the field by your opponent's effect,
 *    you may turn 1 card from the top of your Life cards face-up instead.
 * 2. [Trigger] Draw 2 cards and trash 1 card from your hand.
 */
export const op13109SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-109-special',
  cardId: 'OP13-109',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if ((event as any).type === 'wouldKoCharacter') {
      const koEvent = event as any;
      if (koEvent.targetInstanceId !== event.sourceInstanceId) return;
      if (koEvent.reason !== 'effect') return;

      const player = host.getPlayer(event.playerSessionId);
      if (!player || player.zones.life.length < 1) return;

      anyEngine.decisions.pause(
        {
          id: `${event.sourceInstanceId}:op13-109:replace`,
          effectId: 'op13-109-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Jewelry Bonney 109] Turn top Life card face-up instead of being removed?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          const topLife = player.zones.life[0];
          if (topLife) {
            topLife.faceDown = false;
            host.addLog(
              '[Jewelry Bonney 109] Top Life card turned face-up instead of being removed.',
            );
          }

          engine.reapplyContinuousEffects();
        },
      );
      return;
    }

    if (event.type === 'trigger') {
      const def: StandardEffectDefinition = {
        id: 'op13-109-trigger',
        text: '[Trigger] Draw 2 cards and trash 1 card from your hand.',
        trigger: { type: 'trigger' },
        actions: [
          { type: 'draw', player: 'self', amount: 2 },
          {
            type: 'moveCard',
            selector: {
              player: 'self',
              zones: ['hand'],
              count: { kind: 'exact', value: 1 },
            },
            destinationPlayer: 'self',
            destinationZone: 'trash',
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        def,
      );
    }
  },
};
