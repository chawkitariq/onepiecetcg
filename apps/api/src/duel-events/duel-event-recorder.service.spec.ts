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
    const findOne = jest.fn(() => Promise.resolve(stream));
    const manager = {
      findOne,
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
    expect(findOne).toHaveBeenCalledWith(DuelEventStream, {
      where: { matchId: 'match-1' },
      lock: { mode: 'pessimistic_write' },
    });
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

  it('accepts the gameplay event catalog emitted by the duel room', async () => {
    const stream = Object.assign(new DuelEventStream(), {
      matchId: 'match-1',
      lastSequenceNumber: 10,
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
      commandId: 'cmd-2',
      actionId: 'act-2',
      eventDrafts: [
        {
          type: 'CostPaid',
          version: 1,
          payload: {
            playerId: 'player-1',
            amount: 4,
            sourceInstanceId: 'card-1',
            sourceCardId: 'OP01-001',
          },
        },
        {
          type: 'CardPlayed',
          version: 1,
          payload: {
            playerId: 'player-1',
            cardInstanceId: 'card-1',
            cardDefinitionId: 'OP01-001',
            fromZone: 'HAND',
            toZone: 'CHARACTER_AREA',
            paidCost: 4,
          },
        },
        {
          type: 'AttackDeclared',
          version: 1,
          payload: {
            playerId: 'player-1',
            attackerInstanceId: 'card-1',
          },
        },
        {
          type: 'BattleResolved',
          version: 1,
          payload: {
            attackerPlayerId: 'player-1',
            attackerInstanceId: 'card-1',
            defenderPlayerId: 'player-2',
            defendingInstanceId: 'leader-2',
            targetType: 'leader',
            attackerPower: 7000,
            defenderPower: 5000,
            outcome: 'attackerWon',
          },
        },
        {
          type: 'LifeCardTaken',
          version: 1,
          payload: {
            playerId: 'player-2',
            count: 1,
            cardInstanceId: 'life-1',
            cardDefinitionId: 'OP01-002',
            destinationZone: 'HAND',
          },
        },
        {
          type: 'ChoiceSubmitted',
          version: 1,
          payload: {
            playerId: 'player-1',
            decisionType: 'trigger',
            activate: true,
          },
        },
      ],
      engineVersion: 'engine-test',
      rulesetVersion: 'ruleset-test',
    });

    expect(result.events).toHaveLength(6);
    expect(result.events.map((event) => event.eventType)).toEqual([
      'CostPaid',
      'CardPlayed',
      'AttackDeclared',
      'BattleResolved',
      'LifeCardTaken',
      'ChoiceSubmitted',
    ]);
    expect(result.events.map((event) => event.sequenceNumber)).toEqual([
      11, 12, 13, 14, 15, 16,
    ]);
    expect(savedRows).toHaveLength(6);
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

  it('rejects recording when the match stream is already aborted', async () => {
    const stream = Object.assign(new DuelEventStream(), {
      matchId: 'match-aborted',
      lastSequenceNumber: 8,
      status: 'ABORTED' as const,
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
        matchId: 'match-aborted',
        commandId: 'cmd-2',
        actionId: 'act-2',
        actorPlayerId: 'player-1',
        eventDrafts: [
          { type: 'PhaseChanged', version: 1, payload: { from: 'a', to: 'b' } },
        ],
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
      }),
    ).rejects.toBeInstanceOf(DuelEventStreamClosedError);
  });

  it('marks the stream as aborted when MatchAborted is recorded', async () => {
    const stream = Object.assign(new DuelEventStream(), {
      matchId: 'match-2',
      lastSequenceNumber: 7,
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
      matchId: 'match-2',
      actorPlayerId: 'player-1',
      commandId: 'cmd-abort',
      actionId: 'act-abort',
      eventDrafts: [
        {
          type: 'MatchAborted',
          version: 1,
          payload: {
            reason: 'roomLost',
          },
        },
      ],
      engineVersion: 'engine-test',
      rulesetVersion: 'ruleset-test',
    });

    expect(result.events).toHaveLength(1);
    expect(result.events[0]?.eventType).toBe('MatchAborted');
    expect(result.lastSequenceNumber).toBe(8);
    expect(stream.lastSequenceNumber).toBe(8);
    expect(stream.status).toBe('ABORTED');
    expect(savedRows).toHaveLength(1);
    expect(savedRows[0]?.eventType).toBe('MatchAborted');
  });
});
