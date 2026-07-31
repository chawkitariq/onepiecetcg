import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  DuelEventStreamParticipant,
  DuelEventStreamStatus,
} from './duel-domain-event.types';

/**
 * One ordered domain-event stream per duel match. Sequence numbers are scoped
 * to `matchId`, not globally.
 */
@Entity({ name: 'duel_event_streams' })
export class DuelEventStream {
  @PrimaryColumn({ type: 'varchar' })
  matchId!: string;

  @Column({ type: 'int', default: 0 })
  lastSequenceNumber!: number;

  @Column({ type: 'varchar', default: 'OPEN' })
  status!: DuelEventStreamStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  participants!: DuelEventStreamParticipant[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
