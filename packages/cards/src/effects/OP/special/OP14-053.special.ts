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
    const player = engine.getPlayer(event.playerSessionId);
    if (!player) return;
    const opponentSessionId = engine.getOpponentSessionId(
      event.playerSessionId,
    );
    const activePlayerSessionId = engine.state.activePlayerSessionId;
    if (activePlayerSessionId !== opponentSessionId) return;
    if (player.zones.hand.length > 7) return;

    const source = engine.getCard(event.sourceInstanceId);
    const leader = player.zones.leader;
    if (!source || !leader) return;

    const diff = leader.basePower - source.basePower;
    engine.addPowerModifier(
      event.sourceInstanceId,
      event.playerSessionId,
      event.sourceInstanceId,
      diff,
      'untilStartOfYourNextTurn',
    );
    engine.reapplyContinuousEffects();
  },
};
