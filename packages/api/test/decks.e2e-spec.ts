import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import type { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { SavedDeck } from '../src/decks/saved-deck.entity';
import { createAuthenticatedTestUser } from './auth-fixture';

type CreateDeckErrorBody = { message: string; validation: { valid: boolean } };
type DeckListBody = { decks: Array<{ id: string }> };
type MeResponseBody = { profile: { id: string } };
type DeckBody = { id: string };
type DeckImportResponseBody = {
  invalidLines: Array<{ line: number; raw: string }>;
};

describe('/decks (e2e)', () => {
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

  it('rejects every route without a session cookie', async () => {
    await request(app.getHttpServer()).get('/decks').expect(401);
    await request(app.getHttpServer())
      .get('/decks/00000000-0000-0000-0000-000000000000')
      .expect(401);
    await request(app.getHttpServer())
      .post('/decks')
      .send({ name: 'Deck', leaderCardId: 'L-001', cards: [] })
      .expect(401);
    await request(app.getHttpServer())
      .put('/decks/00000000-0000-0000-0000-000000000000')
      .send({ name: 'Deck', leaderCardId: 'L-001', cards: [] })
      .expect(401);
    await request(app.getHttpServer())
      .delete('/decks/00000000-0000-0000-0000-000000000000')
      .expect(401);
  });

  it('rejects an invalid deck payload with the validation errors, without persisting it', async () => {
    const testUser = await createAuthenticatedTestUser(moduleFixture);

    const response = await request(app.getHttpServer())
      .post('/decks')
      .set('Cookie', testUser.cookie)
      .send({ name: 'Empty deck', leaderCardId: '', cards: [] })
      .expect(400);

    const errorBody = response.body as CreateDeckErrorBody;

    expect(errorBody.message).toBe('Deck invalide');
    expect(errorBody.validation.valid).toBe(false);

    const list = await request(app.getHttpServer())
      .get('/decks')
      .set('Cookie', testUser.cookie)
      .expect(200);

    expect((list.body as DeckListBody).decks).toEqual([]);
  });

  it('returns 404 for a deck id that does not exist', async () => {
    const testUser = await createAuthenticatedTestUser(moduleFixture);

    return request(app.getHttpServer())
      .get('/decks/00000000-0000-0000-0000-000000000000')
      .set('Cookie', testUser.cookie)
      .expect(404);
  });

  it("does not expose one account's deck to another account", async () => {
    const owner = await createAuthenticatedTestUser(moduleFixture, {
      email: 'owner@example.test',
    });
    const stranger = await createAuthenticatedTestUser(moduleFixture, {
      email: 'stranger@example.test',
    });

    // GET /me lazily creates the PlayerAccount row so a real deck can be
    // seeded directly against it (bypassing catalogService, which would
    // otherwise require the live external card catalog to succeed).
    const ownerProfile = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', owner.cookie)
      .expect(200);

    const savedDecks = moduleFixture.get<Repository<SavedDeck>>(
      getRepositoryToken(SavedDeck),
    );
    const seededDeck = await savedDecks.save(
      savedDecks.create({
        ownerId: (ownerProfile.body as MeResponseBody).profile.id,
        name: "Owner's deck",
        leaderCardId: 'L-001',
        cards: [{ cardId: 'C-001', quantity: 4 }],
      }),
    );

    await request(app.getHttpServer())
      .get(`/decks/${seededDeck.id}`)
      .set('Cookie', stranger.cookie)
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/decks/${seededDeck.id}`)
      .set('Cookie', stranger.cookie)
      .expect(403);

    const strangerList = await request(app.getHttpServer())
      .get('/decks')
      .set('Cookie', stranger.cookie)
      .expect(200);

    expect((strangerList.body as DeckListBody).decks).toEqual([]);

    const ownerGet = await request(app.getHttpServer())
      .get(`/decks/${seededDeck.id}`)
      .set('Cookie', owner.cookie)
      .expect(200);

    expect((ownerGet.body as DeckBody).id).toBe(seededDeck.id);
  });

  it('POST /decks/import surfaces invalid lines instead of dropping them silently', async () => {
    const testUser = await createAuthenticatedTestUser(moduleFixture);

    const response = await request(app.getHttpServer())
      .post('/decks/import')
      .set('Cookie', testUser.cookie)
      .send({ text: '1xL-001\n4xC-001\nnot a line\n4x', name: 'Import' })
      .expect(201);

    expect((response.body as DeckImportResponseBody).invalidLines).toEqual([
      { line: 3, raw: 'not a line' },
      { line: 4, raw: '4x' },
    ]);
  });

  it('POST /decks/validate does not require authentication', () => {
    return request(app.getHttpServer())
      .post('/decks/validate')
      .send({ name: 'Deck', leaderCardId: '', cards: [] })
      .expect(201);
  });
});
