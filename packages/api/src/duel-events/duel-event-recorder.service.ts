import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import {
  DuelEventStreamClosedError,
  DuelEventStreamNotFoundError,
} from './duel-event-errors';
import { DuelEventStream } from './duel-event-stream.entity';
import type {
  CanonicalDomainEvent,
  CanonicalDomainEventMetadata,
  RecordValidatedDuelEventsInput,
  RecordedDuelEvents,
} from './duel-domain-event.types';
import { assertSupportedDomainEvent } from './duel-event-registry';

/**
 * Appends validated gameplay events to a match-local sequence inside the
 * transactional outbox.
 */
@Injectable()
export class DuelEventRecorderService {
  public constructor(private readonly dataSource: DataSource) {}

  /** Sequences and persists canonical events for an existing match stream. */
  public async record(
    input: RecordValidatedDuelEventsInput,
  ): Promise<RecordedDuelEvents> {
    for (const draft of input.eventDrafts) {
      assertSupportedDomainEvent(draft);
    }

    if (input.eventDrafts.length === 0) {
      const stream = await this.dataSource
        .getRepository(DuelEventStream)
        .findOne({
          where: { matchId: input.matchId },
        });

      if (!stream) {
        throw new DuelEventStreamNotFoundError(input.matchId);
      }

      if (stream.status !== 'OPEN') {
        throw new DuelEventStreamClosedError(input.matchId, stream.status);
      }

      return { events: [], lastSequenceNumber: stream.lastSequenceNumber };
    }

    return this.dataSource.transaction(async (manager) => {
      const stream = await manager.findOne(DuelEventStream, {
        where: { matchId: input.matchId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!stream) {
        throw new DuelEventStreamNotFoundError(input.matchId);
      }

      if (stream.status !== 'OPEN') {
        throw new DuelEventStreamClosedError(input.matchId, stream.status);
      }

      const recordedAt = new Date().toISOString();
      let nextSequenceNumber = stream.lastSequenceNumber + 1;
      const canonicalEvents: CanonicalDomainEvent[] = [];
      const outboxRows: DuelEventOutbox[] = [];

      for (const draft of input.eventDrafts) {
        const eventId = crypto.randomUUID();
        const occurredAt = new Date().toISOString();
        const metadata: CanonicalDomainEventMetadata = {
          eventId,
          occurredAt,
          recordedAt,
          actorPlayerId: input.actorPlayerId,
          correlationId: input.matchId,
          causationId: input.commandId,
          transactionId: input.actionId,
          engineVersion: input.engineVersion,
          rulesetVersion: input.rulesetVersion,
        };
        const canonicalEvent: CanonicalDomainEvent = {
          eventId,
          eventType: draft.type,
          eventVersion: draft.version,
          matchId: input.matchId,
          sequenceNumber: nextSequenceNumber,
          occurredAt,
          recordedAt,
          actorPlayerId: input.actorPlayerId,
          correlationId: input.matchId,
          causationId: input.commandId,
          transactionId: input.actionId,
          engineVersion: input.engineVersion,
          rulesetVersion: input.rulesetVersion,
          payload: draft.payload,
        };

        canonicalEvents.push(canonicalEvent);
        outboxRows.push(
          manager.create(DuelEventOutbox, {
            eventId,
            matchId: input.matchId,
            sequenceNumber: nextSequenceNumber,
            eventType: draft.type,
            eventVersion: draft.version,
            payload: draft.payload,
            metadata,
            status: 'PENDING',
            publishedAt: null,
            attemptCount: 0,
            nextAttemptAt: null,
            lastError: null,
          }),
        );
        nextSequenceNumber += 1;
      }

      const lastSequenceNumber = nextSequenceNumber - 1;
      stream.lastSequenceNumber = lastSequenceNumber;

      const closesStream = canonicalEvents.some(
        (event) => event.eventType === 'MatchEnded',
      );

      if (closesStream) {
        stream.status = 'COMPLETED';
      }

      await manager.save(DuelEventStream, stream);
      await manager.save(DuelEventOutbox, outboxRows);

      return {
        events: canonicalEvents,
        lastSequenceNumber,
      };
    });
  }
}
