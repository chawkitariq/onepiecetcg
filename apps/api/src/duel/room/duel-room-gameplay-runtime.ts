import type {
  CreateDuelGameplayRuntimeInput,
  DuelGameplayRuntime,
} from '@onepiecetcg/duel-engine';
import {
  createDuelGameplayRuntime,
  DuelEffectBoundary,
} from '@onepiecetcg/duel-engine';

export type DuelRoomGameplayRuntime = Omit<
  DuelGameplayRuntime,
  'effectBoundary'
> & {
  effectBoundary: DuelEffectBoundary;
};

export type CreateDuelRoomGameplayRuntimeInput = Omit<
  CreateDuelGameplayRuntimeInput,
  'createEffectBoundary'
>;

/**
 * Creates all state-scoped gameplay helpers used by the duel room.
 */
export function createDuelRoomGameplayRuntime(
  input: CreateDuelRoomGameplayRuntimeInput,
): DuelRoomGameplayRuntime {
  return createDuelGameplayRuntime({
    ...input,
    createEffectBoundary: (deps) => new DuelEffectBoundary(deps),
  }) as DuelRoomGameplayRuntime;
}
