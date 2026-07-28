type SameSite = 'lax' | 'strict' | 'none';

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
}

function readNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isFinite(value) ? value : fallback;
}

function readSameSite(): SameSite {
  const value = process.env.SESSION_COOKIE_SAME_SITE;

  if (value === 'strict' || value === 'none') {
    return value;
  }

  return 'lax';
}

export function getApiConfig() {
  const database = {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: readNumber('DATABASE_PORT', 5432),
    user: process.env.DATABASE_USER ?? 'onepiecetcg',
    password: process.env.DATABASE_PASSWORD ?? 'onepiecetcg',
    name: process.env.DATABASE_NAME ?? 'onepiecetcg',
  };

  return {
    port: readNumber('API_PORT', 3000),
    webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3001',
    // Fail-closed: only an explicit 'development' enables anonymous dev auth,
    // so a missing/misconfigured NODE_ENV in a future prod deployment never
    // accidentally enables the local-testing shortcut.
    isDevelopment: process.env.NODE_ENV === 'development',
    database,
    databaseUrl:
      process.env.DATABASE_URL ??
      `postgres://${database.user}:${database.password}@${database.host}:${database.port}/${database.name}`,
    auth: {
      secret: process.env.BETTER_AUTH_SECRET ?? 'development-spike-secret',
      baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
      cookieDomain: process.env.SESSION_COOKIE_DOMAIN || undefined,
      cookieSecure: readBoolean('SESSION_COOKIE_SECURE', false),
      cookieSameSite: readSameSite(),
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      },
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID ?? '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
      },
    },
  };
}
