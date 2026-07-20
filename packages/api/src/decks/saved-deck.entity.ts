import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerAccount } from '../accounts/player-account.entity';

@Entity({ name: 'saved_decks' })
export class SavedDeck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => PlayerAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: PlayerAccount;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  leaderCardId!: string;

  @Column({ type: 'jsonb' })
  cards!: Array<{ cardId: string; quantity: number }>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
