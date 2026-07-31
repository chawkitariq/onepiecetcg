/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP14-053 Vista
 * [Blocker]
 * [Opponent's Turn] If you have 7 or less cards in your hand, this
 * Character's base power becomes the same as your Leader's base power.
 */
export const op14053SpecialHandler: SpecialHandlerDefinition = {
  id: 'op14-053-special',
  cardId: 'OP14-053',
  resolve(event, engine) {
    if (event.type !== 'onPlay' && event.type !== 'onDonAttached') return;
    const anyEngine = engine as any;
    const { host } = anyEngine;
    const player = host.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = host.getOpponentSessionId(event.playerSessionId);
    const activePlayerSessionId = host.state.activePlayerSessionId;
    if (activePlayerSessionId !== opponentSessionId) return;
    if (player.zones.hand.length > 7) return;

    const source = host.getCard(event.sourceInstanceId);
    const leader = player.zones.leader;
    if (!source || !leader) return;

    const diff = leader.basePower - source.basePower;
    anyEngine.modifiers.addPowerModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      event.sourceInstanceId,
      diff,
      'untilStartOfYourNextTurn',
    );
    engine.reapplyContinuousEffects();
  },
};
