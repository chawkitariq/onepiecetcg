/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Handles Edison:
 * 1. [Activate: Main] You may trash this Character: If the number of your Life cards
 *    is equal to or less than the number of your opponent's Life cards, draw 1 card.
 *    Then, rest up to 1 of your opponent's Characters with a cost of 3 or less.
 * 2. [Trigger] Draw 1 card and rest up to 1 of your opponent's Characters with a
 *    cost of 3 or less.
 */
export const op13102SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-102-special',
  cardId: 'OP13-102',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'activateMain') {
      const player = host.getPlayer(event.playerSessionId);
      if (!player) return;

      anyEngine.decisions.pause(
        {
          id: `${event.sourceInstanceId}:op13-102:confirm`,
          effectId: 'op13-102-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[Edison] Trash this Character to draw 1 (if Life <= opponent Life) and rest opponent Character (cost 3 or less)?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          host.moveCard(source, event.playerSessionId, 'trash');

          const opponentId = host.getOpponentSessionId(event.playerSessionId);
          const opponent = opponentId ? host.getPlayer(opponentId) : undefined;

          if (
            opponent &&
            player.zones.life.length <= opponent.zones.life.length
          ) {
            const drawDef: StandardEffectDefinition = {
              id: 'op13-102-act-draw',
              text: 'Draw 1 card.',
              trigger: { type: 'activateMain' },
              actions: [{ type: 'draw', player: 'self', amount: 1 }],
            };

            engine.queueEffect(
              event.playerSessionId,
              event.sourceInstanceId,
              event.sourceCardId,
              drawDef,
            );
          }

          const restDef: StandardEffectDefinition = {
            id: 'op13-102-act-rest',
            text: 'Rest up to 1 opponent Character with cost 3 or less.',
            trigger: { type: 'activateMain' },
            actions: [
              {
                type: 'rest',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: {
                    cardCategory: ['Character'],
                    costMax: 3,
                  },
                  count: { kind: 'upTo', value: 1 },
                },
              },
            ],
          };

          engine.queueEffect(
            event.playerSessionId,
            event.sourceInstanceId,
            event.sourceCardId,
            restDef,
          );
        },
      );
      return;
    }

    if (event.type === 'trigger') {
      const triggerDef: StandardEffectDefinition = {
        id: 'op13-102-trigger',
        text: '[Trigger] Draw 1 card and rest up to 1 opponent Character with cost 3 or less.',
        trigger: { type: 'trigger' },
        actions: [
          { type: 'draw', player: 'self', amount: 1 },
          {
            type: 'rest',
            selector: {
              player: 'opponent',
              zones: ['characters'],
              filter: {
                cardCategory: ['Character'],
                costMax: 3,
              },
              count: { kind: 'upTo', value: 1 },
            },
          },
        ],
      };

      engine.queueEffect(
        event.playerSessionId,
        event.sourceInstanceId,
        event.sourceCardId,
        triggerDef,
      );
    }
  },
};
