import {
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { DuelDomainEventsService } from './duel-domain-events.service';
import type { DuelEventStreamStatus } from './duel-domain-event.types';
import {
  type EventViewerContext,
  DuelEventProjectorService,
  type ExposedDomainEvent,
} from './duel-event-projector.service';
import type { AuthenticatedUser } from '../player-account/player-account.service';

const PUBLISHED_EVENTS_POLL_INTERVAL_MS = 1_000;
type PublishedStreamStatus = DuelEventStreamStatus | 'NOT_FOUND';
type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@UseGuards(AuthGuard)
@Controller('duel-events')
export class DuelEventsController {
  public constructor(
    private readonly duelEvents: DuelDomainEventsService,
    private readonly projector: DuelEventProjectorService,
  ) {}

  /**
   * Returns the published event stream for one match after projection through
   * the safe third-party/public view.
   */
  @Get(':matchId/published')
  public async listPublishedEvents(
    @Param('matchId') matchId: string,
    @Query('afterSequenceNumber', new DefaultValuePipe(0), ParseIntPipe)
    afterSequenceNumber: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<{
    events: ExposedDomainEvent[];
    streamStatus: PublishedStreamStatus;
  }> {
    const [events, streamStatus] = await Promise.all([
      this.duelEvents.listPublishedEvents({
        matchId,
        afterSequenceNumber,
        limit,
      }),
      this.getPublishedStreamStatus(matchId),
    ]);

    return {
      events: events.flatMap((event) => {
        const projected = this.projectPublishedEvent(event);

        return projected ? [projected] : [];
      }),
      streamStatus,
    };
  }

  /** Returns the published event stream for the authenticated match participant. */
  @Get(':matchId/me/published')
  public async listMyPublishedEvents(
    @Req() request: AuthenticatedRequest,
    @Param('matchId') matchId: string,
    @Query('afterSequenceNumber', new DefaultValuePipe(0), ParseIntPipe)
    afterSequenceNumber: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<{
    events: ExposedDomainEvent[];
    streamStatus: PublishedStreamStatus;
  }> {
    const viewerContext = await this.getPlayerViewerContextOrThrow(
      matchId,
      request.user.id,
    );
    const [events, streamStatus] = await Promise.all([
      this.duelEvents.listPublishedEvents({
        matchId,
        afterSequenceNumber,
        limit,
      }),
      this.getPublishedStreamStatus(matchId),
    ]);

    return {
      events: events.flatMap((event) => {
        const projected = this.projectPublishedEvent(event, viewerContext);

        return projected ? [projected] : [];
      }),
      streamStatus,
    };
  }

  /**
   * Streams newly published events for one match through the same third-party
   * visibility projection used by the catch-up HTTP endpoint.
   */
  @Sse(':matchId/subscribe')
  public subscribePublishedEvents(
    @Param('matchId') matchId: string,
    @Query('afterSequenceNumber', new DefaultValuePipe(0), ParseIntPipe)
    afterSequenceNumber: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      let lastSequenceNumber = afterSequenceNumber;
      let lastStreamStatus: PublishedStreamStatus | null = null;
      let inFlight = false;
      let stopped = false;

      const poll = async () => {
        if (stopped || inFlight) {
          return;
        }

        inFlight = true;

        try {
          const [events, streamStatus] = await Promise.all([
            this.duelEvents.listPublishedEvents({
              matchId,
              afterSequenceNumber: lastSequenceNumber,
              limit,
            }),
            this.getPublishedStreamStatus(matchId),
          ]);

          if (streamStatus !== lastStreamStatus) {
            lastStreamStatus = streamStatus;
            subscriber.next({
              type: 'streamStatus',
              data: {
                matchId,
                streamStatus,
              },
            });
          }

          for (const event of events) {
            lastSequenceNumber = event.sequenceNumber;
            const projected = this.projectPublishedEvent(event);

            if (projected) {
              subscriber.next({
                id: String(projected.sequenceNumber),
                type: projected.eventType,
                data: projected,
              });
            }

            if (
              event.eventType === 'MatchEnded' ||
              event.eventType === 'MatchAborted'
            ) {
              stopped = true;
              subscriber.complete();
              break;
            }
          }

          if (
            !stopped &&
            events.length === 0 &&
            (streamStatus === 'COMPLETED' ||
              streamStatus === 'ABORTED' ||
              streamStatus === 'NOT_FOUND')
          ) {
            stopped = true;
            subscriber.complete();
          }
        } catch (error) {
          stopped = true;
          subscriber.error(error);
        } finally {
          inFlight = false;
        }
      };

      void poll();
      const timer = setInterval(() => {
        void poll();
      }, PUBLISHED_EVENTS_POLL_INTERVAL_MS);

      return () => {
        stopped = true;
        clearInterval(timer);
      };
    });
  }

  /** Streams newly published events for the authenticated match participant. */
  @Sse(':matchId/me/subscribe')
  public subscribeMyPublishedEvents(
    @Req() request: AuthenticatedRequest,
    @Param('matchId') matchId: string,
    @Query('afterSequenceNumber', new DefaultValuePipe(0), ParseIntPipe)
    afterSequenceNumber: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      let lastSequenceNumber = afterSequenceNumber;
      let lastStreamStatus: PublishedStreamStatus | null = null;
      let inFlight = false;
      let stopped = false;

      const poll = async () => {
        if (stopped || inFlight) {
          return;
        }

        inFlight = true;

        try {
          const viewerContext = await this.getPlayerViewerContextOrThrow(
            matchId,
            request.user.id,
          );
          const [events, streamStatus] = await Promise.all([
            this.duelEvents.listPublishedEvents({
              matchId,
              afterSequenceNumber: lastSequenceNumber,
              limit,
            }),
            this.getPublishedStreamStatus(matchId),
          ]);

          if (streamStatus !== lastStreamStatus) {
            lastStreamStatus = streamStatus;
            subscriber.next({
              type: 'streamStatus',
              data: {
                matchId,
                streamStatus,
              },
            });
          }

          for (const event of events) {
            lastSequenceNumber = event.sequenceNumber;
            const projected = this.projectPublishedEvent(event, viewerContext);

            if (projected) {
              subscriber.next({
                id: String(projected.sequenceNumber),
                type: projected.eventType,
                data: projected,
              });
            }

            if (
              event.eventType === 'MatchEnded' ||
              event.eventType === 'MatchAborted'
            ) {
              stopped = true;
              subscriber.complete();
              break;
            }
          }

          if (
            !stopped &&
            events.length === 0 &&
            (streamStatus === 'COMPLETED' ||
              streamStatus === 'ABORTED' ||
              streamStatus === 'NOT_FOUND')
          ) {
            stopped = true;
            subscriber.complete();
          }
        } catch (error) {
          stopped = true;
          subscriber.error(error);
        } finally {
          inFlight = false;
        }
      };

      void poll();
      const timer = setInterval(() => {
        void poll();
      }, PUBLISHED_EVENTS_POLL_INTERVAL_MS);

      return () => {
        stopped = true;
        clearInterval(timer);
      };
    });
  }

  private projectPublishedEvent(
    event: {
      eventType: string;
      eventVersion: number;
      matchId: string;
      sequenceNumber: number;
      occurredAt: string;
      eventId: string;
      payload: Record<string, unknown>;
    },
    context?: EventViewerContext,
  ): ExposedDomainEvent | null {
    return this.projector.project(
      event as never,
      context ?? {
        viewerType: 'THIRD_PARTY',
        scopes: [],
        matchEnded:
          event.eventType === 'MatchEnded' ||
          event.eventType === 'MatchAborted',
      },
    );
  }

  private async getPublishedStreamStatus(
    matchId: string,
  ): Promise<PublishedStreamStatus> {
    return (await this.duelEvents.getStreamStatus(matchId)) ?? 'NOT_FOUND';
  }

  private async getPlayerViewerContextOrThrow(
    matchId: string,
    authUserId: string,
  ): Promise<EventViewerContext> {
    const playerId = await this.duelEvents.getPlayerIdForAuthUser(
      matchId,
      authUserId,
    );

    if (!playerId) {
      throw new ForbiddenException('You are not a participant in this match.');
    }

    return {
      viewerType: 'PLAYER',
      playerId,
      scopes: [],
      matchEnded: false,
    };
  }
}
