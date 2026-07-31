import type { Repository } from 'typeorm';
import { DuelEventJournalService } from './duel-event-journal.service';
import { DuelEventOutbox } from './duel-event-outbox.entity';

describe('DuelEventJournalService', () => {
  it('lists only published events for one match in sequence order', async () => {
    const find = jest.fn().mockResolvedValue([
      {
        eventId: 'evt-11',
        matchId: 'match-1',
        sequenceNumber: 11,
        eventType: 'MatchAborted',
        eventVersion: 1,
        payload: { reason: 'roomLost' },
        metadata: {
          occurredAt: '2026-07-30T10:00:11.000Z',
          recordedAt: '2026-07-30T10:00:11.050Z',
          actorPlayerId: undefined,
          correlationId: 'match-1',
          causationId: 'cmd-11',
          transactionId: 'act-11',
          engineVersion: 'engine-test',
          rulesetVersion: 'ruleset-test',
        },
      },
      {
        eventId: 'evt-12',
        matchId: 'match-1',
        sequenceNumber: 12,
        eventType: 'DeckShuffled',
        eventVersion: 1,
        payload: { playerId: 'player-1' },
        metadata: {
          occurredAt: '2026-07-30T10:00:12.000Z',
          recordedAt: '2026-07-30T10:00:12.050Z',
          actorPlayerId: 'player-1',
          correlationId: 'match-1',
          causationId: 'cmd-12',
          transactionId: 'act-12',
          engineVersion: 'engine-test',
          rulesetVersion: 'ruleset-test',
        },
      },
    ]);
    const outbox = {
      find,
    } as unknown as jest.Mocked<Repository<DuelEventOutbox>>;
    const service = new DuelEventJournalService(outbox);

    const result = await service.listPublishedEvents({
      matchId: 'match-1',
      afterSequenceNumber: 10,
      limit: 2,
    });

    const firstFindCall = find.mock.calls.at(0) as
      | [
          {
            where: {
              matchId: string;
              status: string;
              sequenceNumber: unknown;
            };
            order: { sequenceNumber: 'ASC' };
            take: number;
          },
        ]
      | undefined;
    const findInput = firstFindCall?.[0];

    expect(findInput?.where.matchId).toBe('match-1');
    expect(findInput?.where.status).toBe('PUBLISHED');
    expect(findInput?.order).toEqual({ sequenceNumber: 'ASC' });
    expect(findInput?.take).toBe(2);
    expect(result).toEqual([
      {
        eventId: 'evt-11',
        eventType: 'MatchAborted',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 11,
        occurredAt: '2026-07-30T10:00:11.000Z',
        recordedAt: '2026-07-30T10:00:11.050Z',
        actorPlayerId: undefined,
        correlationId: 'match-1',
        causationId: 'cmd-11',
        transactionId: 'act-11',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          reason: 'roomLost',
        },
      },
      {
        eventId: 'evt-12',
        eventType: 'DeckShuffled',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 12,
        occurredAt: '2026-07-30T10:00:12.000Z',
        recordedAt: '2026-07-30T10:00:12.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-12',
        transactionId: 'act-12',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
        },
      },
    ]);
  });
});
