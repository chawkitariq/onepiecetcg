import type { DuelEndReason } from '@onepiecetcg/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerAccount } from '../player-account/player-account.entity';
import { SavedDeck } from '../decks/saved-deck.entity';

/**
 * One row per duel that ended via a clean structural game-end: life-to-zero,
 * deck-out, or a player explicitly forfeiting (leaving the room mid-match,
 * e.g. via "Retourner au lobby"). A forfeit from a disconnection that
 * outlasts the reconnection window (docs/spec.md §3) is never recorded here
 * (§8) -- only an explicit consented leave counts as a forfeit loss.
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

  @Column({ type: 'uuid', nullable: true })
  winnerAccountId!: string | null;

  @ManyToOne(() => PlayerAccount, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'winnerAccountId' })
  winnerAccount!: PlayerAccount | null;

  @Column({ type: 'uuid', nullable: true })
  loserAccountId!: string | null;

  @ManyToOne(() => PlayerAccount, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'loserAccountId' })
  loserAccount!: PlayerAccount | null;

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
  endReason!: DuelEndReason;

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz' })
  endedAt!: Date;

  @Column({ type: 'int' })
  durationSeconds!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
