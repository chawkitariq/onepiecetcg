export type DevFixtureAccount = {
  name: string;
  email: string;
  password: string;
};

/**
 * Fixed email/password accounts seeded on startup in development only (see runtime-config.ts
 * `isDevelopment`), so contributors can sign in instantly without an OAuth provider.
 * Never created or usable in production — email/password sign-in itself is disabled there.
 */
export const DEV_FIXTURE_ACCOUNTS: DevFixtureAccount[] = [
  { name: 'Test 1', email: 'test1@local.dev', password: 'password123' },
  { name: 'Test 2', email: 'test2@local.dev', password: 'password123' },
  { name: 'Test 3', email: 'test3@local.dev', password: 'password123' },
];
