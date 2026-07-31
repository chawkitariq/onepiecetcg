import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'session' })
export class BetterAuthSession {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'text', unique: true })
  token!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'text', nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent!: string | null;

  @Index()
  @Column({ type: 'text' })
  userId!: string;
}
