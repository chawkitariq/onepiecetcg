import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createAuthenticatedTestUser } from './auth-fixture';

describe('GET /private/auth-check (e2e)', () => {
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

  it('rejects an unauthenticated request', () => {
    return request(app.getHttpServer()).get('/private/auth-check').expect(401);
  });

  it('rejects a session cookie with an invalid signature', () => {
    return request(app.getHttpServer())
      .get('/private/auth-check')
      .set('Cookie', 'better-auth.session_token=not-a-real-token.badsignature')
      .expect(401);
  });

  it('accepts a valid session cookie', async () => {
    const testUser = await createAuthenticatedTestUser(moduleFixture);

    const response = await request(app.getHttpServer())
      .get('/private/auth-check')
      .set('Cookie', testUser.cookie)
      .expect(200);

    expect(response.body).toEqual({ ok: true });
  });
});
