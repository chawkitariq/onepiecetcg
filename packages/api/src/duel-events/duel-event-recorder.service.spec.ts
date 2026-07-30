import { DataSource, type EntityManager } from 'typeorm';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import {
  DuelEventStreamClosedError,
  DuelEventStreamNotFoundError,
} from './duel-event-errors';
import { DuelEventRecorderService } from './duel-event-recorder.service';
import { DuelEventStream } from './duel-event-stream.entity';

describe('DuelEventRecorderService', () => {
  it('appends sequenced canonical events and closes the stream on MatchEnded', async () => {
    const stream = Object.assign(new DuelEventStream(), {
      matchId: 'match-1',
      lastSequenceNumber: 3,
      status: 'OPEN' as const,
    });
    const savedRows: DuelEventOutbox[] = [];
    const manager = {
      findOne: jest.fn(() => Promise.resolve(stream)),
      create: jest.fn(<T>(_: new () => T, value: Partial<T>) =>
        Object.assign(new DuelEventOutbox(), value),
      ),
      save: jest.fn((_entity: unknown, value: unknown) => {
        if (Array.isArray(value)) {
          savedRows.push(...(value as DuelEventOutbox[]));
        }

        return Promise.resolve(value);
      }),
    } as unknown as jest.Mocked<EntityManager>;
    const dataSource = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager),
      ),
      getRepository: jest.fn(() => ({
        findOne: jest.fn(),
      })),
    } as unknown as jest.Mocked<DataSource>;
    const service = new DuelEventRecorderService(dataSource);

    const result = await service.record({
      matchId: 'match-1',
      actorPlayerId: 'player-1',
      commandId: 'cmd-1',
      actionId: 'act-1',
      eventDrafts: [
        {
          type: 'PhaseChanged',
          version: 1,
          payload: { fromPhase: 'draw', toPhase: 'don' },
        },
        {
          type: 'MatchEnded',
          version: 1,
          payload: { winnerPlayerId: 'player-1', endReason: 'life' },
        },
      ],
      engineVersion: 'engine-test',
      rulesetVersion: 'ruleset-test',
    });

    expect(result.events).toHaveLength(2);
    expect(result.events.map((event) => event.sequenceNumber)).toEqual([4, 5]);
    expect(result.lastSequenceNumber).toBe(5);
    expect(stream.lastSequenceNumber).toBe(5);
    expect(stream.status).toBe('COMPLETED');
    expect(savedRows).toHaveLength(2);
    expect(savedRows.map((row) => row.sequenceNumber)).toEqual([4, 5]);
  });

  it('rejects recording when the match stream does not exist', async () => {
    const manager = {
      findOne: jest.fn(() => Promise.resolve(null)),
    } as unknown as jest.Mocked<EntityManager>;
    const dataSource = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager),
      ),
      getRepository: jest.fn(() => ({
        findOne: jest.fn(),
      })),
    } as unknown as jest.Mocked<DataSource>;
    const service = new DuelEventRecorderService(dataSource);

    await expect(
      service.record({
        matchId: 'missing-match',
        commandId: 'cmd-1',
        actionId: 'act-1',
        actorPlayerId: 'player-1',
        eventDrafts: [
          { type: 'PhaseChanged', version: 1, payload: { from: 'a', to: 'b' } },
        ],
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
      }),
    ).rejects.toBeInstanceOf(DuelEventStreamNotFoundError);
  });

  it('rejects recording when the match stream is already closed', async () => {
    const stream = Object.assign(new DuelEventStream(), {
      matchId: 'match-1',
      lastSequenceNumber: 5,
      status: 'COMPLETED' as const,
    });
    const manager = {
      findOne: jest.fn(() => Promise.resolve(stream)),
    } as unknown as jest.Mocked<EntityManager>;
    const dataSource = {
      transaction: jest.fn(
        <T>(callback: (innerManager: EntityManager) => Promise<T>) =>
          callback(manager),
      ),
      getRepository: jest.fn(() => ({
        findOne: jest.fn(() => Promise.resolve(stream)),
      })),
    } as unknown as jest.Mocked<DataSource>;
    const service = new DuelEventRecorderService(dataSource);

    await expect(
      service.record({
        matchId: 'match-1',
        commandId: 'cmd-1',
        actionId: 'act-1',
        actorPlayerId: 'player-1',
        eventDrafts: [
          { type: 'PhaseChanged', version: 1, payload: { from: 'a', to: 'b' } },
        ],
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
      }),
    ).rejects.toBeInstanceOf(DuelEventStreamClosedError);
  });
});
