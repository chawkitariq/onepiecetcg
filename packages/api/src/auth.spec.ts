import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { createAuth } from './auth';
import { getApiConfig } from './runtime-config';

jest.mock('better-auth', () => ({
  betterAuth: jest.fn((options: unknown) => options),
}));

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({ mockedPool: true })),
}));

jest.mock('./runtime-config', () => ({
  getApiConfig: jest.fn(() => ({
    databaseUrl: 'postgres://test:test@localhost:5432/onepiecetcg',
    webOrigin: 'http://localhost:3001',
    auth: {
      secret: 'secret',
      baseURL: 'http://localhost:3000',
      cookieDomain: undefined,
      cookieSecure: false,
      cookieSameSite: 'lax',
      google: {
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
      },
      discord: {
        clientId: 'discord-client-id',
        clientSecret: 'discord-client-secret',
      },
    },
  })),
}));

describe('createAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures Google and Discord to refresh mapped profile images on sign-in', () => {
    const auth = createAuth() as {
      socialProviders: {
        google: {
          overrideUserInfoOnSignIn: boolean;
          mapProfileToUser: (profile: Record<string, unknown>) => Record<string, string>;
        };
        discord: {
          overrideUserInfoOnSignIn: boolean;
          mapProfileToUser: (profile: Record<string, unknown>) => Record<string, string>;
        };
      };
    };

    expect(getApiConfig).toHaveBeenCalledTimes(1);
    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgres://test:test@localhost:5432/onepiecetcg',
    });
    expect(betterAuth).toHaveBeenCalledTimes(1);
    expect(auth.socialProviders.google.overrideUserInfoOnSignIn).toBe(true);
    expect(auth.socialProviders.discord.overrideUserInfoOnSignIn).toBe(true);

    expect(
      auth.socialProviders.google.mapProfileToUser({
        name: 'Monkey D. Luffy',
        email: 'luffy@example.test',
        picture: 'https://example.test/luffy.png',
      }),
    ).toEqual({
      name: 'Monkey D. Luffy',
      email: 'luffy@example.test',
      image: 'https://example.test/luffy.png',
    });

    expect(
      auth.socialProviders.google.mapProfileToUser({
        given_name: 'Tony',
        family_name: 'Tony Chopper',
        email: 'chopper@example.test',
      }),
    ).toEqual({
      name: 'Tony Tony Chopper',
      email: 'chopper@example.test',
    });

    expect(
      auth.socialProviders.discord.mapProfileToUser({
        id: '123456',
        avatar: 'avatar-hash',
        global_name: 'Nami',
        username: 'catburglar',
        email: 'nami@example.test',
      }),
    ).toEqual({
      name: 'Nami',
      email: 'nami@example.test',
      image: 'https://cdn.discordapp.com/avatars/123456/avatar-hash.png',
    });
  });
});
