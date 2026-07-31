import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

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
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const turn = engine.state.turn;
    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, 'OP10-027', turn),
      )
    )
      return;
    if (player.zones.life.length > 6) return;
    const opponentSessionId = engine.getOpponentSessionId(event.playerSessionId);
    if (!opponentSessionId) return;
    const opponent = engine.getPlayer(opponentSessionId);
    if (!opponent) return;
    const oppLifeCount = opponent.zones.life.length;
    engine.chooseCards(
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
          engine.patchCardStatus(card.instanceId, { rested: true });
        }
        engine.markResolvedOncePerTurnKey(
          createOncePerTurnKey(event.sourceInstanceId, 'OP10-027', turn),
        );
        engine.reapplyContinuousEffects();
      },
    );
  },
};
