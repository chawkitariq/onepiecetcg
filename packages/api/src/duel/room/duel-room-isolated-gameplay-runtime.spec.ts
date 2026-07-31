import { DuelState } from '@onepiecetcg/shared';
import { createDuelRoomGameplayRuntime } from './duel-room-gameplay-runtime';
import { createDuelRoomIsolatedGameplayRuntime } from './duel-room-isolated-gameplay-runtime';

function createLiveEffectBoundaryState() {
  const state = new DuelState();
  const runtime = createDuelRoomGameplayRuntime({
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

describe('createDuelRoomIsolatedGameplayRuntime', () => {
  it('creates a detached runtime with imported lifecycle and boundary state', () => {
    const liveState = new DuelState();
    const importedLifecycleStates: unknown[] = [];
    const isolatedRuntime = createDuelRoomIsolatedGameplayRuntime({
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
          importState: (state: unknown) => {
            importedLifecycleStates.push(state);
          },
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

    expect(isolatedRuntime.state).not.toBe(liveState);
    expect(importedLifecycleStates).toHaveLength(1);
    expect(isolatedRuntime.mainPhaseErrors).toEqual([]);
    expect(isolatedRuntime.combatErrors).toEqual([]);
    expect(isolatedRuntime.gameplayRuntime.effectBoundary.exportState()).toEqual(
      createLiveEffectBoundaryState(),
    );
  });
});
