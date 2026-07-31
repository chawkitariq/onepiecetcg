import { DuelState } from '@onepiecetcg/shared';
import { DuelRoomIsolatedCommandDispatcher } from './duel-room-isolated-command-dispatcher';

function createRuntime() {
  return {
    state: new DuelState(),
    lifecycle: {} as never,
    gameplayRuntime: {} as never,
    runtimeState: {} as never,
    mainPhaseErrors: [] as string[],
    combatErrors: [] as string[],
  };
}

describe('duel-room-isolated-command-dispatcher', () => {
  it('configures main-phase fallback runtime errors', async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    const dispatcher = new DuelRoomIsolatedCommandDispatcher({
      run,
    } as never);

    await dispatcher.runMainPhaseCommand(
      { sessionId: 'session-a', send: jest.fn() },
      () => ({ handled: false }),
    );

    const runtime = createRuntime();
    runtime.mainPhaseErrors.push('main error');
    const config = run.mock.calls[0][0];

    expect(config.pendingInteractionMessage).toBeUndefined();
    expect(config.fallbackRuntimeError(runtime)).toBe('main error');
  });

  it('configures turn commands with pending interaction guard', async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    const dispatcher = new DuelRoomIsolatedCommandDispatcher({
      run,
    } as never);

    await dispatcher.runTurnCommand(
      { sessionId: 'session-a', send: jest.fn() },
      () => ({ handled: false, errorMessage: 'nope' }),
    );

    expect(run.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        pendingInteractionMessage: "Une decision d'effet est en attente.",
      }),
    );
  });

  it('configures combat commands with optional override and combat fallback', async () => {
    const run = jest.fn().mockResolvedValue(undefined);
    const dispatcher = new DuelRoomIsolatedCommandDispatcher({
      run,
    } as never);

    await dispatcher.runCombatCommand(
      { sessionId: 'session-a', send: jest.fn() },
      () => ({ handled: false }),
      { allowPendingInteraction: true },
    );

    const runtime = createRuntime();
    runtime.combatErrors.push('combat error');
    const config = run.mock.calls[0][0];

    expect(config.allowPendingInteraction).toBe(true);
    expect(config.pendingInteractionMessage).toBe(
      "Une decision d'effet est en attente.",
    );
    expect(config.fallbackRuntimeError(runtime)).toBe('combat error');
  });
});
