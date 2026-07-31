import { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import { createDuelRoomRuntimeBootstrap } from './duel-room-runtime-bootstrap';

describe('duel-room-runtime-bootstrap', () => {
  it('creates the room-scoped runtime services', () => {
    const state = new DuelState();

    const bootstrap = createDuelRoomRuntimeBootstrap({
      state,
      roomId: 'room-1',
      getClients: () => [],
      broadcast: () => undefined,
      getPendingRuntime: () => null,
      setPendingRuntime: () => undefined,
      getActiveEffectDecision: () => null,
      createLifecycleForState: () =>
        ({
          exportState: () => ({
            authUserIdBySession: [],
            playerIdBySession: [],
            nextPlayerOrdinal: 1,
            matchStartedAt: null,
            matchResultRecorded: false,
          }),
          importState: () => undefined,
          recordMatchResult: () => undefined,
          hasJoined: () => false,
          registerPlayer: () => 'player-1',
          getPlayerId: () => 'player-1',
          listParticipants: () => [],
          markMatchStarted: () => undefined,
          finalizeMatch: () => undefined,
          declareForfeitIfMatchInProgress: () => undefined,
          removePlayer: () => undefined,
        }) as never,
      createLiveGameplayRuntime: () =>
        ({
          effectBoundary: {
            getPendingEffectDecision: () => null,
            importState: () => undefined,
          },
        }) as never,
      createIsolatedGameplayRuntime: () =>
        ({
          state,
          lifecycle: {
            exportState: () => ({
              authUserIdBySession: [],
              playerIdBySession: [],
              nextPlayerOrdinal: 1,
              matchStartedAt: null,
              matchResultRecorded: false,
            }),
          },
          gameplayRuntime: {
            effectBoundary: {
              getPendingEffectDecision: () => null,
              exportState: () => ({}),
            },
          },
        }) as never,
      installLifecycle: () => undefined,
      installGameplayRuntime: () => undefined,
      adoptRuntime: () => undefined,
      hasPendingPlayerInteraction: () => false,
      persistRoomEventsOrThrow: async () => undefined,
      requirePlayerId: (sessionId) => `player:${sessionId}`,
      listParticipants: () => [],
      rebuildAllClientViews: () => undefined,
      syncZoneCounts: (_player: DuelPlayer) => undefined,
      broadcastCardView: (_card: DuelCard) => undefined,
      sendActionError: () => undefined,
      logSystemMessage: () => undefined,
      reportMatchResultError: () => undefined,
      reportPersistError: () => undefined,
      disconnectRoom: () => undefined,
      createCommandId: () => 'command-1',
      createActionId: () => 'action-1',
    });

    expect(bootstrap.lifecycle).toBeDefined();
    expect(bootstrap.runtimeState).toBeDefined();
    expect(bootstrap.notifier).toBeDefined();
    expect(bootstrap.eventOutbox).toBeDefined();
    expect(bootstrap.isolatedCommandRunner).toBeDefined();
    expect(bootstrap.interactionRuntimeCoordinator).toBeDefined();
    expect(bootstrap.seatBootstrap).toBeDefined();
  });
});
