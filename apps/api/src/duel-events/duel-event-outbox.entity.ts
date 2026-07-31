import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import type { CanonicalDomainEventMetadata } from './duel-domain-event.types';

/**
 * Durable outbox row published asynchronously by the relay. `payload` and
 * `metadata` stay JSON so downstream projections can evolve independently.
 */
@Entity({ name: 'duel_event_outbox' })
@Index(['matchId', 'sequenceNumber'], { unique: true })
@Index(['status', 'nextAttemptAt'])
export class DuelEventOutbox {
  @PrimaryColumn({ type: 'varchar' })
  eventId!: string;

  @Column({ type: 'varchar' })
  matchId!: string;

  @Column({ type: 'int' })
  sequenceNumber!: number;

  @Column({ type: 'varchar' })
  eventType!: string;

  @Column({ type: 'int' })
  eventVersion!: number;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  metadata!: CanonicalDomainEventMetadata;

  @Column({ type: 'varchar', default: 'PENDING' })
  status!: 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED';

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  attemptCount!: number;

  @Column({ type: 'timestamptz', nullable: true })
  nextAttemptAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  lastError!: string | null;
}
