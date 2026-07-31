import type { DuelEndReason } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/shared';

/**
 * OP09-118 "Gol.D.Roger"
 * [Rush] (This card can attack on the turn in which it is played.)
 * When your opponent activates [Blocker], if either you or your opponent has
 * 0 Life cards, you win the game.
 *
 * NOTE: [Rush] is a keyword handled structurally by the game engine.
 *
 * The win condition requires the `onBlock` event to fire with Gol.D.Roger as
 * the source card (or `onBlock` to be broadcast to all in-play cards). As of
 * this writing, the combat engine emits `onBlock` with the blocker card as
 * source and `onBlock` is not in `shouldBroadcastTriggerToOtherCards`, so
 * this handler will not fire on blocker declaration without a duel-room-level
 * change. Once that plumbing is in place, this handler resolves the win check.
 */
export const op09118SpecialHandler: SpecialHandlerDefinition = {
  id: 'op09-118-special',
  cardId: 'OP09-118',
  resolve(event, engine) {
    if (event.type !== 'onBlock') return;

    const player = engine.getPlayer(event.playerSessionId);
    const opponentSessionId = engine.getOpponentSessionId(
      event.playerSessionId,
    );
    const opponent = opponentSessionId
      ? engine.getPlayer(opponentSessionId)
      : undefined;

    if (!player || !opponent) return;

    if (player.zones.life.length !== 0 && opponent.zones.life.length !== 0) {
      return;
    }

    engine.state.winnerSessionId = event.playerSessionId;
    engine.state.endReason = 'effect' as DuelEndReason;
    engine.state.phase = 'finished';
    engine.addLog(
      `${player.displayName} wins the game with Gol.D.Roger's effect!`,
    );
    engine.syncPlayer(event.playerSessionId);
    if (opponentSessionId) {
      engine.syncPlayer(opponentSessionId);
    }
  },
};
