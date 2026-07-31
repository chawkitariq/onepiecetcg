import type { DomainEventDraft } from '../../duel-events/duel-domain-event.types';
import type {
  DuelRoomIsolatedCommandClient,
  DuelRoomIsolatedCommandFailure,
  DuelRoomIsolatedCommandRunner,
  DuelRoomIsolatedCommandSuccess,
} from './duel-room-isolated-command-runner';
import type { DuelRoomIsolatedGameplayRuntime } from './duel-room-isolated-gameplay-runtime';

type IsolatedRuntime = DuelRoomIsolatedGameplayRuntime;

type MainPhaseResult =
  | { handled: false }
  | { handled: true; eventDrafts: DomainEventDraft[] };

type TurnOrCombatResult =
  | DuelRoomIsolatedCommandFailure
  | DuelRoomIsolatedCommandSuccess;

/**
 * Shared dispatcher for main-phase, turn, and combat isolated commands.
 */
export class DuelRoomIsolatedCommandDispatcher {
  public constructor(
    private readonly runner: DuelRoomIsolatedCommandRunner,
  ) {}

  /**
   * Runs a main-phase command with the standard runtime-error fallback.
   */
  public async runMainPhaseCommand(
    client: DuelRoomIsolatedCommandClient,
    executor: (runtime: IsolatedRuntime) => MainPhaseResult,
    outboxFailureMessage: string,
  ): Promise<void> {
    await this.runner.run({
      client,
      executor,
      outboxFailureMessage,
      fallbackRuntimeError: (runtime) => runtime.mainPhaseErrors.at(-1),
    });
  }

  /**
   * Runs a turn command while blocking pending effect decisions.
   */
  public async runTurnCommand(
    client: DuelRoomIsolatedCommandClient,
    executor: (runtime: IsolatedRuntime) => TurnOrCombatResult,
    outboxFailureMessage: string,
  ): Promise<void> {
    await this.runner.run({
      client,
      executor,
      outboxFailureMessage,
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
    outboxFailureMessage: string,
    options?: { allowPendingInteraction?: boolean },
  ): Promise<void> {
    await this.runner.run({
      client,
      executor,
      outboxFailureMessage,
      pendingInteractionMessage: "Une decision d'effet est en attente.",
      allowPendingInteraction: options?.allowPendingInteraction,
      fallbackRuntimeError: (runtime) => runtime.combatErrors.at(-1),
    });
  }
}
