import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import { DuelRoomStateServices } from './duel-room-state-services';

function createPlayer(sessionId: string, displayName: string): DuelPlayer {
  const player = new DuelPlayer();
  player.sessionId = sessionId;
  player.displayName = displayName;
  player.deckId = `deck-${sessionId}`;
  player.zones.leader.cardId = `leader-${sessionId}`;
  return player;
}

function createEffectBoundary(state: DuelState): DuelRoomEffectBoundary {
  return new DuelRoomEffectBoundary({
    state,
    addLog: () => undefined,
    onPendingEffectDecisionChange: () => undefined,
    getPlayer: () => undefined,
    getOpponentSessionId: () => '',
    getCard: () => null,
    getCards: () => [],
    playCard: () => false,
    moveCard: () => false,
    setZoneOrder: () => false,
    shuffleDeck: () => undefined,
    drawCard: () => null,
    trashTopDeckCards: () => [],
    addDonToCost: () => 0,
    attachDon: () => 0,
    returnDonToDonDeck: () => 0,
    koCharacter: () => false,
    syncPlayer: () => undefined,
    patchPlayerStatus: () => undefined,
    patchCardStatus: () => null,
    getZoneCards: () => [],
    getZoneOwnerSessionId: () => null,
    revealCard: () => undefined,
    clearTemporaryReveal: () => undefined,
    clearAllTemporaryReveals: () => undefined,
    getTopCards: () => [],
    findZone: () => null,
  });
}

describe('DuelRoomStateServices', () => {
  it('adds live logs to replicated state and forwards them to the room logger', () => {
    const liveState = new DuelState();
    const logLiveMessage = jest.fn();
    const services = new DuelRoomStateServices({
      liveState,
      disconnectRoom: jest.fn(),
      logLiveMessage,
      reportMatchResultError: jest.fn(),
      unshiftIntoTrash: jest.fn(),
    });

    services.addLiveLog('Alice joue une carte.', 'action', 'session-a');

    expect(liveState.logs).toHaveLength(1);
    expect(liveState.logs[0]?.message).toBe('Alice joue une carte.');
    expect(liveState.logs[0]?.level).toBe('action');
    expect(liveState.logs[0]?.actorSessionId).toBe('session-a');
    expect(logLiveMessage).toHaveBeenCalledWith('Alice joue une carte.');
  });

  it('creates isolated lifecycles that log into the isolated state only', async () => {
    const liveState = new DuelState();
    const isolatedState = new DuelState();
    const alice = createPlayer('session-a', 'Alice');
    const bob = createPlayer('session-b', 'Bob');
    isolatedState.players.set(alice.sessionId, alice);
    isolatedState.players.set(bob.sessionId, bob);
    isolatedState.phase = 'main';
    const logLiveMessage = jest.fn();
    const services = new DuelRoomStateServices({
      liveState,
      disconnectRoom: jest.fn(),
      logLiveMessage,
      reportMatchResultError: jest.fn(),
      unshiftIntoTrash: jest.fn(),
    });
    const lifecycle = services.createLifecycleForState(isolatedState, {
      isolated: true,
    });

    lifecycle.registerPlayer('session-a', 'user-a');
    lifecycle.registerPlayer('session-b', 'user-b');
    lifecycle.markMatchStarted(new Date('2026-07-31T09:00:00.000Z'));
    lifecycle.declareForfeitIfMatchInProgress(alice);
    await Promise.resolve();

    expect(isolatedState.phase).toBe('finished');
    expect(isolatedState.logs).toHaveLength(1);
    expect(isolatedState.logs[0]?.message).toBe('Alice abandonne la partie.');
    expect(logLiveMessage).not.toHaveBeenCalled();
    expect(liveState.logs).toHaveLength(0);
  });

  it('creates live KO deps that append logs to the live state', () => {
    const liveState = new DuelState();
    const logLiveMessage = jest.fn();
    const unshiftIntoTrash = jest.fn<void, [DuelPlayer, DuelCard]>();
    const services = new DuelRoomStateServices({
      liveState,
      disconnectRoom: jest.fn(),
      logLiveMessage,
      reportMatchResultError: jest.fn(),
      unshiftIntoTrash,
    });
    const effectBoundary = createEffectBoundary(liveState);
    const player = new DuelPlayer();
    const card = new DuelCard();
    const deps = services.createCharacterKoDeps(liveState, effectBoundary);

    deps.addLog('KO.', 'effect', 'session-a');
    deps.unshiftIntoTrash(player, card);

    expect(liveState.logs).toHaveLength(1);
    expect(liveState.logs[0]?.message).toBe('KO.');
    expect(logLiveMessage).toHaveBeenCalledWith('KO.');
    expect(unshiftIntoTrash).toHaveBeenCalledWith(player, card);
  });
});
