import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import type {
  CanonicalDomainEvent,
  ListPublishedDuelEventsInput,
} from './duel-domain-event.types';

/**
 * Read-side helper that exposes the ordered, already-published event stream
 * for catch-up and replay-oriented consumers.
 */
@Injectable()
export class DuelEventJournalService {
  public constructor(
    @InjectRepository(DuelEventOutbox)
    private readonly outbox: Repository<DuelEventOutbox>,
  ) {}

  /** Lists published canonical events for one match after a given sequence. */
  public async listPublishedEvents(
    input: ListPublishedDuelEventsInput,
  ): Promise<CanonicalDomainEvent[]> {
    const rows = await this.outbox.find({
      where: {
        matchId: input.matchId,
        status: 'PUBLISHED',
        sequenceNumber: MoreThan(input.afterSequenceNumber ?? 0),
      },
      order: { sequenceNumber: 'ASC' },
      take: Math.max(1, Math.min(input.limit ?? 100, 500)),
    });

    return rows.map((row) => ({
      eventId: row.eventId,
      eventType: row.eventType,
      eventVersion: row.eventVersion,
      matchId: row.matchId,
      sequenceNumber: row.sequenceNumber,
      occurredAt: row.metadata.occurredAt,
      recordedAt: row.metadata.recordedAt,
      actorPlayerId: row.metadata.actorPlayerId,
      correlationId: row.metadata.correlationId,
      causationId: row.metadata.causationId,
      transactionId: row.metadata.transactionId,
      engineVersion: row.metadata.engineVersion,
      rulesetVersion: row.metadata.rulesetVersion,
      payload: row.payload,
    }));
  }
}
