import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { getApiConfig } from './runtime-config';

export function createAuth() {
  const config = getApiConfig();

  return betterAuth({
    secret: config.auth.secret,
    baseURL: config.auth.baseURL,
    // The pg package is already a project dependency and is accepted directly by Better Auth.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    database: new Pool({
      connectionString: config.databaseUrl,
    }),
    trustedOrigins: [config.webOrigin],
    socialProviders: {
      google: {
        clientId: config.auth.google.clientId,
        clientSecret: config.auth.google.clientSecret,
      },
      discord: {
        clientId: config.auth.discord.clientId,
        clientSecret: config.auth.discord.clientSecret,
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: Boolean(config.auth.cookieDomain),
        domain: config.auth.cookieDomain,
      },
      defaultCookieAttributes: {
        sameSite: config.auth.cookieSameSite,
        secure: config.auth.cookieSecure,
      },
    },
  });
}
