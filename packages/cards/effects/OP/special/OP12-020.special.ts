/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { createOncePerTurnKey } from '../../special-handler-utils.js';

/**
 * OP12-020
 * [DON!! x3] [Activate: Main] [Once Per Turn] If this Leader battles opp
 * Character this turn, at end of turn K.O. that Character.
 *
 * Battle tracking reads engine.state.combat after the `whenAttacking` event
 * fires to determine the target's instanceId and target type.
 */
export const op12020SpecialHandler: SpecialHandlerDefinition = {
  id: 'op12-020-special',
  cardId: 'OP12-020',
  resolve(event, engine) {
    /* ── Activate: Main — arm the delayed KO ───────────────────────── */

    if (event.type === 'activateMain') {
      const source = engine.getCard(event.sourceInstanceId);
      if (!source) return;

      if (source.attachedDon < 3) return;

      const turn = engine.state.turn;
      const oncePerTurnKey = createOncePerTurnKey(
        event.sourceInstanceId,
        'OP12-020',
        turn,
      );
      if (engine.hasResolvedOncePerTurnKey(oncePerTurnKey)) return;
      engine.markResolvedOncePerTurnKey(oncePerTurnKey);

      source['op12-020:battleTargetInstanceId'] = null;

      engine.scheduleTurnEndEffect(event.sourceInstanceId, () => {
        const targetId: string | null =
          source['op12-020:battleTargetInstanceId'];
        if (targetId) {
          engine.koCharacter(event.playerSessionId, targetId, 'effect');
          engine.syncPlayer(event.playerSessionId);
          const opponentId = engine.getOpponentSessionId(
            event.playerSessionId,
          );
          if (opponentId) engine.syncPlayer(opponentId);
          engine.reapplyContinuousEffects();
        }
        source['op12-020:battleTargetInstanceId'] = undefined;
      });
      return;
    }

    /* ── When Attacking — record the battle target if effect is active ── */

    if (event.type !== 'whenAttacking') return;

    const source = engine.getCard(event.sourceInstanceId);
    if (!source) return;
    if (source['op12-020:battleTargetInstanceId'] === undefined) return;

    const combat = engine.state.combat;
    if (!combat) return;
    if (combat.targetType !== 'character') return;
    if (!combat.targetInstanceId) return;

    source['op12-020:battleTargetInstanceId'] = combat.targetInstanceId;
  },
};
