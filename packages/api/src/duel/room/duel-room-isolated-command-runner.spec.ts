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
  const persisted: unknown[] = [];
  const errors: string[] = [];
  const persistErrors: unknown[] = [];
  let hasPendingPlayerInteraction = false;

  const runner = new DuelRoomIsolatedCommandRunner({
    createRuntime: () => createRuntime() as never,
    adoptRuntime: (runtime) => {
      adopted.push(runtime);
    },
    hasPendingPlayerInteraction: () => hasPendingPlayerInteraction,
    persistRoomEventsOrThrow: async (actorSessionId, eventDrafts) => {
      persisted.push({ actorSessionId, eventDrafts });
    },
    sendActionError: (_client, message) => {
      errors.push(message);
    },
    reportPersistError: (error) => {
      persistErrors.push(error);
    },
  });

  return {
    runner,
    adopted,
    persisted,
    errors,
    persistErrors,
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
      executor: () => ({ handled: true, eventDrafts: [] }),
      outboxFailureMessage: 'outbox',
      pendingInteractionMessage: 'pending',
    });

    expect(fixture.errors).toEqual(['pending']);
    expect(fixture.persisted).toHaveLength(0);
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
      outboxFailureMessage: 'outbox',
      fallbackRuntimeError: (runtime) => runtime.mainPhaseErrors.at(-1),
    });

    expect(fixture.errors).toEqual(['runtime error']);
  });

  it('persists and adopts on success', async () => {
    const fixture = createFixture();

    await fixture.runner.run({
      client: { sessionId: 'session-a', send: jest.fn() },
      executor: () => ({
        handled: true,
        eventDrafts: [
          {
            type: 'TurnStarted',
            version: 1,
            payload: { turn: 1, playerId: 'player:session-a' },
          },
        ],
      }),
      outboxFailureMessage: 'outbox',
    });

    expect(fixture.persisted).toHaveLength(1);
    expect(fixture.adopted).toHaveLength(1);
    expect(fixture.errors).toHaveLength(0);
  });

  it('reports persist failures and sends the outbox error message', async () => {
    const fixture = createFixture();
    fixture.runner = new DuelRoomIsolatedCommandRunner({
      createRuntime: () => createRuntime() as never,
      adoptRuntime: (runtime) => {
        fixture.adopted.push(runtime);
      },
      hasPendingPlayerInteraction: () => false,
      persistRoomEventsOrThrow: async () => {
        throw new Error('outbox down');
      },
      sendActionError: (_client, message) => {
        fixture.errors.push(message);
      },
      reportPersistError: (error) => {
        fixture.persistErrors.push(error);
      },
    });

    await fixture.runner.run({
      client: { sessionId: 'session-a', send: jest.fn() },
      executor: () => ({ handled: true, eventDrafts: [] }),
      outboxFailureMessage: 'outbox failed',
    });

    expect(fixture.persistErrors).toHaveLength(1);
    expect(fixture.errors).toEqual(['outbox failed']);
    expect(fixture.adopted).toHaveLength(0);
  });
});
