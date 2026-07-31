/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils.js';

/**
 * OP10-027 (Kin'emon)
 * [Activate: Main] [Once Per Turn] If you have 6 or less Life cards,
 * rest up to 1 of your opponent's Characters with a cost less than or
 * equal to the number of your opponent's Life cards.
 */
export const op10027SpecialHandler: SpecialHandlerDefinition = {
  id: 'op10-027-special',
  cardId: 'OP10-027',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP10-027',
        turn,
      )
    )
      return;
    if (player.zones.life.length > 6) return;
    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const opponent = host.getPlayer(opponentSessionId);
    if (!opponent) return;
    const oppLifeCount = opponent.zones.life.length;
    decisions.chooseCards(
      `${event.sourceInstanceId}:op10-027:rest-char`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      `Rest 1 opponent Character with cost <= ${oppLifeCount}:`,
      {
        player: 'opponent',
        zones: ['characters'],
        filter: { cardCategory: ['Character'], costMax: oppLifeCount },
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        for (const card of cards) {
          host.restCard(card);
        }
        markResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'OP10-027',
          turn,
        );
        engine.reapplyContinuousEffects();
      },
    );
  },
};
