import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { getApiConfig } from './runtime-config';

type GoogleProfileLike = {
  name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  email?: string | null;
  picture?: string | null;
  image?: string | null;
};

type DiscordProfileLike = {
  id?: string | null;
  avatar?: string | null;
  global_name?: string | null;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function firstNonEmptyString(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function normalizeProfileString(value: string | null | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function mapGoogleProfileToUser(profile: GoogleProfileLike) {
  const name = firstNonEmptyString(
    normalizeProfileString(profile.name),
    [
      normalizeProfileString(profile.given_name),
      normalizeProfileString(profile.family_name),
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .trim(),
  );
  const email = normalizeProfileString(profile.email);
  const image = firstNonEmptyString(
    normalizeProfileString(profile.picture),
    normalizeProfileString(profile.image),
  );

  return {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(image ? { image } : {}),
  };
}

function mapDiscordProfileToUser(profile: DiscordProfileLike) {
  const id = normalizeProfileString(profile.id);
  const avatarHash = normalizeProfileString(profile.avatar);
  const image = firstNonEmptyString(
    normalizeProfileString(profile.image),
    avatarHash && id
      ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.png`
      : undefined,
  );

  const name = firstNonEmptyString(
    normalizeProfileString(profile.global_name),
    normalizeProfileString(profile.username),
    normalizeProfileString(profile.name),
  );
  const email = normalizeProfileString(profile.email);

  return {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
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
