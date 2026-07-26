import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import type { Repository } from 'typeorm';
import type { PlayerStats } from '@onepiecetcg/shared';
import { AppModule } from '../src/app.module';
import { PlayerAccount } from '../src/accounts/player-account.entity';
import { SavedDeck } from '../src/decks/saved-deck.entity';
import { MatchResult } from '../src/stats/match-result.entity';
import { createAuthenticatedTestUser } from './auth-fixture';

type MeResponseBody = { profile: { id: string } };

describe('/stats (e2e)', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects the route without a session cookie', () => {
    return request(app.getHttpServer()).get('/stats/me').expect(401);
  });

  it('returns zeroed stats for an account with no recorded matches', async () => {
    const testUser = await createAuthenticatedTestUser(moduleFixture);

    const response = await request(app.getHttpServer())
      .get('/stats/me')
      .set('Cookie', testUser.cookie)
      .expect(200);

    const stats = response.body as PlayerStats;

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

  it('keeps a match result queryable, with the deck name resolved to null, after the winning deck is deleted', async () => {
    const winner = await createAuthenticatedTestUser(moduleFixture, {
      email: 'winner@example.test',
    });
    const loser = await createAuthenticatedTestUser(moduleFixture, {
      email: 'loser@example.test',
    });

    // GET /me lazily creates each PlayerAccount row.
    const winnerProfile = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', winner.cookie)
      .expect(200);
    const loserProfile = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', loser.cookie)
      .expect(200);

    const winnerAccountId = (winnerProfile.body as MeResponseBody).profile.id;
    const loserAccountId = (loserProfile.body as MeResponseBody).profile.id;

    const savedDecks = moduleFixture.get<Repository<SavedDeck>>(
      getRepositoryToken(SavedDeck),
    );
    const winnerDeck = await savedDecks.save(
      savedDecks.create({
        ownerId: winnerAccountId,
        name: "Winner's deck",
        leaderCardId: 'L-001',
        cards: [{ cardId: 'C-001', quantity: 4 }],
      }),
    );

    const matchResults = moduleFixture.get<Repository<MatchResult>>(
      getRepositoryToken(MatchResult),
    );
    await matchResults.save(
      matchResults.create({
        winnerAccountId,
        loserAccountId,
        winnerDeckId: winnerDeck.id,
        loserDeckId: null,
        winnerLeaderCardId: 'L-001',
        loserLeaderCardId: 'L-002',
        winnerWentFirst: true,
        endReason: 'life',
        startedAt: new Date('2026-01-01T00:00:00Z'),
        endedAt: new Date('2026-01-01T00:10:00Z'),
        durationSeconds: 600,
      }),
    );

    // Deleting the deck must not cascade-delete the match result (SET NULL
    // on the FK, docs/plan.md Etape 13 -- "la suppression d'un deck utilisé
    // dans une partie passée ne supprime pas le résultat historique").
    await savedDecks.remove(winnerDeck);

    const statsResponse = await request(app.getHttpServer())
      .get('/stats/me')
      .set('Cookie', winner.cookie)
      .expect(200);

    const stats = statsResponse.body as PlayerStats;

    expect(stats.played).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.byDeck).toEqual([
      expect.objectContaining({
        deckId: winnerDeck.id,
        deckName: null,
        played: 1,
        wins: 1,
      }),
    ]);
    expect(stats.byLeader).toEqual([
      expect.objectContaining({ leaderCardId: 'L-001', played: 1, wins: 1 }),
    ]);

    const persisted = await matchResults.findOne({
      where: { winnerAccountId, loserAccountId },
    });
    expect(persisted).not.toBeNull();
    expect(persisted?.winnerDeckId).toBeNull();
  });

  it("deleting an account's player account row cascade-deletes their match results", async () => {
    const winner = await createAuthenticatedTestUser(moduleFixture, {
      email: 'cascade-winner@example.test',
    });
    const loser = await createAuthenticatedTestUser(moduleFixture, {
      email: 'cascade-loser@example.test',
    });

    const winnerProfile = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', winner.cookie)
      .expect(200);
    const loserProfile = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', loser.cookie)
      .expect(200);

    const winnerAccountId = (winnerProfile.body as MeResponseBody).profile.id;
    const loserAccountId = (loserProfile.body as MeResponseBody).profile.id;

    const matchResults = moduleFixture.get<Repository<MatchResult>>(
      getRepositoryToken(MatchResult),
    );
    const match = await matchResults.save(
      matchResults.create({
        winnerAccountId,
        loserAccountId,
        winnerDeckId: null,
        loserDeckId: null,
        winnerLeaderCardId: 'L-001',
        loserLeaderCardId: 'L-002',
        winnerWentFirst: true,
        endReason: 'deckOut',
        startedAt: new Date('2026-01-01T00:00:00Z'),
        endedAt: new Date('2026-01-01T00:05:00Z'),
        durationSeconds: 300,
      }),
    );

    const playerAccounts = moduleFixture.get<Repository<PlayerAccount>>(
      getRepositoryToken(PlayerAccount),
    );
    await playerAccounts.delete({ id: winnerAccountId });

    const persisted = await matchResults.findOne({
      where: { id: match.id },
    });
    expect(persisted).toBeNull();
  });
});
