/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

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
    const anyEngine = engine as any;
    const host = anyEngine.host;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;

    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    const activePlayerSessionId = host.state.activePlayerSessionId;
    if (activePlayerSessionId !== opponentSessionId) return;

    const stage = player.zones.stage;
    if (!stage || !stage.instanceId || stage.rested) return;

    anyEngine.decisions.pause(
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
        stage.rested = true;
        host.addDonToCost(event.playerSessionId, 1, true);
        host.syncPlayer(event.playerSessionId);
        engine.reapplyContinuousEffects();
      },
    );
  },
};
