import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Card } from '@onepiecetcg/shared';
import { PlayerAccountService } from '../player-account/player-account.service';
import { CatalogService } from '../catalog/catalog.service';
import { MatchResult } from './match-result.entity';
import { StatsService } from './stats.service';

const leaderA: Card = {
  id: 'L-001',
  number: 'L-001',
  name: 'Leader A',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 4,
  counter: null,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: 'leader-a.png',
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

const leaderB: Card = {
  ...leaderA,
  id: 'L-002',
  number: 'L-002',
  name: 'Leader B',
  imageUrl: 'leader-b.png',
};

function match(overrides: Partial<MatchResult>): MatchResult {
  return {
    id: 'match-id',
    winnerAccountId: 'account-me',
    loserAccountId: 'account-other',
    winnerDeckId: 'deck-1',
    loserDeckId: 'deck-2',
    winnerLeaderCardId: 'L-001',
    loserLeaderCardId: 'L-002',
    winnerWentFirst: true,
    endReason: 'life',
    startedAt: new Date('2026-01-01T00:00:00Z'),
    endedAt: new Date('2026-01-01T00:10:00Z'),
    durationSeconds: 600,
    createdAt: new Date('2026-01-01T00:10:00Z'),
    winnerAccount: undefined as never,
    loserAccount: undefined as never,
    winnerDeck: { name: 'My Deck' } as never,
    loserDeck: { name: 'Their Deck' } as never,
    ...overrides,
  };
}

describe('StatsService', () => {
  let service: StatsService;
  let matchResultsFind: jest.Mock;
  let recordedSave: jest.Mock;

  async function setup(matches: MatchResult[]) {
    matchResultsFind = jest.fn().mockResolvedValue(matches);
    recordedSave = jest.fn((entity: Partial<MatchResult>) => entity);

    const moduleRef = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(MatchResult),
          useValue: {
            find: matchResultsFind,
            create: (entity: Partial<MatchResult>) => entity,
            save: recordedSave,
          },
        },
        {
          provide: PlayerAccountService,
          useValue: {
            findOrCreateForAuthUser: jest.fn((user: { id: string }) =>
              Promise.resolve({ id: `account-${user.id}` }),
            ),
          },
        },
        {
          provide: CatalogService,
          useValue: {
            searchCards: jest.fn().mockResolvedValue({
              cards: [leaderA, leaderB],
              total: 2,
              filters: { sets: [], types: [], colors: [], costs: [] },
              cachedAt: new Date().toISOString(),
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(StatsService);
  }

  describe('getStatsForUser', () => {
    it('returns zeroed stats when the account has no recorded matches', async () => {
      await setup([]);

      const stats = await service.getStatsForUser({ id: 'me' });

      expect(stats).toMatchObject({
        played: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        currentStreak: null,
        averageDurationSeconds: null,
        byDeck: [],
        byLeader: [],
      });
    });

    it('aggregates wins, losses, win rate, and current streak across matches for the account', async () => {
      await setup([
        match({
          winnerAccountId: 'account-me',
          loserAccountId: 'account-other',
          endedAt: new Date('2026-01-01T00:10:00Z'),
        }),
        match({
          winnerAccountId: 'account-other',
          loserAccountId: 'account-me',
          endedAt: new Date('2026-01-02T00:10:00Z'),
        }),
        match({
          winnerAccountId: 'account-other',
          loserAccountId: 'account-me',
          endedAt: new Date('2026-01-03T00:10:00Z'),
        }),
      ]);

      const stats = await service.getStatsForUser({ id: 'me' });

      expect(stats.played).toBe(3);
      expect(stats.wins).toBe(1);
      expect(stats.losses).toBe(2);
      expect(stats.winRate).toBeCloseTo(1 / 3);
      // chronological (endedAt asc): win, loss, loss -> current streak is 2 losses
      expect(stats.currentStreak).toEqual({ type: 'loss', length: 2 });
    });

    it('computes per-deck and per-leader breakdowns using the account perspective, resolving leader name/image from the catalogue', async () => {
      await setup([
        match({
          winnerAccountId: 'account-me',
          loserAccountId: 'account-other',
          winnerDeckId: 'deck-1',
          winnerLeaderCardId: 'L-001',
        }),
        match({
          winnerAccountId: 'account-other',
          loserAccountId: 'account-me',
          loserDeckId: 'deck-1',
          loserLeaderCardId: 'L-001',
        }),
      ]);

      const stats = await service.getStatsForUser({ id: 'me' });

      expect(stats.byDeck).toEqual([
        expect.objectContaining({
          deckId: 'deck-1',
          played: 2,
          wins: 1,
          losses: 1,
        }),
      ]);
      expect(stats.byLeader).toEqual([
        expect.objectContaining({
          leaderCardId: 'L-001',
          leaderName: 'Leader A',
          leaderImageUrl: 'leader-a.png',
          played: 2,
          wins: 1,
          losses: 1,
        }),
      ]);
    });

    it('splits results by whether the account went first or second', async () => {
      await setup([
        match({
          winnerAccountId: 'account-me',
          loserAccountId: 'account-other',
          winnerWentFirst: true,
        }),
        match({
          winnerAccountId: 'account-other',
          loserAccountId: 'account-me',
          winnerWentFirst: true,
        }),
      ]);

      const stats = await service.getStatsForUser({ id: 'me' });

      // match 1: account-me won and went first -> wentFirst +1 win
      expect(stats.wentFirst).toMatchObject({ played: 1, wins: 1, losses: 0 });
      // match 2: account-other won and went first, meaning account-me
      // (the loser) went second
      expect(stats.wentSecond).toMatchObject({
        played: 1,
        wins: 0,
        losses: 1,
      });
    });

    it('averages duration across all recorded matches for the account', async () => {
      await setup([
        match({ durationSeconds: 300 }),
        match({ durationSeconds: 900 }),
      ]);

      const stats = await service.getStatsForUser({ id: 'me' });

      expect(stats.averageDurationSeconds).toBe(600);
    });
  });

  describe('recordMatchResult', () => {
    it('resolves both accounts and persists a match result with a computed duration', async () => {
      await setup([]);

      await service.recordMatchResult({
        winnerAuthUserId: 'winner-auth',
        loserAuthUserId: 'loser-auth',
        winnerDeckId: 'deck-1',
        loserDeckId: null,
        winnerLeaderCardId: 'L-001',
        loserLeaderCardId: 'L-002',
        winnerWentFirst: true,
        endReason: 'deckOut',
        startedAt: new Date('2026-01-01T00:00:00Z'),
        endedAt: new Date('2026-01-01T00:05:00Z'),
      });

      expect(recordedSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerAccountId: 'account-winner-auth',
          loserAccountId: 'account-loser-auth',
          winnerDeckId: 'deck-1',
          loserDeckId: null,
          endReason: 'deckOut',
          durationSeconds: 300,
        }),
      );
    });
  });
});
