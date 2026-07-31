import { DataSource, type EntityManager } from 'typeorm';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import { DuelEventStreamAlreadyExistsError } from './duel-event-errors';
import { DuelEventStream } from './duel-event-stream.entity';
import { DuelEventStreamService } from './duel-event-stream.service';

describe('DuelEventStreamService', () => {
  it('creates a new stream and records MatchCreated as sequence 1', async () => {
    const savedEntities: unknown[] = [];
    const manager = {
      findOne: jest.fn(() => Promise.resolve(null)),
      create: jest.fn(<T>(EntityClass: new () => T, value: Partial<T>) =>
        Object.assign(new EntityClass(), value),
      ),
      save: jest.fn((_entity: unknown, value: unknown) => {
        savedEntities.push(value);
        return Promise.resolve(value);
      }),
    } as unknown as jest.Mocked<EntityManager>;
    const dataSource = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager),
      ),
    } as unknown as jest.Mocked<DataSource>;
    const service = new DuelEventStreamService(dataSource);

    const result = await service.createStream({
      matchId: 'match-1',
      actorPlayerId: undefined,
      engineVersion: 'duel-room-v1',
      rulesetVersion: '2026.07',
      matchCreatedPayload: {
        roomId: 'match-1',
        createdAt: '2026-07-30T10:00:00.000Z',
      },
      participants: [
        { authUserId: 'auth-user-1', playerId: 'player-1' },
        { authUserId: 'auth-user-2', playerId: 'player-2' },
      ],
    });

    expect(result.eventType).toBe('MatchCreated');
    expect(result.sequenceNumber).toBe(1);
    expect(result.matchId).toBe('match-1');

    const savedStream = savedEntities.find(
      (entity): entity is DuelEventStream => entity instanceof DuelEventStream,
    );
    const savedOutboxRow = savedEntities.find(
      (entity): entity is DuelEventOutbox => entity instanceof DuelEventOutbox,
    );

    expect(savedStream).toMatchObject({
      matchId: 'match-1',
      lastSequenceNumber: 1,
      status: 'OPEN',
      participants: [
        { authUserId: 'auth-user-1', playerId: 'player-1' },
        { authUserId: 'auth-user-2', playerId: 'player-2' },
      ],
    });
    expect(savedOutboxRow).toMatchObject({
      matchId: 'match-1',
      sequenceNumber: 1,
      eventType: 'MatchCreated',
      eventVersion: 1,
      status: 'PENDING',
    });
  });

  it('rejects creating a stream when one already exists', async () => {
    const existingStream = Object.assign(new DuelEventStream(), {
      matchId: 'match-1',
      lastSequenceNumber: 7,
      status: 'OPEN' as const,
    });
    const manager = {
      findOne: jest.fn(() => Promise.resolve(existingStream)),
    } as unknown as jest.Mocked<EntityManager>;
    const dataSource = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager),
      ),
    } as unknown as jest.Mocked<DataSource>;
    const service = new DuelEventStreamService(dataSource);

    await expect(
      service.createStream({
        matchId: 'match-1',
        actorPlayerId: undefined,
        engineVersion: 'duel-room-v1',
        rulesetVersion: '2026.07',
        matchCreatedPayload: {
          roomId: 'match-1',
          createdAt: '2026-07-30T10:00:00.000Z',
        },
      }),
    ).rejects.toBeInstanceOf(DuelEventStreamAlreadyExistsError);
  });

  it('returns the participant player id for one authenticated user', async () => {
    const getRepository = jest.fn(() => ({
      findOne: jest.fn(() =>
        Promise.resolve({
          matchId: 'match-1',
          participants: [
            { authUserId: 'auth-user-1', playerId: 'player-1' },
            { authUserId: 'auth-user-2', playerId: 'player-2' },
          ],
        }),
      ),
    }));
    const dataSource = {
      getRepository,
    } as unknown as jest.Mocked<DataSource>;
    const service = new DuelEventStreamService(dataSource);

    await expect(
      service.getPlayerIdForAuthUser('match-1', 'auth-user-2'),
    ).resolves.toBe('player-2');
    await expect(
      service.getPlayerIdForAuthUser('match-1', 'auth-user-3'),
    ).resolves.toBeNull();
  });
});
