import { DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { DuelRoomLifecycle } from './duel-room-lifecycle';
import { DuelRoomLeaveHandler } from './duel-room-leave-handler';

function createPlayer(sessionId: string, displayName: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = displayName;
  player.deckId = `deck-${sessionId}`;
  player.zones.leader.cardId = `leader-${sessionId}`;
  return player;
}

function createLifecycle(state: DuelState): DuelRoomLifecycle {
  return new DuelRoomLifecycle({
    state,
    addLog: jest.fn(),
    getOpponentSessionId: (sessionId) =>
      sessionId === 'session-a' ? 'session-b' : 'session-a',
    disconnectRoom: jest.fn(),
    reportStatsError: jest.fn(),
  });
}

describe('DuelRoomLeaveHandler', () => {
  it('applies a consented leave when the match is active', async () => {
    const state = new DuelState();
    const lifecycle = createLifecycle(state);
    const alice = createPlayer('session-a', 'Alice');
    const bob = createPlayer('session-b', 'Bob');
    state.players.set(alice.sessionId, alice);
    state.players.set(bob.sessionId, bob);
    state.phase = 'main';
    lifecycle.registerPlayer('session-a', 'user-a');
    lifecycle.registerPlayer('session-b', 'user-b');
    lifecycle.markMatchStarted(new Date('2026-07-31T09:00:00.000Z'));
    const rebuildAllClientViews = jest.fn();
    const syncPendingEffectDecision = jest.fn();
    const handler = new DuelRoomLeaveHandler({
      state,
      getLifecycle: () => lifecycle,
      allowReconnection: jest.fn(),
      createLifecycleForState: (targetState, options) => {
        const targetLifecycle = createLifecycle(targetState);
        if (!options?.isolated) {
          throw new Error('expected isolated lifecycle');
        }
        return targetLifecycle;
      },
      appendLogToState: jest.fn(),
      addLog: jest.fn(),
      rebuildAllClientViews,
      syncPendingEffectDecision,
    });

    await handler.handleLeave({ sessionId: 'session-a' } as never, true, 120);

    expect(state.phase).toBe('finished');
    expect(state.endReason).toBe('forfeit');
    expect(state.winnerSessionId).toBe('session-b');
    expect(state.players.has('session-a')).toBe(false);
    expect(rebuildAllClientViews).toHaveBeenCalledTimes(1);
    expect(syncPendingEffectDecision).toHaveBeenCalledTimes(1);
  });

  it('marks players disconnected then reconnected when the reconnection window succeeds', async () => {
    const state = new DuelState();
    const lifecycle = createLifecycle(state);
    const alice = createPlayer('session-a', 'Alice');
    state.players.set(alice.sessionId, alice);
    const addLog = jest.fn();
    const handler = new DuelRoomLeaveHandler({
      state,
      getLifecycle: () => lifecycle,
      allowReconnection: jest.fn().mockResolvedValue(undefined),
      createLifecycleForState: jest.fn() as never,
      appendLogToState: jest.fn(),
      addLog,
      rebuildAllClientViews: jest.fn(),
      syncPendingEffectDecision: jest.fn(),
    });

    await handler.handleLeave({ sessionId: 'session-a' } as never, false, 120);

    expect(state.players.get('session-a')?.connected).toBe(true);
    expect(addLog).toHaveBeenNthCalledWith(
      1,
      'Alice est deconnecte.',
      'system',
      'session-a',
    );
    expect(addLog).toHaveBeenNthCalledWith(
      2,
      'Alice est reconnecte.',
      'system',
      'session-a',
    );
  });
});
