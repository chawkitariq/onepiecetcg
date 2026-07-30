import { DuelEventProjectorService } from './duel-event-projector.service';

describe('DuelEventProjectorService', () => {
  it('keeps the safe current event catalog visible to third-party viewers', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-1',
        eventType: 'TurnStarted',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 3,
        occurredAt: '2026-07-30T10:00:00.000Z',
        recordedAt: '2026-07-30T10:00:00.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          turn: 2,
          playerId: 'player-1',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-1',
      eventType: 'TurnStarted',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 3,
      occurredAt: '2026-07-30T10:00:00.000Z',
      payload: {
        turn: 2,
        playerId: 'player-1',
      },
    });
  });

  it('filters unsupported event types for non-internal viewers', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-2',
        eventType: 'UnknownFutureEvent',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 4,
        occurredAt: '2026-07-30T10:00:01.000Z',
        recordedAt: '2026-07-30T10:00:01.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          secret: true,
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toBeNull();
  });

  it('sanitizes hidden-card details for LifeCardTaken in the third-party view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-3',
        eventType: 'LifeCardTaken',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 5,
        occurredAt: '2026-07-30T10:00:02.000Z',
        recordedAt: '2026-07-30T10:00:02.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-2',
          count: 1,
          cardInstanceId: 'secret-card',
          cardDefinitionId: 'OP99-999',
          destinationZone: 'HAND',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-3',
      eventType: 'LifeCardTaken',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 5,
      occurredAt: '2026-07-30T10:00:02.000Z',
      payload: {
        playerId: 'player-2',
        count: 1,
        destinationZone: 'HAND',
      },
    });
  });
});
