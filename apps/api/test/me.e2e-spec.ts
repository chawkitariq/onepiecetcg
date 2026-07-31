import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createAuthenticatedTestUser } from './auth-fixture';

type MeResponseBody = {
  authenticated: true;
  user: { id: string; email: string | null };
  profile: { id: string; displayName: string };
};

describe('GET /me (e2e)', () => {
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

  it('returns 401 without a session cookie', () => {
    return request(app.getHttpServer()).get('/me').expect(401);
  });

  it('returns the authenticated profile for a valid session', async () => {
    const testUser = await createAuthenticatedTestUser(moduleFixture, {
      name: 'Alice',
      email: 'alice@example.test',
    });

    const response = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', testUser.cookie)
      .expect(200);

    expect(response.body).toMatchObject({
      authenticated: true,
      user: {
        id: testUser.userId,
        email: testUser.email,
      },
      profile: {
        displayName: 'Alice',
      },
    });
  });

  it('creates the player account lazily on first authenticated request', async () => {
    const testUser = await createAuthenticatedTestUser(moduleFixture);

    const first = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', testUser.cookie)
      .expect(200);
    const second = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', testUser.cookie)
      .expect(200);

    const firstBody = first.body as MeResponseBody;
    const secondBody = second.body as MeResponseBody;

    expect(secondBody.profile.id).toBe(firstBody.profile.id);
  });
});
