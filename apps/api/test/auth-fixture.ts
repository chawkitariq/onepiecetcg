import { randomUUID } from 'node:crypto';
import { makeSignature } from 'better-auth/crypto';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { BetterAuthSession } from '../src/better-auth/better-auth-session.entity';
import { BetterAuthUser } from '../src/better-auth/better-auth-user.entity';
import { getApiConfig } from '../src/runtime-config';

export type AuthenticatedTestUser = {
  userId: string;
  email: string;
  cookie: string;
};

/**
 * Creates a real Better Auth user + session row (via TypeORM, same tables
 * the running app reads through Better Auth) and signs the session token the
 * same way Better Auth's own cookie handler does, so `AuthGuard` accepts it
 * exactly as it would a browser-issued cookie -- see
 * better-auth's dist/plugins/test-utils/cookie-builder.mjs (not itself a
 * public export) for the reference implementation this mirrors using the
 * publicly exported `better-auth/crypto#makeSignature`.
 *
 * Email/password sign-in is intentionally disabled for this product (OAuth
 * only, see apps/api/CLAUDE.md), so Better Auth's own test-instance
 * helpers (which sign in via email+password) cannot be used here.
 */
export async function createAuthenticatedTestUser(
  moduleFixture: TestingModule,
  overrides: Partial<{ email: string; name: string }> = {},
): Promise<AuthenticatedTestUser> {
  const users = moduleFixture.get<Repository<BetterAuthUser>>(
    getRepositoryToken(BetterAuthUser),
  );
  const sessions = moduleFixture.get<Repository<BetterAuthSession>>(
    getRepositoryToken(BetterAuthSession),
  );

  const userId = randomUUID();
  const email = overrides.email ?? `${userId}@example.test`;

  await users.save(
    users.create({
      id: userId,
      name: overrides.name ?? 'Test User',
      email,
      emailVerified: true,
      image: null,
    }),
  );

  const token = randomUUID();

  await sessions.save(
    sessions.create({
      id: randomUUID(),
      token,
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      ipAddress: null,
      userAgent: null,
    }),
  );

  const config = getApiConfig();
  const signature = await makeSignature(token, config.auth.secret);
  const signedToken = `${token}.${signature}`;

  return {
    userId,
    email,
    cookie: `better-auth.session_token=${encodeURIComponent(signedToken)}`,
  };
}
