import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DuelEventBusService } from './duel-event-bus.service';
import { DuelEventOutbox } from './duel-event-outbox.entity';
import type { CanonicalDomainEvent } from './duel-domain-event.types';

const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_RETRY_BASE_MS = 2_000;
const DEFAULT_RELAY_INTERVAL_MS = 1_000;
const MAX_ATTEMPTS = 10;

/**
 * Background worker that asynchronously publishes `PENDING` outbox rows and
 * marks them published or rescheduled.
 */
@Injectable()
export class DuelEventRelayService {
  private readonly logger = new Logger(DuelEventRelayService.name);

  private isProcessing = false;

  public constructor(
    @InjectRepository(DuelEventOutbox)
    private readonly outbox: Repository<DuelEventOutbox>,
    private readonly bus: DuelEventBusService,
  ) {}

  /** Runs the outbox polling worker on Nest's scheduler interval. */
  @Interval(DEFAULT_RELAY_INTERVAL_MS)
  public async runScheduledBatch(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      await this.processPendingBatch();
    } finally {
      this.isProcessing = false;
    }
  }

  /** Publishes the next due batch of outbox rows. */
  public async processPendingBatch(
    batchSize = DEFAULT_BATCH_SIZE,
  ): Promise<number> {
    const dueRows = await this.claimPendingBatch(batchSize);

    if (dueRows.length === 0) {
      return 0;
    }

    let published = 0;

    for (const row of dueRows) {
      try {
        await this.bus.publish([this.toCanonicalEvent(row)]);
        row.status = 'PUBLISHED';
        row.publishedAt = new Date();
        row.nextAttemptAt = null;
        row.lastError = null;
        published += 1;
      } catch (error) {
        row.attemptCount += 1;
        row.lastError =
          error instanceof Error ? error.message : 'Unknown publish error';

        if (row.attemptCount >= MAX_ATTEMPTS) {
          row.status = 'FAILED';
          row.nextAttemptAt = null;
          this.logger.error(
            `Duel event ${row.eventId} permanently failed after ${row.attemptCount} attempt(s).`,
          );
        } else {
          row.status = 'PENDING';
          row.nextAttemptAt = new Date(
            Date.now() + DEFAULT_RETRY_BASE_MS * row.attemptCount,
          );
        }
      }
    }

    await this.outbox.save(dueRows);

    return published;
  }

  private async claimPendingBatch(
    batchSize: number,
  ): Promise<DuelEventOutbox[]> {
    return this.outbox.manager.transaction(async (manager) => {
      const now = new Date().toISOString();
      const rows = await manager
        .createQueryBuilder(DuelEventOutbox, 'outbox')
        .where('outbox.status = :status', { status: 'PENDING' })
        .andWhere(
          '(outbox.nextAttemptAt IS NULL OR outbox.nextAttemptAt <= :now)',
          { now },
        )
        .orderBy('outbox.createdAt', 'ASC')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .take(batchSize)
        .getMany();

      if (rows.length === 0) {
        return rows;
      }

      for (const row of rows) {
        row.status = 'PROCESSING';
      }

      await manager.save(DuelEventOutbox, rows);

      return rows;
    });
  }

  private toCanonicalEvent(row: DuelEventOutbox): CanonicalDomainEvent {
    return {
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
    };
  }
}
