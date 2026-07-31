import { Injectable } from '@nestjs/common';
import { DuelEventJournalService } from './duel-event-journal.service';
import { DuelEventRecorderService } from './duel-event-recorder.service';
import { DuelEventStreamService } from './duel-event-stream.service';
import type {
  CanonicalDomainEvent,
  CreateDuelEventStreamInput,
  DuelEventStreamStatus,
  ListPublishedDuelEventsInput,
  RecordValidatedDuelEventsInput,
  RecordedDuelEvents,
} from './duel-domain-event.types';

/**
 * Facade used by transport adapters such as `DuelRoom` to interact with the
 * event-stream foundation without depending on repository details.
 */
@Injectable()
export class DuelDomainEventsService {
  public constructor(
    private readonly streamService: DuelEventStreamService,
    private readonly recorder: DuelEventRecorderService,
    private readonly journal: DuelEventJournalService,
  ) {}

  /** Opens a new stream for a match and records its first event. */
  public createStream(
    input: CreateDuelEventStreamInput,
  ): Promise<CanonicalDomainEvent<'MatchCreated'>> {
    return this.streamService.createStream(input);
  }

  /** Returns the current lifecycle status of one match stream, if it exists. */
  public getStreamStatus(
    matchId: string,
  ): Promise<DuelEventStreamStatus | null> {
    return this.streamService.getStreamStatus(matchId);
  }

  /** Returns the duel-local player id for an authenticated stream participant. */
  public getPlayerIdForAuthUser(
    matchId: string,
    authUserId: string,
  ): Promise<string | null> {
    return this.streamService.getPlayerIdForAuthUser(matchId, authUserId);
  }

  /** Appends validated event drafts to an existing match stream. */
  public record(
    input: RecordValidatedDuelEventsInput,
  ): Promise<RecordedDuelEvents> {
    return this.recorder.record(input);
  }

  /** Returns the ordered, already-published events for catch-up consumers. */
  public listPublishedEvents(
    input: ListPublishedDuelEventsInput,
  ): Promise<CanonicalDomainEvent[]> {
    return this.journal.listPublishedEvents(input);
  }
}
