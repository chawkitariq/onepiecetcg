import { DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { createDuelRoomLifecycle } from './duel-room-lifecycle-factory';

function createPlayer(sessionId: string, displayName: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = displayName;
  player.deckId = `deck-${sessionId}`;
  player.zones.leader.cardId = `leader-${sessionId}`;
  return player;
}

describe('duel-room-lifecycle-factory', () => {
  it('creates a lifecycle wired to the provided room adapters', async () => {
    const state = new DuelState();
    const alice = createPlayer('session-a', 'Alice');
    const bob = createPlayer('session-b', 'Bob');
    state.players.set(alice.sessionId, alice);
    state.players.set(bob.sessionId, bob);
    state.phase = 'main';

    const addLog = jest.fn();
    const disconnectRoom = jest.fn();
    const reportStatsError = jest.fn();
    const recordMatchResult = jest.fn().mockResolvedValue(undefined);
    const lifecycle = createDuelRoomLifecycle({
      state,
      statsService: { recordMatchResult } as never,
      addLog,
      disconnectRoom,
      reportStatsError,
    });

    lifecycle.registerPlayer('session-a', 'user-a');
    lifecycle.registerPlayer('session-b', 'user-b');
    lifecycle.markMatchStarted(new Date('2026-07-31T09:00:00.000Z'));
    lifecycle.declareForfeitIfMatchInProgress(alice);
    lifecycle.removePlayer('session-a');
    lifecycle.removePlayer('session-b');
    await Promise.resolve();
    await Promise.resolve();

    expect(state.phase).toBe('finished');
    expect(state.winnerSessionId).toBe('session-b');
    expect(addLog).toHaveBeenCalledWith(
      'Alice abandonne la partie.',
      'session-a',
    );
    expect(recordMatchResult).toHaveBeenCalledTimes(1);
    expect(disconnectRoom).toHaveBeenCalledTimes(1);
    expect(reportStatsError).not.toHaveBeenCalled();
  });

  it('tolerates isolated lifecycles without disconnect callback', () => {
    const state = new DuelState();
    const lifecycle = createDuelRoomLifecycle({
      state,
      addLog: jest.fn(),
      reportStatsError: jest.fn(),
    });
    const alice = createPlayer('session-a', 'Alice');

    state.players.set(alice.sessionId, alice);
    lifecycle.registerPlayer('session-a', 'user-a');

    expect(() => lifecycle.removePlayer('session-a')).not.toThrow();
  });
});
