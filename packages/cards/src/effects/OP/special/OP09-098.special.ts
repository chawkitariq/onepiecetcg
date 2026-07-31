/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP09-098 "Black Hole"
 * [Main] If your Leader has the "Blackbeard Pirates" type, negate the effect
 *   of up to 1 of your opponent's Characters during this turn. Then, if that
 *   Character has a cost of 4 or less, K.O. it.
 * [Trigger] Negate the effect of up to 1 of your opponent's Leader or
 *   Character cards during this turn.
 */
export const op09098SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-098-special',
  cardId: 'OP09-098',
  resolve(event, engine) {
    if (event.type === 'activateMain') {
      const player = engine.getPlayer(event.playerSessionId);
      if (!player) return;

      const leader = player.zones.leader;
      if (!leader || !leader.families?.includes('Blackbeard Pirates')) {
        return;
      }

      engine.chooseCards(
        `${event.sourceInstanceId}:op09-098:main`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Black Hole] Negate up to 1 of your opponent's Characters during this turn:",
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'] },
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            patchSpecialHandlerCardStatus(engine, card, {
              effectNegated: true,
            });
            if ((card.baseCost ?? card.cost ?? 0) <= 4) {
              engine.koCharacter(card.ownerSessionId, card.instanceId, 'effect');
            }
          }
          engine.syncPlayer(event.playerSessionId);
          const opponentSessionId = engine.getOpponentSessionId(
            event.playerSessionId,
          );
          if (opponentSessionId) {
            engine.syncPlayer(opponentSessionId);
          }
          engine.reapplyContinuousEffects();
        },
      );
    } else if (event.type === 'trigger') {
      engine.chooseCards(
        `${event.sourceInstanceId}:op09-098:trigger`,
        event.playerSessionId,
        { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
        event.playerSessionId,
        "[Black Hole] Negate the effect of up to 1 of your opponent's Leader or Character cards during this turn:",
        {
          player: 'opponent',
          zones: ['leader', 'characters'],
          count: { kind: 'upTo', value: 1 },
        },
        undefined,
        (cards) => {
          for (const card of cards) {
            patchSpecialHandlerCardStatus(engine, card, {
              effectNegated: true,
            });
          }
          engine.syncPlayer(event.playerSessionId);
          const opponentSessionId = engine.getOpponentSessionId(
            event.playerSessionId,
          );
          if (opponentSessionId) {
            engine.syncPlayer(opponentSessionId);
          }
          engine.reapplyContinuousEffects();
        },
      );
    }
  },
};
