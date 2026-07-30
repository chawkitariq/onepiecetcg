import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import { DuelEventStreamAlreadyExistsError } from './duel-event-errors';
import { DuelEventStream } from './duel-event-stream.entity';
import type {
  CanonicalDomainEvent,
  CanonicalDomainEventMetadata,
  CreateDuelEventStreamInput,
} from './duel-domain-event.types';
import { assertSupportedDomainEvent } from './duel-event-registry';

/**
 * Creates duel event streams and their first canonical `MatchCreated` event in
 * the same database transaction.
 */
@Injectable()
export class DuelEventStreamService {
  public constructor(private readonly dataSource: DataSource) {}

  /** Atomically opens a new match stream and inserts sequence 1. */
  public async createStream(
    input: CreateDuelEventStreamInput,
  ): Promise<CanonicalDomainEvent<'MatchCreated'>> {
    assertSupportedDomainEvent({
      type: 'MatchCreated',
      version: 1,
      payload: input.matchCreatedPayload,
    });

    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(DuelEventStream, {
        where: { matchId: input.matchId },
      });

      if (existing) {
        throw new DuelEventStreamAlreadyExistsError(input.matchId);
      }

      const now = new Date();
      const occurredAt = now.toISOString();
      const recordedAt = occurredAt;
      const eventId = crypto.randomUUID();
      const metadata: CanonicalDomainEventMetadata = {
        eventId,
        occurredAt,
        recordedAt,
        actorPlayerId: input.actorPlayerId,
        correlationId: input.matchId,
        causationId: eventId,
        transactionId: eventId,
        engineVersion: input.engineVersion,
        rulesetVersion: input.rulesetVersion,
      };

      const stream = manager.create(DuelEventStream, {
        matchId: input.matchId,
        lastSequenceNumber: 1,
        status: 'OPEN',
      });
      const outboxRow = manager.create(DuelEventOutbox, {
        eventId,
        matchId: input.matchId,
        sequenceNumber: 1,
        eventType: 'MatchCreated',
        eventVersion: 1,
        payload: input.matchCreatedPayload,
        metadata,
        status: 'PENDING',
        publishedAt: null,
        attemptCount: 0,
        nextAttemptAt: null,
        lastError: null,
      });

      await manager.save(DuelEventStream, stream);
      await manager.save(DuelEventOutbox, outboxRow);

      return {
        eventId,
        eventType: 'MatchCreated',
        eventVersion: 1,
        matchId: input.matchId,
        sequenceNumber: 1,
        occurredAt,
        recordedAt,
        actorPlayerId: input.actorPlayerId,
        correlationId: input.matchId,
        causationId: eventId,
        transactionId: eventId,
        engineVersion: input.engineVersion,
        rulesetVersion: input.rulesetVersion,
        payload: input.matchCreatedPayload,
      };
    });
  }
}
