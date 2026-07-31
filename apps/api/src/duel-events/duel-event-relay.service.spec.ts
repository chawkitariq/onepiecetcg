import type { EntityManager, Repository } from 'typeorm';
import { DuelEventBusService } from './duel-event-bus.service';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import { DuelEventRelayService } from './duel-event-relay.service';

type MockRelayManager = {
  transaction: jest.Mock;
  createQueryBuilder: jest.Mock;
  save: jest.Mock;
};

type Deferred = {
  promise: Promise<void>;
  resolve: () => void;
};

function createDeferred(): Deferred {
  let resolve = () => {};
  const promise = new Promise<void>((innerResolve) => {
    resolve = innerResolve;
  });

  return { promise, resolve };
}

function createOutboxRow(): DuelEventOutbox {
  return Object.assign(new DuelEventOutbox(), {
    eventId: 'evt-1',
    matchId: 'match-1',
    sequenceNumber: 1,
    eventType: 'MatchCreated',
    eventVersion: 1,
    payload: { roomId: 'match-1' },
    metadata: {
      eventId: 'evt-1',
      occurredAt: '2026-07-30T10:00:00.000Z',
      recordedAt: '2026-07-30T10:00:00.100Z',
      actorPlayerId: 'player-1',
      correlationId: 'match-1',
      causationId: 'cmd-1',
      transactionId: 'act-1',
      engineVersion: 'engine-test',
      rulesetVersion: 'ruleset-test',
    },
    status: 'PENDING' as const,
    createdAt: new Date('2026-07-30T10:00:00.000Z'),
    publishedAt: null,
    attemptCount: 0,
    nextAttemptAt: null,
    lastError: null,
  });
}

describe('DuelEventRelayService', () => {
  it('runs the scheduled batch only once at a time', async () => {
    const outbox = {} as jest.Mocked<Repository<DuelEventOutbox>>;
    const bus = {} as jest.Mocked<DuelEventBusService>;
    const relay = new DuelEventRelayService(outbox, bus);
    const releaseFirstRun = createDeferred();
    const firstRunStarted = createDeferred();
    const processSpy = jest
      .spyOn(relay, 'processPendingBatch')
      .mockImplementationOnce(async () => {
        firstRunStarted.resolve();
        await releaseFirstRun.promise;
        return 0;
      })
      .mockResolvedValue(0);

    const firstRun = relay.runScheduledBatch();
    await firstRunStarted.promise;

    await relay.runScheduledBatch();
    expect(processSpy).toHaveBeenCalledTimes(1);

    releaseFirstRun.resolve();
    await firstRun;
  });

  it('publishes pending rows and marks them published', async () => {
    const row = createOutboxRow();
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      setOnLocked: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(() => Promise.resolve([row])),
    };
    const manager: MockRelayManager = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager as unknown as EntityManager),
      ),
      createQueryBuilder: jest.fn(() => queryBuilder),
      save: jest.fn((_: unknown, value: unknown) => Promise.resolve(value)),
    };
    const outbox = {
      manager: manager as unknown as EntityManager,
      save: jest.fn((value: unknown) => Promise.resolve(value)),
    } as unknown as jest.Mocked<Repository<DuelEventOutbox>>;
    const bus = {
      publish: jest.fn(() => Promise.resolve(undefined)),
    } as unknown as jest.Mocked<DuelEventBusService>;
    const relay = new DuelEventRelayService(outbox, bus);

    const published = await relay.processPendingBatch();

    expect(published).toBe(1);
    expect(bus.publish.mock.calls).toHaveLength(1);
    expect(row.status).toBe('PUBLISHED');
    expect(row.publishedAt).toBeInstanceOf(Date);
    expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(queryBuilder.setOnLocked).toHaveBeenCalledWith('skip_locked');
  });

  it('reschedules failures for retry', async () => {
    const row = createOutboxRow();
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      setOnLocked: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(() => Promise.resolve([row])),
    };
    const manager: MockRelayManager = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager as unknown as EntityManager),
      ),
      createQueryBuilder: jest.fn(() => queryBuilder),
      save: jest.fn((_: unknown, value: unknown) => Promise.resolve(value)),
    };
    const outbox = {
      manager: manager as unknown as EntityManager,
      save: jest.fn((value: unknown) => Promise.resolve(value)),
    } as unknown as jest.Mocked<Repository<DuelEventOutbox>>;
    const bus = {
      publish: jest.fn(() => {
        throw new Error('bus unavailable');
      }),
    } as unknown as jest.Mocked<DuelEventBusService>;
    const relay = new DuelEventRelayService(outbox, bus);

    const published = await relay.processPendingBatch();

    expect(published).toBe(0);
    expect(row.status).toBe('PENDING');
    expect(row.attemptCount).toBe(1);
    expect(row.nextAttemptAt).toBeInstanceOf(Date);
    expect(row.lastError).toBe('bus unavailable');
  });

  it('marks a row as failed after the maximum retry count is reached', async () => {
    const row = createOutboxRow();
    row.attemptCount = 9;
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      setOnLocked: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(() => Promise.resolve([row])),
    };
    const manager: MockRelayManager = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager as unknown as EntityManager),
      ),
      createQueryBuilder: jest.fn(() => queryBuilder),
      save: jest.fn((_: unknown, value: unknown) => Promise.resolve(value)),
    };
    const outbox = {
      manager: manager as unknown as EntityManager,
      save: jest.fn((value: unknown) => Promise.resolve(value)),
    } as unknown as jest.Mocked<Repository<DuelEventOutbox>>;
    const bus = {
      publish: jest.fn(() => {
        throw new Error('bus unavailable');
      }),
    } as unknown as jest.Mocked<DuelEventBusService>;
    const relay = new DuelEventRelayService(outbox, bus);

    const published = await relay.processPendingBatch();

    expect(published).toBe(0);
    expect(row.attemptCount).toBe(10);
    expect(row.status).toBe('FAILED');
    expect(row.nextAttemptAt).toBeNull();
    expect(row.lastError).toBe('bus unavailable');
  });
});
