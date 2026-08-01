import type {
  CreateDuelRoomIsolatedGameplayRuntimeInput as BaseCreateDuelRoomIsolatedGameplayRuntimeInput,
  DuelRoomIsolatedGameplayRuntime as BaseDuelRoomIsolatedGameplayRuntime,
} from '@onepiecetcg/duel-engine';
import {
  createDuelRoomIsolatedGameplayRuntime as createBaseDuelRoomIsolatedGameplayRuntime,
  DuelEffectBoundary,
} from '@onepiecetcg/duel-engine';
import type { DuelRoomGameplayRuntime } from './duel-room-gameplay-runtime';
import type {
  DuelRoomLifecycle,
  DuelRoomLifecycleState,
} from './duel-room-lifecycle';
export type DuelRoomIsolatedGameplayRuntime = Omit<
  BaseDuelRoomIsolatedGameplayRuntime,
  'lifecycle' | 'gameplayRuntime'
> & {
  lifecycle: DuelRoomLifecycle;
  gameplayRuntime: DuelRoomGameplayRuntime;
};

export type CreateDuelRoomIsolatedGameplayRuntimeInput = Omit<
  BaseCreateDuelRoomIsolatedGameplayRuntimeInput,
  'liveLifecycleState' | 'createLifecycleForState' | 'createEffectBoundary'
> & {
  liveLifecycleState: DuelRoomLifecycleState;
  createLifecycleForState: (
    state: import('@onepiecetcg/shared').DuelState,
  ) => DuelRoomLifecycle;
};

/**
 * Creates a detached gameplay runtime that can resolve commands without
 * mutating the live room state until adoption is explicitly requested.
 */
export function createDuelRoomIsolatedGameplayRuntime(
  input: CreateDuelRoomIsolatedGameplayRuntimeInput,
): DuelRoomIsolatedGameplayRuntime {
  return createBaseDuelRoomIsolatedGameplayRuntime({
    ...input,
    createEffectBoundary: (deps) => new DuelEffectBoundary(deps),
  }) as DuelRoomIsolatedGameplayRuntime;
}
