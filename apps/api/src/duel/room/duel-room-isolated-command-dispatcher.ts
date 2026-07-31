import type {
  DuelRoomIsolatedCommandClient,
  DuelRoomIsolatedCommandFailure,
  DuelRoomIsolatedCommandRunner,
  DuelRoomIsolatedCommandSuccess,
} from './duel-room-isolated-command-runner';
import type { DuelRoomIsolatedGameplayRuntime } from './duel-room-isolated-gameplay-runtime';

type IsolatedRuntime = DuelRoomIsolatedGameplayRuntime;

type TurnOrCombatResult =
  DuelRoomIsolatedCommandFailure | DuelRoomIsolatedCommandSuccess;

/**
 * Shared dispatcher for main-phase, turn, and combat isolated commands.
 */
export class DuelRoomIsolatedCommandDispatcher {
  public constructor(private readonly runner: DuelRoomIsolatedCommandRunner) {}

  /**
   * Runs a main-phase command with the standard runtime-error fallback.
   */
  public async runMainPhaseCommand(
    client: DuelRoomIsolatedCommandClient,
    executor: (runtime: IsolatedRuntime) => TurnOrCombatResult,
  ): Promise<void> {
    await this.runner.run({
      client,
      executor,
      fallbackRuntimeError: (runtime) => runtime.mainPhaseErrors.at(-1),
    });
  }

  /**
   * Runs a turn command while blocking pending effect decisions.
   */
  public async runTurnCommand(
    client: DuelRoomIsolatedCommandClient,
    executor: (runtime: IsolatedRuntime) => TurnOrCombatResult,
  ): Promise<void> {
    await this.runner.run({
      client,
      executor,
      pendingInteractionMessage: "Une decision d'effet est en attente.",
    });
  }

  /**
   * Runs a combat command with combat-runtime fallback errors and optional
   * pending-interaction override.
   */
  public async runCombatCommand(
    client: DuelRoomIsolatedCommandClient,
    executor: (runtime: IsolatedRuntime) => TurnOrCombatResult,
    options?: { allowPendingInteraction?: boolean },
  ): Promise<void> {
    await this.runner.run({
      client,
      executor,
      pendingInteractionMessage: "Une decision d'effet est en attente.",
      allowPendingInteraction: options?.allowPendingInteraction,
      fallbackRuntimeError: (runtime) => runtime.combatErrors.at(-1),
    });
  }
}
