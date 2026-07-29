/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * OP12-016
 * [Activate: Main] [Once Per Turn] If you have 1 or less Life, return up to 1
 * DON!! to deck: K.O. up to 1 opponent Character with cost <= 4.
 */
export const op12016SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-016-special',
  cardId: 'OP12-016',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    if (player.zones.life.length > 1) return;

    const definition: StandardEffectDefinition = {
      id: 'op12-016-activate-main',
      text: '[Activate: Main] [Once Per Turn] If you have 1 or less Life, return up to 1 DON!! to deck: K.O. up to 1 opponent Character with cost <= 4.',
      trigger: { type: 'activateMain', oncePerTurn: true },
      costs: [
        {
          type: 'moveCard',
          selector: {
            player: 'self',
            zones: ['cost'],
            count: { kind: 'upTo', value: 1 },
          },
          destinationPlayer: 'self',
          destinationZone: 'donDeck',
        },
      ],
      actions: [
        {
          type: 'ko',
          selector: {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], costMax: 4 },
            count: { kind: 'upTo', value: 1 },
          },
          reason: 'effect',
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
