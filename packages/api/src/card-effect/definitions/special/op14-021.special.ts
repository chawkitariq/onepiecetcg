/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { scheduleTurnEndEffect } from './special-handler-utils';

/**
 * OP14-021 Issho
 * [Your Turn] When this Character becomes rested, you may add 1 card from the
 * top of your Life cards to your hand. If you do, up to 1 of your opponent's
 * rested Characters or Stages will not become active in your opponent's next
 * Refresh Phase.
 */
export const op14021SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-021-special',
  cardId: 'OP14-021',
  resolve(event, engine) {
    if (event.type !== 'onPlay' && event.type !== 'onDonAttached') return;
    const anyEngine = engine as any;
    const { host, decisions } = anyEngine;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const activePlayerSessionId = host.state.activePlayerSessionId;
    if (activePlayerSessionId !== event.playerSessionId) return;

    decisions.pause(
      {
        id: `${event.sourceInstanceId}:op14-021:life-to-hand`,
        effectId: 'op14-021-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Issho] Add 1 card from the top of your Life cards to your hand?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;

        const lifeTop = host.getCards(
          {
            player: 'self',
            zones: ['life'],
            count: { kind: 'exact', value: 1 },
          },
          event.playerSessionId,
        );
        if (!lifeTop.length) return;
        host.moveCard(lifeTop[0], event.playerSessionId, 'hand');

        decisions.chooseCards(
          `${event.sourceInstanceId}:op14-021:select-rested`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          "[Issho] Select up to 1 of your opponent's rested Characters or Stage to skip their next Refresh Phase:",
          {
            player: 'opponent',
            zones: ['characters', 'stage'],
            filter: { rested: true },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (selected) => {
            for (const card of selected) {
              card.skipNextRefreshPhases =
                (card.skipNextRefreshPhases || 0) + 1;
            }
            host.syncPlayer(event.playerSessionId);
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
