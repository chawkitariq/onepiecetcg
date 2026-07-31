import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';
import { patchSpecialHandlerCardStatus } from '../../special-handler-utils.js';

/**
 * OP09-080 "Thousand Sunny"
 * [Opponent's Turn] You may rest this Stage: When your "Straw Hat Crew" type
 * Character is removed from the field by your opponent's effect, add up to 1
 * DON!! card from your DON!! deck and rest it.
 *
 * NOTE: The trigger condition ("Straw Hat Crew" character removed by opponent
 * effect) fires on a different source card than this Stage. The special
 * handler mechanism only resolves for the event's sourceCardId, so this
 * handler cannot self-trigger from cross-card events. Implement the actual
 * trigger as a broadcast standard effect in op09.effects.ts that fires on
 * onKo / onBattleKo.
 *
 * This stub handler resolves the DON!! gain when the event source is the
 * Stage itself (e.g. if the duel room emits an artificial event).
 */
export const op09080SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-080-special',
  cardId: 'OP09-080',
  resolve(event, engine) {
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;

    const opponentSessionId = engine.getOpponentSessionId(
      event.playerSessionId,
    );
    const activePlayerSessionId = engine.state.activePlayerSessionId;
    if (activePlayerSessionId !== opponentSessionId) return;

    const stage = player.zones.stage;
    if (!stage || !stage.instanceId || stage.rested) return;

    engine.pauseDecision(
      {
        id: `${event.sourceInstanceId}:op09-080:rest-stage`,
        effectId: 'op09-080-special',
        effectCardId: event.sourceCardId,
        sourceInstanceId: event.sourceInstanceId,
        playerSessionId: event.playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'confirm',
          message:
            '[Thousand Sunny] Rest this Stage to add up to 1 DON!! from your DON!! deck rested?',
          optional: true,
        },
      },
      (response: { confirmed?: boolean }) => {
        if (!response.confirmed) return;
        patchSpecialHandlerCardStatus(engine, stage, { rested: true });
        engine.addDonToCost(event.playerSessionId, 1, true);
        engine.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
