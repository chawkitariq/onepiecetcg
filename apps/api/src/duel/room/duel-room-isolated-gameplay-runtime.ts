import type { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import type {
  CreateDuelRoomIsolatedGameplayRuntimeInput as BaseCreateDuelRoomIsolatedGameplayRuntimeInput,
  DuelRoomIsolatedGameplayRuntime as BaseDuelRoomIsolatedGameplayRuntime,
} from '@onepiecetcg/duel-engine';
import { createDuelRoomIsolatedGameplayRuntime as createBaseDuelRoomIsolatedGameplayRuntime } from '@onepiecetcg/duel-engine';
import type { DuelRoomGameplayRuntime } from './duel-room-gameplay-runtime';
import type {
  DuelRoomLifecycle,
  DuelRoomLifecycleState,
} from './duel-room-lifecycle';
import { DuelRoomEffectBoundary as LocalDuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import type { DuelRoomEffectBoundaryDeps } from '../effects/duel-room-effect-boundary';

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
    createEffectBoundary: (deps) => new LocalDuelRoomEffectBoundary(deps),
  }) as DuelRoomIsolatedGameplayRuntime;
}
