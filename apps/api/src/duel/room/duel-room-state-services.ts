import type {
  DuelCard,
  DuelLogLevel,
  DuelPlayer,
  DuelState,
} from '@onepiecetcg/shared';
import type {
  DuelEffectBoundary,
  DuelEngineEffectBoundary,
  DuelRoomCharacterKoDeps,
} from '@onepiecetcg/duel-engine';
import { createDuelRoomCharacterKoDeps } from './duel-room-character-ko-deps';
import type { DuelRoomLifecycle } from './duel-room-lifecycle';
import { createDuelRoomLifecycle } from './duel-room-lifecycle-factory';
import { appendDuelRoomLog } from './duel-room-log-writer';

/**
 * Dependencies required to assemble room-scoped lifecycle, logging, and KO
 * adapters for both live and isolated duel states.
 */
export type DuelRoomStateServicesDeps = {
  liveState: DuelState;
  disconnectRoom: () => Promise<void> | void;
  logLiveMessage: (message: string) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
};

/**
 * Centralizes room-level state adapters that still belong to the duel room
 * boundary: replicated logging, lifecycle creation, and KO dependency wiring.
 */
export class DuelRoomStateServices {
  public constructor(private readonly deps: DuelRoomStateServicesDeps) {}

  /**
   * Creates a lifecycle bound to either the live room state or an isolated
   * cloned state used while simulating a command.
   */
  public createLifecycleForState(
    state: DuelState,
    options?: { isolated?: boolean },
  ): DuelRoomLifecycle {
    return createDuelRoomLifecycle({
      state,
      addLog: (message, actorSessionId) =>
        options?.isolated
          ? this.appendLogToState(state, message, 'system', actorSessionId)
          : this.addLiveLog(message, 'system', actorSessionId),
      disconnectRoom: options?.isolated
        ? undefined
        : () => this.deps.disconnectRoom(),
    });
  }

  /**
   * Appends one replicated duel log entry to any duel state scope.
   */
  public appendLogToState(
    state: DuelState,
    message: string,
    level: DuelLogLevel = 'info',
    actorSessionId = '',
  ): void {
    appendDuelRoomLog(state, message, level, actorSessionId);
  }

  /**
   * Appends one replicated duel log entry to the live room state and mirrors
   * the message to the room logger.
   */
  public addLiveLog(
    message: string,
    level: DuelLogLevel = 'info',
    actorSessionId = '',
  ): void {
    appendDuelRoomLog(this.deps.liveState, message, level, actorSessionId);
    this.deps.logLiveMessage(message);
  }

  /**
   * Creates KO dependencies bound to either the live room state or an
   * isolated cloned state.
   */
  public createCharacterKoDeps(
    state: DuelState,
    effectBoundary: DuelEngineEffectBoundary | DuelEffectBoundary,
    options?: { isolated?: boolean },
  ): DuelRoomCharacterKoDeps {
    return createDuelRoomCharacterKoDeps({
      state,
      effectBoundary,
      addLog: (message, level, actorSessionId) =>
        options?.isolated
          ? this.appendLogToState(state, message, level, actorSessionId)
          : this.addLiveLog(message, level, actorSessionId),
      unshiftIntoTrash: (player, card) =>
        this.deps.unshiftIntoTrash(player, card),
    });
  }
}
