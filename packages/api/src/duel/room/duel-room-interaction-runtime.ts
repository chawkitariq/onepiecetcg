import type { DuelState, PendingEffectDecision } from '@onepiecetcg/shared';
import type { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import type { DuelRoomGameplayRuntime } from './duel-room-gameplay-runtime';
import type {
  DuelRoomLifecycle,
  DuelRoomLifecycleState,
} from './duel-room-lifecycle';
import { adoptRoomDuelState } from './duel-room-state-copy';

export type DuelRoomPendingInteractionRuntime = {
  state: DuelState;
  lifecycle: DuelRoomLifecycle;
  gameplayRuntime: DuelRoomGameplayRuntime;
};

/**
 * Dependencies required to coordinate adoption of isolated runtimes whose
 * effect resolution is paused on a player interaction.
 */
export type DuelRoomInteractionRuntimeCoordinatorDeps = {
  liveState: DuelState;
  getPendingRuntime: () => DuelRoomPendingInteractionRuntime | null;
  setPendingRuntime: (
    runtime: DuelRoomPendingInteractionRuntime | null,
  ) => void;
  createLifecycleForState: (state: DuelState) => DuelRoomLifecycle;
  installLifecycle: (lifecycle: DuelRoomLifecycle) => void;
  createLiveGameplayRuntime: (state: DuelState) => DuelRoomGameplayRuntime;
  installGameplayRuntime: (runtime: DuelRoomGameplayRuntime) => void;
  rebuildAllClientViews: () => void;
  syncPendingEffectDecision: (decision: PendingEffectDecision | null) => void;
  captureCardKeywordSnapshot: (state: DuelState) => unknown;
  restoreCardKeywordSnapshot: (state: DuelState, snapshot: unknown) => void;
};

/**
 * Owns the adoption and resynchronization of an isolated gameplay runtime
 * while an effect decision keeps a non-serializable continuation alive.
 */
export class DuelRoomInteractionRuntimeCoordinator {
  public constructor(
    private readonly deps: DuelRoomInteractionRuntimeCoordinatorDeps,
  ) {}

  /**
   * Returns the effect boundary that is currently authoritative for player
   * interaction state.
   */
  public getActiveEffectBoundary(
    liveEffectBoundary: DuelRoomEffectBoundary,
  ): DuelRoomEffectBoundary {
    return (
      this.deps.getPendingRuntime()?.gameplayRuntime.effectBoundary ??
      liveEffectBoundary
    );
  }

  /**
   * Returns whether any player interaction is currently pending.
   */
  public hasPendingPlayerInteraction(
    liveEffectBoundary: DuelRoomEffectBoundary,
  ): boolean {
    return this.getActiveEffectBoundary(liveEffectBoundary)
      .hasPendingPlayerInteraction();
  }

  /**
   * Adopts an isolated runtime back into the live room state, either as a
   * paused pending runtime or as a fully-resolved live gameplay runtime.
   */
  public adoptRuntime(runtime: DuelRoomPendingInteractionRuntime): void {
    const lifecycleState = runtime.lifecycle.exportState();

    if (runtime.gameplayRuntime.effectBoundary.getPendingEffectDecision()) {
      this.deps.setPendingRuntime(runtime);
      adoptRoomDuelState(this.deps.liveState, runtime.state);
      const lifecycle = this.deps.createLifecycleForState(this.deps.liveState);

      lifecycle.importState(lifecycleState);
      this.deps.installLifecycle(lifecycle);
      lifecycle.recordMatchResult();
      this.deps.rebuildAllClientViews();
      this.deps.syncPendingEffectDecision(
        runtime.gameplayRuntime.effectBoundary.getPendingEffectDecision(),
      );
      return;
    }

    this.installResolvedRuntime(runtime.state, lifecycleState, () =>
      runtime.gameplayRuntime.effectBoundary.exportState(),
    );
  }

  /**
   * Reconciles the current pending runtime back into the live room after a
   * player answered the pending effect decision.
   */
  public syncPendingRuntime(): void {
    const runtime = this.deps.getPendingRuntime();

    if (!runtime) {
      return;
    }

    adoptRoomDuelState(this.deps.liveState, runtime.state);
    const lifecycle = this.deps.createLifecycleForState(this.deps.liveState);

    lifecycle.importState(runtime.lifecycle.exportState());
    this.deps.installLifecycle(lifecycle);
    lifecycle.recordMatchResult();

    const pendingDecision =
      runtime.gameplayRuntime.effectBoundary.getPendingEffectDecision();

    if (pendingDecision) {
      this.deps.rebuildAllClientViews();
      this.deps.syncPendingEffectDecision(pendingDecision);
      return;
    }

    this.installResolvedRuntime(
      runtime.state,
      runtime.lifecycle.exportState(),
      () => runtime.gameplayRuntime.effectBoundary.exportState(),
    );
  }

  private installResolvedRuntime(
    nextState: DuelState,
    lifecycleState: DuelRoomLifecycleState,
    exportEffectBoundaryState: () => ReturnType<
      DuelRoomEffectBoundary['exportState']
    >,
  ): void {
    this.deps.setPendingRuntime(null);
    adoptRoomDuelState(this.deps.liveState, nextState);
    const keywordSnapshot = this.deps.captureCardKeywordSnapshot(
      this.deps.liveState,
    );
    const liveGameplayRuntime = this.deps.createLiveGameplayRuntime(
      this.deps.liveState,
    );
    const lifecycle = this.deps.createLifecycleForState(this.deps.liveState);

    lifecycle.importState(lifecycleState);
    this.deps.installLifecycle(lifecycle);
    liveGameplayRuntime.effectBoundary.importState(exportEffectBoundaryState());
    this.deps.restoreCardKeywordSnapshot(
      this.deps.liveState,
      keywordSnapshot,
    );
    this.deps.installGameplayRuntime(liveGameplayRuntime);
    lifecycle.recordMatchResult();
    this.deps.rebuildAllClientViews();
    this.deps.syncPendingEffectDecision(
      liveGameplayRuntime.effectBoundary.getPendingEffectDecision(),
    );
  }
}
