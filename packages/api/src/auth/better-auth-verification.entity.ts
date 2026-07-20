import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'verification' })
export class BetterAuthVerification {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Index()
  @Column({ type: 'text' })
  identifier!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
