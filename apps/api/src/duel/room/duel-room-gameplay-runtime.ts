import type {
  CreateDuelGameplayRuntimeInput,
  DuelGameplayRuntime,
} from '@onepiecetcg/duel-engine';
import { createDuelGameplayRuntime } from '@onepiecetcg/duel-engine';
import {
  DuelRoomEffectBoundary,
  type DuelRoomEffectBoundaryDeps,
} from '../effects/duel-room-effect-boundary';

export type DuelRoomGameplayRuntime = Omit<
  DuelGameplayRuntime,
  'effectBoundary'
> & {
  effectBoundary: DuelRoomEffectBoundary;
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
    createEffectBoundary: (deps) =>
      new DuelRoomEffectBoundary(deps as DuelRoomEffectBoundaryDeps),
  }) as DuelRoomGameplayRuntime;
}
