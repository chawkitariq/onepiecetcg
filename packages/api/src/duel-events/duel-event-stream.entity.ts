import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  status!: 'OPEN' | 'COMPLETED' | 'ABORTED';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
