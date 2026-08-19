import { DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { DuelRoomLifecycle } from './duel-room-lifecycle';

function createPlayer(sessionId: string, displayName: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = displayName;
  player.deckId = `deck-${sessionId}`;
  player.zones.leader.cardId = `leader-${sessionId}`;
  return player;
}

describe('DuelRoomLifecycle', () => {
  it('registers joined authenticated users', () => {
    const lifecycle = new DuelRoomLifecycle({
      state: new DuelState(),
      addLog: jest.fn(),
      getOpponentSessionId: jest.fn(),
      disconnectRoom: jest.fn(),
    });

    expect(lifecycle.hasJoined('user-a')).toBe(false);

    lifecycle.registerPlayer('session-a', 'user-a');

    expect(lifecycle.hasJoined('user-a')).toBe(true);
  });

  it('finalizes the match by stamping replicated end metadata', () => {
    const state = new DuelState();
    const lifecycle = new DuelRoomLifecycle({
      state,
      addLog: jest.fn(),
      getOpponentSessionId: jest.fn(),
      disconnectRoom: jest.fn(),
    });

    lifecycle.finalizeMatch('life', 'session-a');

    expect(state.phase).toBe('finished');
    expect(state.endReason).toBe('life');
    expect(state.winnerSessionId).toBe('session-a');
    expect(state.finishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('forfeits the match when a player explicitly leaves an active match', async () => {
    const state = new DuelState();
    const addLog = jest.fn();
    const lifecycle = new DuelRoomLifecycle({
      state,
      addLog,
      getOpponentSessionId: (sessionId) =>
        sessionId === 'session-a' ? 'session-b' : 'session-a',
      disconnectRoom: jest.fn(),
    });
    const alice = createPlayer('session-a', 'Alice');
    const bob = createPlayer('session-b', 'Bob');
    state.players.set(alice.sessionId, alice);
    state.players.set(bob.sessionId, bob);
    state.firstPlayerSessionId = 'session-b';
    state.phase = 'main';
    lifecycle.registerPlayer('session-a', 'user-a');
    lifecycle.registerPlayer('session-b', 'user-b');
    lifecycle.markMatchStarted(new Date('2026-07-28T10:00:00.000Z'));

    lifecycle.declareForfeitIfMatchInProgress(alice);
    await Promise.resolve();
    await Promise.resolve();

    expect(state.phase).toBe('finished');
    expect(state.endReason).toBe('forfeit');
    expect(state.winnerSessionId).toBe('session-b');
    expect(addLog).toHaveBeenCalledWith(
      'Alice abandonne la partie.',
      'session-a',
    );
  });

  it('disconnects the room when the last player seat is removed', () => {
    const state = new DuelState();
    const disconnectRoom = jest.fn();
    const lifecycle = new DuelRoomLifecycle({
      state,
      addLog: jest.fn(),
      getOpponentSessionId: jest.fn(),
      disconnectRoom,
    });
    const alice = createPlayer('session-a', 'Alice');
    state.players.set(alice.sessionId, alice);
    lifecycle.registerPlayer('session-a', 'user-a');

    lifecycle.removePlayer('session-a');

    expect(state.players.size).toBe(0);
    expect(disconnectRoom).toHaveBeenCalledTimes(1);
  });

  it('exports and restores the mutable lifecycle state', () => {
    const state = new DuelState();
    const lifecycle = new DuelRoomLifecycle({
      state,
      addLog: jest.fn(),
      getOpponentSessionId: jest.fn(),
      disconnectRoom: jest.fn(),
    });

    lifecycle.registerPlayer('session-a', 'user-a');
    lifecycle.registerPlayer('session-b', 'user-b');
    lifecycle.markMatchStarted(new Date('2026-07-30T10:00:00.000Z'));

    const snapshot = lifecycle.exportState();
    const restored = new DuelRoomLifecycle({
      state: new DuelState(),
      addLog: jest.fn(),
      getOpponentSessionId: jest.fn(),
      disconnectRoom: jest.fn(),
    });

    restored.importState(snapshot);

    expect(restored.hasJoined('user-a')).toBe(true);
    expect(restored.hasJoined('user-b')).toBe(true);
    expect(restored.getPlayerId('session-a')).toBe('player-1');
    expect(restored.getPlayerId('session-b')).toBe('player-2');
    expect(restored.exportState()).toEqual(snapshot);
  });
});
