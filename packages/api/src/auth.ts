import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { getApiConfig } from './runtime-config';

type OAuthProfile = Record<string, unknown>;

function firstNonEmptyString(
  ...values: Array<string | null | undefined>
): string | undefined {
  return values.find((value) => typeof value === 'string' && value.trim());
}

function readProfileString(
  profile: OAuthProfile,
  key: string,
): string | undefined {
  const value = profile[key];

  return typeof value === 'string' && value.trim() ? value : undefined;
}

function mapGoogleProfileToUser(profile: OAuthProfile) {
  const name = firstNonEmptyString(
    readProfileString(profile, 'name'),
    [readProfileString(profile, 'given_name'), readProfileString(profile, 'family_name')]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .trim(),
  );
  const email = readProfileString(profile, 'email');
  const image = firstNonEmptyString(
    readProfileString(profile, 'picture'),
    readProfileString(profile, 'image'),
  );

  return {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(image ? { image } : {}),
  };
}

function mapDiscordProfileToUser(profile: OAuthProfile) {
  const id = readProfileString(profile, 'id');
  const avatarHash = readProfileString(profile, 'avatar');
  const image = firstNonEmptyString(
    readProfileString(profile, 'image'),
    avatarHash && id
      ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.png`
      : undefined,
  );

  return {
    ...(firstNonEmptyString(
      readProfileString(profile, 'global_name'),
      readProfileString(profile, 'username'),
      readProfileString(profile, 'name'),
    )
      ? {
          name: firstNonEmptyString(
            readProfileString(profile, 'global_name'),
            readProfileString(profile, 'username'),
            readProfileString(profile, 'name'),
          ),
        }
      : {}),
    ...(readProfileString(profile, 'email')
      ? { email: readProfileString(profile, 'email') }
      : {}),
    ...(image ? { image } : {}),
  };
}

/** Creates the Better Auth instance used by the NestJS API. */
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
    // Dev-only shortcut so contributors can test the app without an OAuth provider.
    // Gated on NODE_ENV==='development' (fail-closed, see runtime-config.ts) — never available in production.
    emailAndPassword: {
      enabled: config.isDevelopment,
    },
    socialProviders: {
      google: {
        clientId: config.auth.google.clientId,
        clientSecret: config.auth.google.clientSecret,
        overrideUserInfoOnSignIn: true,
        mapProfileToUser: mapGoogleProfileToUser,
      },
      discord: {
        clientId: config.auth.discord.clientId,
        clientSecret: config.auth.discord.clientSecret,
        overrideUserInfoOnSignIn: true,
        mapProfileToUser: mapDiscordProfileToUser,
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
