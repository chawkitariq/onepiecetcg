import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

type CardSummary = {
  id: string;
  number: string;
  name: string;
  type: string;
  colors: string[];
};

type CardSearchResponseBody = {
  cards: CardSummary[];
  total: number;
  cachedAt: string;
};

type CatalogFiltersBody = {
  sets: unknown[];
  types: unknown[];
  colors: unknown[];
  costs: unknown[];
};

describe('/catalog (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /catalog/cards returns a normalized card list without authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/cards')
      .expect(200);
    const body = response.body as CardSearchResponseBody;

    expect(Array.isArray(body.cards)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.cachedAt).toBe('string');

    if (body.cards.length > 0) {
      const [card] = body.cards;

      expect(typeof card?.id).toBe('string');
      expect(typeof card?.number).toBe('string');
      expect(typeof card?.name).toBe('string');
      expect(typeof card?.type).toBe('string');
      expect(Array.isArray(card?.colors)).toBe(true);
    }
  });

  it('GET /catalog/cards serves a cached response on a second call within the TTL', async () => {
    const first = await request(app.getHttpServer())
      .get('/catalog/cards')
      .expect(200);
    const second = await request(app.getHttpServer())
      .get('/catalog/cards')
      .expect(200);

    expect((second.body as CardSearchResponseBody).cachedAt).toBe(
      (first.body as CardSearchResponseBody).cachedAt,
    );
  });

  it('GET /catalog/cards/:id returns 404 for an id that does not exist', () => {
    return request(app.getHttpServer())
      .get('/catalog/cards/DOES-NOT-EXIST-999')
      .expect(404);
  });

  it('GET /catalog/filters returns the available filter options', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/filters')
      .expect(200);
    const body = response.body as CatalogFiltersBody;

    expect(Array.isArray(body.sets)).toBe(true);
    expect(Array.isArray(body.types)).toBe(true);
    expect(Array.isArray(body.colors)).toBe(true);
    expect(Array.isArray(body.costs)).toBe(true);
  });
});
