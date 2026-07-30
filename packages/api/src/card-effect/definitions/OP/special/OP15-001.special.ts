import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  createOncePerTurnKey,
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from '../../special-handler-utils';

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

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const turn = host.state.turn;

    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        event.sourceCardId,
        turn,
      )
    )
      return;

    const eligible = host
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

    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      event.sourceCardId,
      turn,
    );

    decisions.chooseCards(
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
        const opponentId = host.getOpponentSessionId(event.playerSessionId);
        for (const card of cards) {
          card.rested = true;
        }
        host.syncPlayer(event.playerSessionId);
        if (opponentId) host.syncPlayer(opponentId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
