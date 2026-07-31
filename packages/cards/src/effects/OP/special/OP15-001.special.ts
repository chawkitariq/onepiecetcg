import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import {
  createOncePerTurnKey,
  patchSpecialHandlerCardStatus,
} from '../../special-handler-utils.js';

/**
 * OP15-001 "Krieg"
 * [Activate: Main] [Once Per Turn] Rest up to 1 of your opponent's Characters
 * that has 2 or more DON!! cards given.
 */
export const op15001SpecialHandler: SpecialHandlerDefinition = {
  id: 'op15-001-special',
  cardId: 'OP15-001',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;

    const turn = engine.state.turn;

    if (
      engine.hasResolvedOncePerTurnKey(
        createOncePerTurnKey(event.sourceInstanceId, event.sourceCardId, turn),
      )
    )
      return;

    const eligible = engine
      .getCards(
        {
          player: 'opponent',
          zones: ['characters'],
          filter: { cardCategory: ['Character'] },
          count: { kind: 'any' },
        },
        event.playerSessionId,
      )
      .filter((c: any) => c.attachedDon >= 2);

    if (eligible.length === 0) return;

    engine.markResolvedOncePerTurnKey(
      createOncePerTurnKey(event.sourceInstanceId, event.sourceCardId, turn),
    );

    engine.chooseCards(
      `${event.sourceInstanceId}:op15-001:rest`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      '[Krieg] Rest up to 1 opponent Character with 2+ DON!! given:',
      {
        player: 'opponent',
        zones: ['characters'],
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (cards) => {
        const opponentId = engine.getOpponentSessionId(event.playerSessionId);
        for (const card of cards) {
          patchSpecialHandlerCardStatus(engine, card, { rested: true });
        }
        engine.syncPlayer(event.playerSessionId);
        if (opponentId) engine.syncPlayer(opponentId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
