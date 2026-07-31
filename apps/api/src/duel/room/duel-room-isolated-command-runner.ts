import type { DuelRoomIsolatedGameplayRuntime } from './duel-room-isolated-gameplay-runtime';
import type { Client } from 'colyseus';

export type DuelRoomIsolatedCommandClient = Pick<Client, 'sessionId' | 'send'>;

export type DuelRoomIsolatedCommandSuccess = {
  handled: true;
};

export type DuelRoomIsolatedCommandFailure = {
  handled: false;
  errorMessage?: string;
};

export type DuelRoomIsolatedCommandResult =
  | DuelRoomIsolatedCommandSuccess
  | DuelRoomIsolatedCommandFailure;

export type DuelRoomIsolatedCommandRunnerDeps = {
  createRuntime: () => DuelRoomIsolatedGameplayRuntime;
  adoptRuntime: (runtime: DuelRoomIsolatedGameplayRuntime) => void;
  hasPendingPlayerInteraction: () => boolean;
  sendActionError: (
    client: DuelRoomIsolatedCommandClient,
    message: string,
  ) => void;
};

export type RunIsolatedCommandInput = {
  client: DuelRoomIsolatedCommandClient;
  executor: (
    runtime: DuelRoomIsolatedGameplayRuntime,
  ) => DuelRoomIsolatedCommandResult;
  pendingInteractionMessage?: string;
  allowPendingInteraction?: boolean;
  fallbackRuntimeError?: (
    runtime: DuelRoomIsolatedGameplayRuntime,
  ) => string | undefined;
};

/**
 * Runs one isolated gameplay command with the standard lifecycle:
 * pending-interaction guard, detached runtime execution, and runtime adoption
 * on success.
 */
export class DuelRoomIsolatedCommandRunner {
  public constructor(
    private readonly deps: DuelRoomIsolatedCommandRunnerDeps,
  ) {}

  /**
   * Executes one isolated command and normalizes all shared error handling.
   */
  public async run(input: RunIsolatedCommandInput): Promise<void> {
    if (
      input.pendingInteractionMessage &&
      this.deps.hasPendingPlayerInteraction() &&
      !input.allowPendingInteraction
    ) {
      this.deps.sendActionError(input.client, input.pendingInteractionMessage);
      return;
    }

    const runtime = this.deps.createRuntime();
    const result = input.executor(runtime);

    if (!result.handled) {
      const errorMessage =
        result.errorMessage ?? input.fallbackRuntimeError?.(runtime);

      if (errorMessage) {
        this.deps.sendActionError(input.client, errorMessage);
      }

      return;
    }

    this.deps.adoptRuntime(runtime);
  }
}
