import { DuelState } from '@onepiecetcg/shared';
import {
  createIsolatedDuelRoomGameplayRuntime,
  createLiveDuelRoomGameplayRuntime,
} from './duel-room-runtime-assembly';

function createLiveEffectBoundaryState() {
  const state = new DuelState();
  const runtime = createLiveDuelRoomGameplayRuntime({
    state,
    maxClients: 2,
    addLog: () => undefined,
    reportMainPhaseError: () => undefined,
    reportCombatError: () => undefined,
    broadcastCardView: () => undefined,
    onPendingEffectDecisionChange: () => undefined,
    shuffleCards: () => undefined,
    finalizeMatch: () => undefined,
    recordMatchResult: () => undefined,
    markMatchStarted: () => undefined,
    unshiftIntoTrash: () => undefined,
    knockOutCharacter: () => undefined,
    knockOutCharacterById: () => false,
    isProtectedFromBattleKo: () => false,
  });

  return runtime.effectBoundary.exportState();
}

describe('duel-room-runtime-assembly', () => {
  it('creates a live gameplay runtime for one authoritative state', () => {
    const state = new DuelState();
    const runtime = createLiveDuelRoomGameplayRuntime({
      state,
      maxClients: 2,
      addLog: () => undefined,
      reportMainPhaseError: () => undefined,
      reportCombatError: () => undefined,
      broadcastCardView: () => undefined,
      onPendingEffectDecisionChange: () => undefined,
      shuffleCards: () => undefined,
      finalizeMatch: () => undefined,
      recordMatchResult: () => undefined,
      markMatchStarted: () => undefined,
      unshiftIntoTrash: () => undefined,
      knockOutCharacter: () => undefined,
      knockOutCharacterById: () => false,
      isProtectedFromBattleKo: () => false,
    });

    expect(runtime.runtimeState).toBeDefined();
    expect(runtime.effectBoundary).toBeDefined();
    expect(runtime.turnEngine).toBeDefined();
  });

  it('creates an isolated gameplay runtime from live snapshots', () => {
    const liveState = new DuelState();
    const runtime = createIsolatedDuelRoomGameplayRuntime({
      liveState,
      liveLifecycleState: {
        authUserIdBySession: [],
        playerIdBySession: [],
        nextPlayerOrdinal: 1,
        matchStartedAt: null,
        matchResultRecorded: false,
      },
      liveEffectBoundaryState: createLiveEffectBoundaryState(),
      maxClients: 2,
      createLifecycleForState: () =>
        ({
          importState: () => undefined,
          finalizeMatch: () => undefined,
          recordMatchResult: () => undefined,
          markMatchStarted: () => undefined,
        }) as never,
      appendLogToState: () => undefined,
      shuffleCards: () => undefined,
      unshiftIntoTrash: () => undefined,
      knockOutCharacter: () => undefined,
      knockOutCharacterById: () => false,
      isProtectedFromBattleKo: () => false,
    });

    expect(runtime.state).not.toBe(liveState);
    expect(runtime.runtimeState).toBeDefined();
    expect(runtime.gameplayRuntime.effectBoundary.exportState()).toEqual(
      createLiveEffectBoundaryState(),
    );
  });
});
