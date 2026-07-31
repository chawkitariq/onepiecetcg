/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * Handles Gum-Gum Dawn Stamp:
 * 1. [Main] You may turn 1 card from the top of your Life cards face-up: K.O. up to 1
 *    of your opponent's Characters with a base cost of 6 or less.
 * 2. [Trigger] Draw 1 card.
 */
export const op13117SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-117-special',
  cardId: 'OP13-117',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'activateMain') {
      const player = host.getPlayer(event.playerSessionId);
      if (!player || player.zones.life.length < 1) return;

      anyEngine.decisions.pause(
        {
          id: `${event.sourceInstanceId}:op13-117:confirm`,
          effectId: 'op13-117-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Gum-Gum Dawn Stamp] Turn top Life card face-up to K.O. opponent Character (base cost 6 or less)?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          const topLife = player.zones.life[0];
          if (topLife) {
            topLife.faceDown = false;
            host.addLog('[Gum-Gum Dawn Stamp] Top Life card turned face-up.');
          }

          const def: StandardEffectDefinition = {
            id: 'op13-117-main-ko',
            text: 'K.O. up to 1 opponent Character with base cost 6 or less.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'ko',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 6,
                  },
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
            def,
          );
        },
      );
      return;
    }

    if (event.type === 'trigger') {
      const def: StandardEffectDefinition = {
        id: 'op13-117-trigger-draw',
        text: '[Trigger] Draw 1 card.',
        trigger: { type: 'trigger' },
        actions: [{ type: 'draw', player: 'self', amount: 1 }],
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
