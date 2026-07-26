import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  DeckStats,
  LeaderStats,
  PlayerStats,
  ResultBreakdown,
} from '@onepiecetcg/shared';
import { Repository } from 'typeorm';
import { CatalogService } from '../catalog/catalog.service';
import type { AuthenticatedUser } from '../accounts/accounts.service';
import { AccountsService } from '../accounts/accounts.service';
import { MatchResult } from './match-result.entity';

export type RecordMatchResultInput = {
  winnerAuthUserId: string;
  loserAuthUserId: string;
  winnerDeckId: string | null;
  loserDeckId: string | null;
  winnerLeaderCardId: string;
  loserLeaderCardId: string;
  winnerWentFirst: boolean;
  endReason: 'life' | 'deckOut';
  startedAt: Date;
  endedAt: Date;
};

function emptyBreakdown(): ResultBreakdown {
  return { played: 0, wins: 0, losses: 0, winRate: 0 };
}

function addResult(breakdown: ResultBreakdown, won: boolean) {
  breakdown.played += 1;

  if (won) {
    breakdown.wins += 1;
  } else {
    breakdown.losses += 1;
  }

  breakdown.winRate =
    breakdown.played > 0 ? breakdown.wins / breakdown.played : 0;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(MatchResult)
    private readonly matchResults: Repository<MatchResult>,
    private readonly accountsService: AccountsService,
    private readonly catalogService: CatalogService,
  ) {}

  /** Persists a clean-game-end result (docs/spec.md §8); never called for forfeits. */
  async recordMatchResult(input: RecordMatchResultInput): Promise<void> {
    const [winnerAccount, loserAccount] = await Promise.all([
      this.accountsService.findOrCreateForAuthUser({
        id: input.winnerAuthUserId,
      }),
      this.accountsService.findOrCreateForAuthUser({
        id: input.loserAuthUserId,
      }),
    ]);

    const durationSeconds = Math.max(
      0,
      Math.round((input.endedAt.getTime() - input.startedAt.getTime()) / 1000),
    );

    const result = this.matchResults.create({
      winnerAccountId: winnerAccount.id,
      loserAccountId: loserAccount.id,
      winnerDeckId: input.winnerDeckId,
      loserDeckId: input.loserDeckId,
      winnerLeaderCardId: input.winnerLeaderCardId,
      loserLeaderCardId: input.loserLeaderCardId,
      winnerWentFirst: input.winnerWentFirst,
      endReason: input.endReason,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      durationSeconds,
    });

    await this.matchResults.save(result);
  }

  /** Aggregates the account's recorded matches into `GET /stats/me`'s payload, computed at read time (no denormalized counters). */
  async getStatsForUser(user: AuthenticatedUser): Promise<PlayerStats> {
    const account = await this.accountsService.findOrCreateForAuthUser(user);
    const matches = await this.matchResults.find({
      where: [{ winnerAccountId: account.id }, { loserAccountId: account.id }],
      order: { endedAt: 'ASC' },
      relations: { winnerDeck: true, loserDeck: true },
    });

    const overall = emptyBreakdown();
    const wentFirst = emptyBreakdown();
    const wentSecond = emptyBreakdown();
    const byDeck = new Map<string, DeckStats>();
    const byLeader = new Map<string, LeaderStats>();
    let totalDurationSeconds = 0;
    let streakType: 'win' | 'loss' | null = null;
    let streakLength = 0;

    const catalog = await this.catalogService.searchCards({});
    const cardById = new Map(catalog.cards.map((card) => [card.id, card]));

    for (const match of matches) {
      const won = match.winnerAccountId === account.id;
      const wentFirstThisMatch = won
        ? match.winnerWentFirst
        : !match.winnerWentFirst;
      const deckId = won ? match.winnerDeckId : match.loserDeckId;
      const deckName = won
        ? (match.winnerDeck?.name ?? null)
        : (match.loserDeck?.name ?? null);
      const leaderCardId = won
        ? match.winnerLeaderCardId
        : match.loserLeaderCardId;

      addResult(overall, won);
      addResult(wentFirstThisMatch ? wentFirst : wentSecond, won);
      totalDurationSeconds += match.durationSeconds;

      if (deckId) {
        const deckEntry = byDeck.get(deckId) ?? {
          deckId,
          deckName,
          ...emptyBreakdown(),
        };
        addResult(deckEntry, won);
        byDeck.set(deckId, deckEntry);
      }

      const leaderEntry = byLeader.get(leaderCardId) ?? {
        leaderCardId,
        leaderName: cardById.get(leaderCardId)?.name ?? null,
        leaderImageUrl: cardById.get(leaderCardId)?.imageUrl ?? null,
        ...emptyBreakdown(),
      };
      addResult(leaderEntry, won);
      byLeader.set(leaderCardId, leaderEntry);

      const resultType = won ? 'win' : 'loss';
      streakLength = streakType === resultType ? streakLength + 1 : 1;
      streakType = resultType;
    }

    return {
      ...overall,
      currentStreak:
        streakType && streakLength > 0
          ? { type: streakType, length: streakLength }
          : null,
      averageDurationSeconds:
        matches.length > 0 ? totalDurationSeconds / matches.length : null,
      wentFirst,
      wentSecond,
      byDeck: Array.from(byDeck.values()),
      byLeader: Array.from(byLeader.values()),
    };
  }
}
