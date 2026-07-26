import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerAccount } from '../accounts/player-account.entity';
import { SavedDeck } from '../decks/saved-deck.entity';

/**
 * One row per duel that ended via a clean structural game-end (life-to-zero
 * or deck-out, docs/spec.md §3). Forfeits from a disconnection that outlasts
 * the reconnection window (docs/spec.md §3) are never recorded here (§8).
 *
 * `winnerLeaderCardId`/`loserLeaderCardId` are denormalized rather than only
 * derived through `winnerDeck`/`loserDeck` because a saved deck's Leader can
 * change or the deck can be deleted after the match -- the Leader actually
 * played in this match must stay queryable regardless.
 */
@Entity({ name: 'match_results' })
export class MatchResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  winnerAccountId!: string;

  @ManyToOne(() => PlayerAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'winnerAccountId' })
  winnerAccount!: PlayerAccount;

  @Column({ type: 'uuid' })
  loserAccountId!: string;

  @ManyToOne(() => PlayerAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loserAccountId' })
  loserAccount!: PlayerAccount;

  @Column({ type: 'uuid', nullable: true })
  winnerDeckId!: string | null;

  @ManyToOne(() => SavedDeck, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'winnerDeckId' })
  winnerDeck!: SavedDeck | null;

  @Column({ type: 'uuid', nullable: true })
  loserDeckId!: string | null;

  @ManyToOne(() => SavedDeck, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'loserDeckId' })
  loserDeck!: SavedDeck | null;

  @Column({ type: 'varchar' })
  winnerLeaderCardId!: string;

  @Column({ type: 'varchar' })
  loserLeaderCardId!: string;

  @Column({ type: 'boolean' })
  winnerWentFirst!: boolean;

  @Column({ type: 'varchar' })
  endReason!: 'life' | 'deckOut';

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz' })
  endedAt!: Date;

  @Column({ type: 'int' })
  durationSeconds!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
