import type {
  DuelCard,
  DuelLogLevel,
  DuelPlayer,
  DuelState,
} from '@onepiecetcg/shared';
import type {
  DuelEngineEffectBoundary,
  DuelRoomCharacterKoDeps,
} from '@onepiecetcg/duel-engine';
import type { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';

/**
 * Input required to build the KO dependencies for one duel-state scope.
 */
export type CreateDuelRoomCharacterKoDepsInput = {
  state: DuelState;
  effectBoundary: DuelEngineEffectBoundary | DuelRoomEffectBoundary;
  addLog: (
    message: string,
    level?: DuelLogLevel,
    actorSessionId?: string,
  ) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
};

/**
 * Creates the KO dependency bundle shared by live and isolated room runtimes.
 */
export function createDuelRoomCharacterKoDeps(
  input: CreateDuelRoomCharacterKoDepsInput,
): DuelRoomCharacterKoDeps {
  return {
    state: input.state,
    effectBoundary: input.effectBoundary,
    addLog: (message, level, actorSessionId) =>
      input.addLog(message, level, actorSessionId),
    unshiftIntoTrash: (player, card) => input.unshiftIntoTrash(player, card),
  };
}
