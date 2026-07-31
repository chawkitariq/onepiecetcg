import type { DuelState } from '@onepiecetcg/shared';
import type { StatsService } from '../../stats/stats.service';
import { DuelRoomLifecycle } from './duel-room-lifecycle';
import { DuelRoomRuntimeState } from './duel-room-runtime-state';

/**
 * Input required to create a room lifecycle bound to one duel-state scope.
 */
export type CreateDuelRoomLifecycleInput = {
  state: DuelState;
  statsService?: StatsService;
  addLog: (message: string, actorSessionId?: string) => void;
  disconnectRoom?: () => Promise<void> | void;
  reportStatsError: (error: unknown) => void;
};

/**
 * Creates a lifecycle instance for either the live room state or an isolated
 * cloned state used during command simulation.
 */
export function createDuelRoomLifecycle(
  input: CreateDuelRoomLifecycleInput,
): DuelRoomLifecycle {
  return new DuelRoomLifecycle({
    state: input.state,
    statsService: input.statsService,
    addLog: (message, actorSessionId) => input.addLog(message, actorSessionId),
    getOpponentSessionId: (sessionId) => {
      const runtimeState = new DuelRoomRuntimeState({ state: input.state });

      return runtimeState.getOpponentSessionId(sessionId);
    },
    disconnectRoom: () => input.disconnectRoom?.(),
    reportStatsError: (error) => input.reportStatsError(error),
  });
}
