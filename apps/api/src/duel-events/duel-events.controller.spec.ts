jest.mock('@thallesp/nestjs-better-auth', () => ({
  AuthGuard: class AuthGuard {},
}));

import { ForbiddenException } from '@nestjs/common';
import { DuelEventsController } from './duel-events.controller';
import type { EventViewerContext } from './duel-event-projector.service';

async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('DuelEventsController', () => {
  it('treats MatchAborted as a terminal event when projecting published events', async () => {
    const listPublishedEvents = jest.fn().mockResolvedValue([
      {
        eventId: 'evt-1',
        eventType: 'MatchAborted',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 3,
        occurredAt: '2026-07-30T10:00:00.000Z',
        recordedAt: '2026-07-30T10:00:00.050Z',
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
    ]);
    const project = jest.fn().mockReturnValue({
      eventId: 'evt-1',
      eventType: 'MatchAborted',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 3,
      occurredAt: '2026-07-30T10:00:00.000Z',
      payload: {
        reason: 'roomLost',
      },
    });
    const controller = new DuelEventsController(
      {
        listPublishedEvents,
        getStreamStatus: jest.fn().mockResolvedValue('ABORTED'),
      } as never,
      {
        project,
      } as never,
    );

    const result = await controller.listPublishedEvents('match-1', 0, 100);

    expect(listPublishedEvents).toHaveBeenCalledWith({
      matchId: 'match-1',
      afterSequenceNumber: 0,
      limit: 100,
    });
    expect(project).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'MatchAborted',
      }),
      {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded: true,
      },
    );
    expect(result).toEqual({
      events: [
        {
          eventId: 'evt-1',
          eventType: 'MatchAborted',
          eventVersion: 1,
          matchId: 'match-1',
          sequenceNumber: 3,
          occurredAt: '2026-07-30T10:00:00.000Z',
          payload: {
            reason: 'roomLost',
          },
        },
      ],
      streamStatus: 'ABORTED',
    });
  });

  it('streams projected published events and completes on MatchAborted', async () => {
    const listPublishedEvents = jest
      .fn()
      .mockResolvedValueOnce([
        {
          eventId: 'evt-1',
          eventType: 'MatchAborted',
          eventVersion: 1,
          matchId: 'match-1',
          sequenceNumber: 3,
          occurredAt: '2026-07-30T10:00:00.000Z',
          recordedAt: '2026-07-30T10:00:00.050Z',
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
      ])
      .mockResolvedValue([]);
    const getStreamStatus = jest.fn().mockResolvedValue('ABORTED');
    const project = jest.fn().mockReturnValue({
      eventId: 'evt-1',
      eventType: 'MatchAborted',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 3,
      occurredAt: '2026-07-30T10:00:00.000Z',
      payload: {
        reason: 'roomLost',
      },
    });
    const controller = new DuelEventsController(
      {
        listPublishedEvents,
        getStreamStatus,
      } as never,
      {
        project,
      } as never,
    );

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn<(reason: unknown) => void>();

    controller
      .subscribePublishedEvents('match-1', 0, 100)
      .subscribe({ next, complete, error });

    await flushAsyncWork();

    expect(listPublishedEvents).toHaveBeenCalledWith({
      matchId: 'match-1',
      afterSequenceNumber: 0,
      limit: 100,
    });
    expect(getStreamStatus).toHaveBeenCalledWith('match-1');
    expect(next.mock.calls).toEqual([
      [
        {
          type: 'streamStatus',
          data: {
            matchId: 'match-1',
            streamStatus: 'ABORTED',
          },
        },
      ],
      [
        {
          id: '3',
          type: 'MatchAborted',
          data: {
            eventId: 'evt-1',
            eventType: 'MatchAborted',
            eventVersion: 1,
            matchId: 'match-1',
            sequenceNumber: 3,
            occurredAt: '2026-07-30T10:00:00.000Z',
            payload: {
              reason: 'roomLost',
            },
          },
        },
      ],
    ]);
    expect(complete).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('streams NOT_FOUND once and completes when no stream exists', async () => {
    const controller = new DuelEventsController(
      {
        listPublishedEvents: jest.fn().mockResolvedValue([]),
        getStreamStatus: jest.fn().mockResolvedValue(null),
      } as never,
      {
        project: jest.fn(),
      } as never,
    );

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    controller
      .subscribePublishedEvents('missing-match', 0, 100)
      .subscribe({ next, complete, error });

    await flushAsyncWork();

    expect(next).toHaveBeenCalledWith({
      type: 'streamStatus',
      data: {
        matchId: 'missing-match',
        streamStatus: 'NOT_FOUND',
      },
    });
    expect(complete).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('resumes the public live stream after a given sequence number', async () => {
    const listPublishedEvents = jest.fn().mockResolvedValueOnce([
      {
        eventId: 'evt-43',
        eventType: 'TurnStarted',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 43,
        occurredAt: '2026-07-30T10:00:43.000Z',
        recordedAt: '2026-07-30T10:00:43.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-43',
        transactionId: 'act-43',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          turn: 4,
          playerId: 'player-1',
        },
      },
    ]);
    const getStreamStatus = jest.fn().mockResolvedValue('OPEN');
    const project = jest.fn().mockReturnValue({
      eventId: 'evt-43',
      eventType: 'TurnStarted',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 43,
      occurredAt: '2026-07-30T10:00:43.000Z',
      payload: {
        turn: 4,
        playerId: 'player-1',
      },
    });
    const controller = new DuelEventsController(
      {
        listPublishedEvents,
        getStreamStatus,
      } as never,
      {
        project,
      } as never,
    );

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    controller
      .subscribePublishedEvents('match-1', 42, 100)
      .subscribe({ next, complete, error });

    await flushAsyncWork();

    expect(listPublishedEvents).toHaveBeenCalledWith({
      matchId: 'match-1',
      afterSequenceNumber: 42,
      limit: 100,
    });
    expect(next.mock.calls).toEqual([
      [
        {
          type: 'streamStatus',
          data: {
            matchId: 'match-1',
            streamStatus: 'OPEN',
          },
        },
      ],
      [
        {
          id: '43',
          type: 'TurnStarted',
          data: {
            eventId: 'evt-43',
            eventType: 'TurnStarted',
            eventVersion: 1,
            matchId: 'match-1',
            sequenceNumber: 43,
            occurredAt: '2026-07-30T10:00:43.000Z',
            payload: {
              turn: 4,
              playerId: 'player-1',
            },
          },
        },
      ],
    ]);
    expect(complete).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('reports NOT_FOUND when the published stream does not exist', async () => {
    const controller = new DuelEventsController(
      {
        listPublishedEvents: jest.fn().mockResolvedValue([]),
        getStreamStatus: jest.fn().mockResolvedValue(null),
      } as never,
      {
        project: jest.fn(),
      } as never,
    );

    const result = await controller.listPublishedEvents(
      'missing-match',
      0,
      100,
    );

    expect(result).toEqual({
      events: [],
      streamStatus: 'NOT_FOUND',
    });
  });

  it('projects the owner view for the authenticated participant', async () => {
    const listPublishedEvents = jest.fn().mockResolvedValue([
      {
        eventId: 'evt-owner',
        eventType: 'CardDrawn',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 7,
        occurredAt: '2026-07-30T10:00:10.000Z',
        recordedAt: '2026-07-30T10:00:10.050Z',
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
    ]);
    const getPlayerIdForAuthUser = jest.fn().mockResolvedValue('player-1');
    const getStreamStatus = jest.fn().mockResolvedValue('OPEN');
    const project = jest.fn((_event: unknown, context: EventViewerContext) => ({
      eventId: 'evt-owner',
      eventType: 'CardDrawn',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 7,
      occurredAt: '2026-07-30T10:00:10.000Z',
      payload: {
        viewerType: context.viewerType,
        playerId: context.playerId,
      },
    }));
    const controller = new DuelEventsController(
      {
        listPublishedEvents,
        getStreamStatus,
        getPlayerIdForAuthUser,
      } as never,
      {
        project,
      } as never,
    );

    const result = await controller.listMyPublishedEvents(
      {
        user: { id: 'auth-user-1' },
      } as never,
      'match-1',
      0,
      100,
    );

    expect(getPlayerIdForAuthUser).toHaveBeenCalledWith(
      'match-1',
      'auth-user-1',
    );
    expect(project).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'CardDrawn',
      }),
      {
        viewerType: 'PLAYER',
        playerId: 'player-1',
        scopes: [],
        matchEnded: false,
      },
    );
    expect(result).toEqual({
      events: [
        {
          eventId: 'evt-owner',
          eventType: 'CardDrawn',
          eventVersion: 1,
          matchId: 'match-1',
          sequenceNumber: 7,
          occurredAt: '2026-07-30T10:00:10.000Z',
          payload: {
            viewerType: 'PLAYER',
            playerId: 'player-1',
          },
        },
      ],
      streamStatus: 'OPEN',
    });
  });

  it('rejects owner view access for a non-participant', async () => {
    const controller = new DuelEventsController(
      {
        listPublishedEvents: jest.fn(),
        getStreamStatus: jest.fn(),
        getPlayerIdForAuthUser: jest.fn().mockResolvedValue(null),
      } as never,
      {
        project: jest.fn(),
      } as never,
    );

    await expect(
      controller.listMyPublishedEvents(
        {
          user: { id: 'auth-user-3' },
        } as never,
        'match-1',
        0,
        100,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('streams the owner view for the authenticated participant', async () => {
    const listPublishedEvents = jest.fn().mockResolvedValueOnce([
      {
        eventId: 'evt-owner-live',
        eventType: 'CardDrawn',
        eventVersion: 1,
        matchId: 'match-1',
        sequenceNumber: 8,
        occurredAt: '2026-07-30T10:00:11.000Z',
        recordedAt: '2026-07-30T10:00:11.050Z',
        actorPlayerId: 'player-1',
        correlationId: 'match-1',
        causationId: 'cmd-2',
        transactionId: 'act-2',
        engineVersion: 'engine-test',
        rulesetVersion: 'ruleset-test',
        payload: {
          playerId: 'player-1',
          count: 1,
          cardInstanceId: 'secret-live-draw',
          cardDefinitionId: 'OP99-777',
        },
      },
    ]);
    const getPlayerIdForAuthUser = jest.fn().mockResolvedValue('player-1');
    const getStreamStatus = jest.fn().mockResolvedValue('OPEN');
    const project = jest.fn((_event: unknown, context: EventViewerContext) => ({
      eventId: 'evt-owner-live',
      eventType: 'CardDrawn',
      eventVersion: 1,
      matchId: 'match-1',
      sequenceNumber: 8,
      occurredAt: '2026-07-30T10:00:11.000Z',
      payload: {
        viewerType: context.viewerType,
        playerId: context.playerId,
      },
    }));
    const controller = new DuelEventsController(
      {
        listPublishedEvents,
        getStreamStatus,
        getPlayerIdForAuthUser,
      } as never,
      {
        project,
      } as never,
    );

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    controller
      .subscribeMyPublishedEvents(
        {
          user: { id: 'auth-user-1' },
        } as never,
        'match-1',
        0,
        100,
      )
      .subscribe({ next, complete, error });

    await flushAsyncWork();

    expect(getPlayerIdForAuthUser).toHaveBeenCalledWith(
      'match-1',
      'auth-user-1',
    );
    expect(project).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'CardDrawn',
      }),
      {
        viewerType: 'PLAYER',
        playerId: 'player-1',
        scopes: [],
        matchEnded: false,
      },
    );
    expect(next.mock.calls).toEqual([
      [
        {
          type: 'streamStatus',
          data: {
            matchId: 'match-1',
            streamStatus: 'OPEN',
          },
        },
      ],
      [
        {
          id: '8',
          type: 'CardDrawn',
          data: {
            eventId: 'evt-owner-live',
            eventType: 'CardDrawn',
            eventVersion: 1,
            matchId: 'match-1',
            sequenceNumber: 8,
            occurredAt: '2026-07-30T10:00:11.000Z',
            payload: {
              viewerType: 'PLAYER',
              playerId: 'player-1',
            },
          },
        },
      ],
    ]);
    expect(complete).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('rejects owner live subscription for a non-participant', async () => {
    const controller = new DuelEventsController(
      {
        listPublishedEvents: jest.fn(),
        getStreamStatus: jest.fn(),
        getPlayerIdForAuthUser: jest.fn().mockResolvedValue(null),
      } as never,
      {
        project: jest.fn(),
      } as never,
    );

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    controller
      .subscribeMyPublishedEvents(
        {
          user: { id: 'auth-user-3' },
        } as never,
        'match-1',
        0,
        100,
      )
      .subscribe({ next, complete, error });

    await flushAsyncWork();

    expect(next).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    const firstErrorCall = error.mock.calls.at(0) as [unknown] | undefined;
    const firstError = firstErrorCall?.[0];
    expect(firstError).toBeInstanceOf(ForbiddenException);
  });
});
