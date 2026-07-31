import type { DuelState } from '@onepiecetcg/shared';
import type { DuelCombatEngine } from '../game-engine/duel-combat-engine';
import type { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import type { DuelRoomGameplayRuntime } from './duel-room-gameplay-runtime';
import type { DuelRoomIsolatedGameplayRuntime } from './duel-room-isolated-gameplay-runtime';
import type { DuelRoomRuntimeState } from './duel-room-runtime-state';

/**
 * Dependencies required to track the currently installed live gameplay runtime
 * and resolve whether player interaction should use the live or pending scope.
 */
export type DuelRoomRuntimeControllerDeps = {
  liveState: DuelState;
  getPendingRuntime: () => DuelRoomIsolatedGameplayRuntime | null;
};

/**
 * The currently authoritative runtime context for an effect decision or combat
 * continuation, which may point either to the live room state or to the
 * isolated runtime paused on a pending interaction.
 */
export type DuelRoomActiveRuntimeContext = {
  state: DuelState;
  runtimeState: DuelRoomRuntimeState;
  effectBoundary: DuelRoomEffectBoundary;
  combatEngine: DuelCombatEngine;
};

/**
 * Owns the installed live gameplay runtime and resolves the active runtime
 * scope while isolated interaction continuations are pending.
 */
export class DuelRoomRuntimeController {
  private gameplayRuntime: DuelRoomGameplayRuntime | null = null;

  public constructor(private readonly deps: DuelRoomRuntimeControllerDeps) {}

  /**
   * Installs the currently authoritative live gameplay runtime.
   */
  public installGameplayRuntime(runtime: DuelRoomGameplayRuntime): void {
    this.gameplayRuntime = runtime;
  }

  /**
   * Returns the installed live gameplay runtime.
   */
  public getGameplayRuntime(): DuelRoomGameplayRuntime {
    if (!this.gameplayRuntime) {
      throw new Error('Gameplay runtime is not installed');
    }

    return this.gameplayRuntime;
  }

  /**
   * Returns the installed live runtime-state helper.
   */
  public getRuntimeState(): DuelRoomRuntimeState {
    return this.getGameplayRuntime().runtimeState;
  }

  /**
   * Returns the effect boundary currently authoritative for player
   * interactions.
   */
  public getActiveEffectBoundary(): DuelRoomEffectBoundary {
    return (
      this.deps.getPendingRuntime()?.gameplayRuntime.effectBoundary ??
      this.getGameplayRuntime().effectBoundary
    );
  }

  /**
   * Returns whether any player interaction is currently pending.
   */
  public hasPendingPlayerInteraction(): boolean {
    return this.getActiveEffectBoundary().hasPendingPlayerInteraction();
  }

  /**
   * Returns the live-or-pending runtime context that should answer effect
   * decisions and continue combat resolution.
   */
  public getActiveRuntimeContext(): DuelRoomActiveRuntimeContext {
    const pendingRuntime = this.deps.getPendingRuntime();

    if (pendingRuntime) {
      return {
        state: pendingRuntime.state,
        runtimeState: pendingRuntime.runtimeState,
        effectBoundary: pendingRuntime.gameplayRuntime.effectBoundary,
        combatEngine: pendingRuntime.gameplayRuntime.combatEngine,
      };
    }

    return {
      state: this.deps.liveState,
      runtimeState: this.getGameplayRuntime().runtimeState,
      effectBoundary: this.getGameplayRuntime().effectBoundary,
      combatEngine: this.getGameplayRuntime().combatEngine,
    };
  }
}
