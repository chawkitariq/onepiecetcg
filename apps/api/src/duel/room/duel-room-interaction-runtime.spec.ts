import { DuelState } from '@onepiecetcg/shared';
import { DuelRoomInteractionRuntimeCoordinator } from './duel-room-interaction-runtime';

function createPendingDecision() {
  return {
    id: 'decision-1',
    effectId: 'effect-1',
    effectCardId: 'card-1',
    sourceInstanceId: 'source-1',
    playerSessionId: 'session-a',
    createdAt: '2026-07-31T10:00:00.000Z',
    prompt: {
      type: 'confirm' as const,
      message: 'Confirm?',
      optional: true,
    },
  };
}

function createLifecycleState() {
  return {
    authUserIdBySession: [['session-a', 'user-a']] as Array<[string, string]>,
    playerIdBySession: [['session-a', 'player-1']] as Array<[string, string]>,
    nextPlayerOrdinal: 2,
    matchStartedAt: '2026-07-31T09:00:00.000Z',
    matchResultRecorded: false,
  };
}

function createFixture() {
  const liveState = new DuelState();
  let pendingRuntime: any = null;
  const installedLifecycles: unknown[] = [];
  const installedRuntimes: unknown[] = [];
  const rebuiltViews: number[] = [];
  const syncedDecisions: Array<ReturnType<
    typeof createPendingDecision
  > | null> = [];
  const importedLifecycleStates: unknown[] = [];
  const recordCalls: number[] = [];
  const importedEffectStates: unknown[] = [];
  const capturedKeywordSnapshots: unknown[] = [];
  const restoredKeywordSnapshots: unknown[] = [];

  const createLifecycleForState = () => ({
    importState: (state: unknown) => {
      importedLifecycleStates.push(state);
    },
    exportState: () => createLifecycleState(),
    recordMatchResult: () => {
      recordCalls.push(1);
    },
  });

  const createLiveGameplayRuntime = () => ({
    effectBoundary: {
      importState: (state: unknown) => {
        importedEffectStates.push(state);
      },
      getPendingEffectDecision: () => null,
    },
  });

  const coordinator = new DuelRoomInteractionRuntimeCoordinator({
    liveState,
    getPendingRuntime: () => pendingRuntime,
    setPendingRuntime: (runtime) => {
      pendingRuntime = runtime;
    },
    createLifecycleForState: createLifecycleForState as never,
    installLifecycle: (lifecycle) => {
      installedLifecycles.push(lifecycle);
    },
    createLiveGameplayRuntime: createLiveGameplayRuntime as never,
    installGameplayRuntime: (runtime) => {
      installedRuntimes.push(runtime);
    },
    rebuildAllClientViews: () => {
      rebuiltViews.push(1);
    },
    syncPendingEffectDecision: (decision) => {
      syncedDecisions.push(
        decision as ReturnType<typeof createPendingDecision> | null,
      );
    },
    captureCardKeywordSnapshot: () => {
      const snapshot = { id: 'keywords' };
      capturedKeywordSnapshots.push(snapshot);
      return snapshot;
    },
    restoreCardKeywordSnapshot: (_state, snapshot) => {
      restoredKeywordSnapshots.push(snapshot);
    },
  });

  return {
    coordinator,
    getPendingRuntime: () => pendingRuntime,
    installedLifecycles,
    installedRuntimes,
    rebuiltViews,
    syncedDecisions,
    importedLifecycleStates,
    recordCalls,
    importedEffectStates,
    capturedKeywordSnapshots,
    restoredKeywordSnapshots,
  };
}

describe('DuelRoomInteractionRuntimeCoordinator', () => {
  it('keeps an isolated runtime pending while an effect decision is unresolved', () => {
    const fixture = createFixture();
    const pendingDecision = createPendingDecision();
    const runtime = {
      state: new DuelState(),
      lifecycle: {
        exportState: () => createLifecycleState(),
      },
      gameplayRuntime: {
        effectBoundary: {
          getPendingEffectDecision: () => pendingDecision,
        },
      },
    };

    fixture.coordinator.adoptRuntime(runtime as never);

    expect(fixture.getPendingRuntime()).toBe(runtime);
    expect(fixture.installedLifecycles).toHaveLength(1);
    expect(fixture.rebuiltViews).toHaveLength(1);
    expect(fixture.syncedDecisions).toEqual([pendingDecision]);
    expect(fixture.installedRuntimes).toHaveLength(0);
  });

  it('reinstalls a live gameplay runtime once the pending decision is resolved', () => {
    const fixture = createFixture();
    const runtime = {
      state: new DuelState(),
      lifecycle: {
        exportState: () => createLifecycleState(),
      },
      gameplayRuntime: {
        effectBoundary: {
          getPendingEffectDecision: () => null,
          exportState: () => ({ queue: [] }),
        },
      },
    };

    fixture.coordinator.adoptRuntime(runtime as never);

    expect(fixture.getPendingRuntime()).toBeNull();
    expect(fixture.installedLifecycles).toHaveLength(1);
    expect(fixture.installedRuntimes).toHaveLength(1);
    expect(fixture.importedEffectStates).toEqual([{ queue: [] }]);
    expect(fixture.capturedKeywordSnapshots).toHaveLength(1);
    expect(fixture.restoredKeywordSnapshots).toEqual(
      fixture.capturedKeywordSnapshots,
    );
    expect(fixture.syncedDecisions.at(-1)).toBeNull();
    expect(fixture.recordCalls).toHaveLength(1);
  });
});
