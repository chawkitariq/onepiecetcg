/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { StandardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';

/**
 * Handles S-Snake:
 * 1. [On Play]/[When Attacking] You may turn 1 card from the top of your Life cards
 *    face-up: Give up to 1 of your opponent's Characters -2000 power during this turn.
 * 2. [Trigger] You may trash 1 card from your hand: Play this card.
 */
export const op13114SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-114-special',
  cardId: 'OP13-114',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    if (event.type === 'onPlay' || event.type === 'whenAttacking') {
      const player = host.getPlayer(event.playerSessionId);
      if (!player || player.zones.life.length < 1) return;

      anyEngine.decisions.pause(
        {
          id: `${event.sourceInstanceId}:op13-114:confirm`,
          effectId: 'op13-114-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message:
              '[S-Snake] Turn top Life card face-up to give opponent Character -2000 power?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          const topLife = player.zones.life[0];
          if (topLife) {
            topLife.faceDown = false;
            host.addLog('[S-Snake] Top Life card turned face-up.');
          }

          const def: StandardEffectDefinition = {
            id: 'op13-114-debuff',
            text: 'Give up to 1 opponent Character -2000 power during this turn.',
            trigger: { type: event.type },
            actions: [
              {
                type: 'modifyPower',
                selector: {
                  player: 'opponent',
                  zones: ['characters'],
                  filter: { cardCategory: ['Character'] },
                  count: { kind: 'upTo', value: 1 },
                },
                amount: -2000,
                duration: { type: 'untilEndOfTurn' },
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
      const player = host.getPlayer(event.playerSessionId);
      if (!player || player.zones.hand.length < 1) return;

      anyEngine.decisions.pause(
        {
          id: `${event.sourceInstanceId}:op13-114:trigger-confirm`,
          effectId: 'op13-114-special',
          effectCardId: event.sourceCardId,
          sourceInstanceId: event.sourceInstanceId,
          playerSessionId: event.playerSessionId,
          createdAt: new Date().toISOString(),
          prompt: {
            type: 'confirm',
            message: '[S-Snake] Trash 1 card from hand to play this card?',
            optional: true,
          },
        },
        (response: { confirmed?: boolean }) => {
          if (!response.confirmed) return;

          anyEngine.decisions.chooseCards(
            `${event.sourceInstanceId}:op13-114:trigger-trash`,
            event.playerSessionId,
            {
              sourceInstanceId: event.sourceInstanceId,
              storedSelections: {},
            },
            event.playerSessionId,
            '[S-Snake] Choose 1 card from hand to trash:',
            {
              player: 'self',
              zones: ['hand'],
              count: { kind: 'exact', value: 1 },
            },
            undefined,
            (trashed) => {
              for (const card of trashed) {
                host.moveCard(card, event.playerSessionId, 'trash');
              }

              const def: StandardEffectDefinition = {
                id: 'op13-114-trigger-play',
                text: '[Trigger] Play this card.',
                trigger: { type: 'trigger' },
                actions: [
                  {
                    type: 'play',
                    selector: {
                      player: 'self',
                      zones: ['hand', 'trash'],
                      filter: { cardCategory: ['Character'] },
                      count: { kind: 'exact', value: 1 },
                    },
                    destination: 'characters',
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
        },
      );
    }
  },
};
