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

  it('sanitizes hidden-card details for CardDrawn in the third-party view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-4',
        eventType: 'CardDrawn',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 6,
        occurredAt: '2026-07-30T10:00:03.000Z',
        recordedAt: '2026-07-30T10:00:03.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          count: 1,
          cardInstanceId: 'secret-draw',
          cardDefinitionId: 'OP99-998',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-4',
      eventType: 'CardDrawn',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 6,
      occurredAt: '2026-07-30T10:00:03.000Z',
      payload: {
        playerId: 'player-1',
        count: 1,
      },
    });
  });

  it('keeps hidden-card details for CardDrawn in the owner player view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-owner-draw',
        eventType: 'CardDrawn',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 6,
        occurredAt: '2026-07-30T10:00:03.000Z',
        recordedAt: '2026-07-30T10:00:03.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          count: 1,
          cardInstanceId: 'secret-draw',
          cardDefinitionId: 'OP99-998',
        },
      },
      {
        viewerType: 'PLAYER',
        playerId: 'player-1',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-owner-draw',
      eventType: 'CardDrawn',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 6,
      occurredAt: '2026-07-30T10:00:03.000Z',
      payload: {
        playerId: 'player-1',
        count: 1,
        cardInstanceId: 'secret-draw',
        cardDefinitionId: 'OP99-998',
      },
    });
  });

  it('sanitizes hidden-card details for CardDrawn in the spectator view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-spectator-draw',
        eventType: 'CardDrawn',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 6,
        occurredAt: '2026-07-30T10:00:03.000Z',
        recordedAt: '2026-07-30T10:00:03.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          count: 1,
          cardInstanceId: 'secret-draw',
          cardDefinitionId: 'OP99-998',
        },
      },
      {
        viewerType: 'SPECTATOR',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-spectator-draw',
      eventType: 'CardDrawn',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 6,
      occurredAt: '2026-07-30T10:00:03.000Z',
      payload: {
        playerId: 'player-1',
        count: 1,
      },
    });
  });

  it('sanitizes hidden-card details for CardDrawn in the opponent player view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-opponent-draw',
        eventType: 'CardDrawn',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 6,
        occurredAt: '2026-07-30T10:00:03.000Z',
        recordedAt: '2026-07-30T10:00:03.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          count: 1,
          cardInstanceId: 'secret-draw',
          cardDefinitionId: 'OP99-998',
        },
      },
      {
        viewerType: 'PLAYER',
        playerId: 'player-2',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-opponent-draw',
      eventType: 'CardDrawn',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 6,
      occurredAt: '2026-07-30T10:00:03.000Z',
      payload: {
        playerId: 'player-1',
        count: 1,
      },
    });
  });

  it('sanitizes hidden-card details for CardMoved from life in the third-party view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-5',
        eventType: 'CardMoved',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 7,
        occurredAt: '2026-07-30T10:00:04.000Z',
        recordedAt: '2026-07-30T10:00:04.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-2',
          cardInstanceId: 'life-card',
          cardDefinitionId: 'OP99-997',
          fromZone: 'LIFE',
          toZone: 'HAND',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-5',
      eventType: 'CardMoved',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 7,
      occurredAt: '2026-07-30T10:00:04.000Z',
      payload: {
        playerId: 'player-2',
        fromZone: 'LIFE',
        toZone: 'HAND',
      },
    });
  });

  it('keeps hidden-card details for CardMoved from life in the owner player view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-owner-move',
        eventType: 'CardMoved',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 7,
        occurredAt: '2026-07-30T10:00:04.000Z',
        recordedAt: '2026-07-30T10:00:04.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-2',
          cardInstanceId: 'life-card',
          cardDefinitionId: 'OP99-997',
          fromZone: 'LIFE',
          toZone: 'HAND',
        },
      },
      {
        viewerType: 'PLAYER',
        playerId: 'player-2',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-owner-move',
      eventType: 'CardMoved',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 7,
      occurredAt: '2026-07-30T10:00:04.000Z',
      payload: {
        playerId: 'player-2',
        cardInstanceId: 'life-card',
        cardDefinitionId: 'OP99-997',
        fromZone: 'LIFE',
        toZone: 'HAND',
      },
    });
  });

  it('sanitizes hidden-card details for CardAddedToLife in the third-party view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-6',
        eventType: 'CardAddedToLife',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 8,
        occurredAt: '2026-07-30T10:00:05.000Z',
        recordedAt: '2026-07-30T10:00:05.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          cardInstanceId: 'secret-life-card',
          cardDefinitionId: 'OP99-996',
          fromZone: 'DECK',
          placement: 'top',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-6',
      eventType: 'CardAddedToLife',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 8,
      occurredAt: '2026-07-30T10:00:05.000Z',
      payload: {
        playerId: 'player-1',
        fromZone: 'DECK',
        placement: 'top',
      },
    });
  });

  it('keeps CardPlacedUnderCard visible in the third-party view when no hidden zone is involved', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-7',
        eventType: 'CardPlacedUnderCard',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 9,
        occurredAt: '2026-07-30T10:00:06.000Z',
        recordedAt: '2026-07-30T10:00:06.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-2',
        transactionId: 'act-2',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          cardInstanceId: 'don-1',
          cardDefinitionId: 'DON!!',
          parentInstanceId: 'leader-1',
          parentCardId: 'L-001',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-7',
      eventType: 'CardPlacedUnderCard',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 9,
      occurredAt: '2026-07-30T10:00:06.000Z',
      payload: {
        playerId: 'player-1',
        cardInstanceId: 'don-1',
        cardDefinitionId: 'DON!!',
        parentInstanceId: 'leader-1',
        parentCardId: 'L-001',
      },
    });
  });

  it('sanitizes hidden-card details for CardReturnedToHand in the third-party view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-7',
        eventType: 'CardReturnedToHand',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 9,
        occurredAt: '2026-07-30T10:00:06.000Z',
        recordedAt: '2026-07-30T10:00:06.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          cardInstanceId: 'returned-card',
          cardDefinitionId: 'OP99-995',
          fromZone: 'CHARACTER_AREA',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-7',
      eventType: 'CardReturnedToHand',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 9,
      occurredAt: '2026-07-30T10:00:06.000Z',
      payload: {
        playerId: 'player-1',
        fromZone: 'CHARACTER_AREA',
      },
    });
  });

  it('sanitizes hidden-card details for CardPlacedOnDeck in the third-party view', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-8',
        eventType: 'CardPlacedOnDeck',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 10,
        occurredAt: '2026-07-30T10:00:07.000Z',
        recordedAt: '2026-07-30T10:00:07.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          cardInstanceId: 'deck-card',
          cardDefinitionId: 'OP99-994',
          fromZone: 'HAND',
          placement: 'bottom',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-8',
      eventType: 'CardPlacedOnDeck',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 10,
      occurredAt: '2026-07-30T10:00:07.000Z',
      payload: {
        playerId: 'player-1',
        fromZone: 'HAND',
        placement: 'bottom',
      },
    });
  });

  it('keeps MatchAborted visible to third-party viewers', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-9',
        eventType: 'MatchAborted',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 11,
        occurredAt: '2026-07-30T10:00:08.000Z',
        recordedAt: '2026-07-30T10:00:08.050Z',
        actorPlayerId: undefined,
        correlationId: 'match-1',
        causationId: 'cmd-1',
        transactionId: 'act-1',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          reason: 'roomLost',
        },
      },
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-9',
      eventType: 'MatchAborted',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 11,
      occurredAt: '2026-07-30T10:00:08.000Z',
      payload: {
        reason: 'roomLost',
      },
    });
  });

  it('keeps the full payload for internal viewers', () => {
    const projector = new DuelEventProjectorService();

    const projected = projector.project(
      {
        eventId: 'evt-internal',
        eventType: 'LifeCardTaken',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 12,
        occurredAt: '2026-07-30T10:00:09.000Z',
        recordedAt: '2026-07-30T10:00:09.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-3',
        transactionId: 'act-3',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-2',
          count: 1,
          cardInstanceId: 'life-1',
          cardDefinitionId: 'OP99-123',
          destinationZone: 'HAND',
        },
      },
      {
        viewerType: 'INTERNAL',
        scopes: [],
        matchEnded: false,
      },
    );

    expect(projected).toEqual({
      eventId: 'evt-internal',
      eventType: 'LifeCardTaken',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 12,
      occurredAt: '2026-07-30T10:00:09.000Z',
      payload: {
        playerId: 'player-2',
        count: 1,
        cardInstanceId: 'life-1',
        cardDefinitionId: 'OP99-123',
        destinationZone: 'HAND',
      },
    });
  });
});
