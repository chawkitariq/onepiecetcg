/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
} from './special-handler-utils';

/**
 * OP09-093 "Marshall.D.Teach"
 * [Blocker]
 * [Activate: Main] [Once Per Turn] If your Leader has the "Blackbeard Pirates"
 * type and this Character was played on this turn, negate the effect of up to
 * 1 of your opponent's Leader during this turn. Then, negate the effect of up
 * to 1 of your opponent's Characters and that Character cannot attack until
 * the end of your opponent's next turn.
 */
export const op09093SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-093-special',
  cardId: 'OP09-093',
  resolve(event, engine) {
    if (event.type !== 'activateMain') return;
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const decisions = anyEngine.decisions;
    const player = host.getPlayer(event.playerSessionId);
    const source = host.getCard(event.sourceInstanceId);
    if (!player || !source) return;

    const leader = player.zones.leader;
    if (!leader || !leader.families?.includes('Blackbeard Pirates')) {
      return;
    }

    if (!source.playedThisTurn) return;

    const turn = host.state.turn;
    if (
      hasResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP09-093',
        turn,
      )
    )
      return;
    markResolvedOncePerTurn(
      anyEngine,
      event.sourceInstanceId,
      'OP09-093',
      turn,
    );

    decisions.chooseCards(
      `${event.sourceInstanceId}:op09-093:negate-leader`,
      event.playerSessionId,
      { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
      event.playerSessionId,
      "[Marshall.D.Teach] Negate the effect of up to 1 of your opponent's Leader during this turn:",
      {
        player: 'opponent',
        zones: ['leader'],
        count: { kind: 'upTo', value: 1 },
      },
      undefined,
      (leaders) => {
        for (const l of leaders) {
          l.effectNegated = true;
        }
        decisions.chooseCards(
          `${event.sourceInstanceId}:op09-093:negate-character`,
          event.playerSessionId,
          { sourceInstanceId: event.sourceInstanceId, storedSelections: {} },
          event.playerSessionId,
          "[Marshall.D.Teach] Negate the effect of up to 1 of your opponent's Characters. That Character cannot attack until the end of your opponent's next turn:",
          {
            player: 'opponent',
            zones: ['characters'],
            filter: { cardCategory: ['Character'] },
            count: { kind: 'upTo', value: 1 },
          },
          undefined,
          (characters) => {
            for (const c of characters) {
              c.effectNegated = true;
              c.cannotAttack = true;
            }
            host.syncPlayer(event.playerSessionId);
            const opponentSessionId = host.getOpponentSessionId(
              event.playerSessionId,
            );
            if (opponentSessionId) {
              host.syncPlayer(opponentSessionId);
            }
            engine.reapplyContinuousEffects();
          },
        );
      },
    );
  },
};
