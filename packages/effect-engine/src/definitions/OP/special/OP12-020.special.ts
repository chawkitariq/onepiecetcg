/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../../types/effect-registry';
import {
  hasResolvedOncePerTurn,
  markResolvedOncePerTurn,
  scheduleTurnEndEffect,
} from '../../special-handler-utils';

/**
 * OP12-020
 * [DON!! x3] [Activate: Main] [Once Per Turn] If this Leader battles opp
 * Character this turn, at end of turn K.O. that Character.
 *
 * Battle tracking reads host.state.combat after the `whenAttacking` event
 * fires to determine the target's instanceId and target type.
 */
export const op12020SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-020-special',
  cardId: 'OP12-020',
  resolve(event, engine) {
    const anyEngine = engine as any;
    const host = anyEngine.host;

    /* ── Activate: Main — arm the delayed KO ───────────────────────── */

    if (event.type === 'activateMain') {
      const source = host.getCard(event.sourceInstanceId);
      if (!source) return;

      if (source.attachedDon < 3) return;

      const turn = host.state.turn;
      if (
        hasResolvedOncePerTurn(
          anyEngine,
          event.sourceInstanceId,
          'OP12-020',
          turn,
        )
      )
        return;
      markResolvedOncePerTurn(
        anyEngine,
        event.sourceInstanceId,
        'OP12-020',
        turn,
      );

      source['op12-020:battleTargetInstanceId'] = null;

      scheduleTurnEndEffect(anyEngine, event.sourceInstanceId, () => {
        const targetId: string | null =
          source['op12-020:battleTargetInstanceId'];
        if (targetId) {
          host.koCharacter(event.playerSessionId, targetId, 'effect');
          host.syncPlayer(event.playerSessionId);
          const opponentId = host.getOpponentSessionId(event.playerSessionId);
          if (opponentId) host.syncPlayer(opponentId);
          engine.reapplyContinuousEffects();
        }
        source['op12-020:battleTargetInstanceId'] = undefined;
      });
      return;
    }

    /* ── When Attacking — record the battle target if effect is active ── */

    if (event.type !== 'whenAttacking') return;

    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;
    if (source['op12-020:battleTargetInstanceId'] === undefined) return;

    const combat = host.state.combat;
    if (!combat) return;
    if (combat.targetType !== 'character') return;
    if (!combat.targetInstanceId) return;

    source['op12-020:battleTargetInstanceId'] = combat.targetInstanceId;
  },
};
