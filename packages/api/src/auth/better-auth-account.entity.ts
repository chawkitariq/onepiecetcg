import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'account' })
export class BetterAuthAccount {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  accountId!: string;

  @Column({ type: 'text' })
  providerId!: string;

  @Index()
  @Column({ type: 'text' })
  userId!: string;

  @Column({ type: 'text', nullable: true })
  accessToken!: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken!: string | null;

  @Column({ type: 'text', nullable: true })
  idToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  accessTokenExpiresAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  scope!: string | null;

  @Column({ type: 'text', nullable: true })
  password!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
