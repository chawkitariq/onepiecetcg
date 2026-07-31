import { DuelState } from '@onepiecetcg/shared';
import { DuelRoomIsolatedCommandRunner } from './duel-room-isolated-command-runner';

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

function createFixture() {
  const adopted: unknown[] = [];
  const errors: string[] = [];
  let hasPendingPlayerInteraction = false;

  const runner = new DuelRoomIsolatedCommandRunner({
    createRuntime: () => createRuntime(),
    adoptRuntime: (runtime) => {
      adopted.push(runtime);
    },
    hasPendingPlayerInteraction: () => hasPendingPlayerInteraction,
    sendActionError: (_client, message) => {
      errors.push(message);
    },
  });

  return {
    runner,
    adopted,
    errors,
    setPendingPlayerInteraction: (value: boolean) => {
      hasPendingPlayerInteraction = value;
    },
  };
}

describe('DuelRoomIsolatedCommandRunner', () => {
  it('blocks commands when a pending interaction forbids execution', async () => {
    const fixture = createFixture();
    fixture.setPendingPlayerInteraction(true);

    await fixture.runner.run({
      client: { sessionId: 'session-a', send: jest.fn() },
      executor: () => ({ handled: true }),
      pendingInteractionMessage: 'pending',
    });

    expect(fixture.errors).toEqual(['pending']);
    expect(fixture.adopted).toHaveLength(0);
  });

  it('uses executor error message or fallback runtime error on failure', async () => {
    const fixture = createFixture();

    await fixture.runner.run({
      client: { sessionId: 'session-a', send: jest.fn() },
      executor: (runtime) => {
        runtime.mainPhaseErrors.push('runtime error');
        return { handled: false };
      },
      fallbackRuntimeError: (runtime) => runtime.mainPhaseErrors.at(-1),
    });

    expect(fixture.errors).toEqual(['runtime error']);
  });

  it('adopts on success', async () => {
    const fixture = createFixture();

    await fixture.runner.run({
      client: { sessionId: 'session-a', send: jest.fn() },
      executor: () => ({ handled: true }),
    });

    expect(fixture.adopted).toHaveLength(1);
    expect(fixture.errors).toHaveLength(0);
  });
});
