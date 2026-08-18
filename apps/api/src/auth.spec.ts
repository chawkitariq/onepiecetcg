import { betterAuth } from 'better-auth';
import { anonymous } from 'better-auth/plugins';
import { Pool } from 'pg';
import { createAuth } from './auth';
import { createRandomDisplayName } from './common/display-name';
import { getApiConfig } from './runtime-config';

jest.mock('better-auth', () => ({
  betterAuth: jest.fn((options: unknown) => options),
}));

jest.mock('better-auth/plugins', () => ({
  anonymous: jest.fn(() => ({ id: 'anonymous' })),
}));

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({ mockedPool: true })),
}));

jest.mock('./common/display-name', () => ({
  createRandomDisplayName: jest.fn(() => 'Q7mR2xK9vB4n'),
}));

jest.mock('./runtime-config', () => ({
  getApiConfig: jest.fn(() => ({
    databaseUrl: 'postgres://test:test@localhost:5432/onepiecetcg',
    webOrigin: 'http://localhost:3001',
    isDevelopment: false,
    anonymousAuthEnabled: false,
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

  it('disables the anonymous plugin when the flag is off', () => {
    const auth = createAuth() as {
      plugins?: unknown[];
    };

    expect(auth.plugins).toEqual([]);
  });

  it('configures Google and Discord to refresh mapped profile images on sign-in', () => {
    const auth = createAuth() as {
      socialProviders: {
        google: {
          overrideUserInfoOnSignIn: boolean;
          mapProfileToUser: (
            profile: Record<string, unknown>,
          ) => Record<string, string>;
        };
        discord: {
          overrideUserInfoOnSignIn: boolean;
          mapProfileToUser: (
            profile: Record<string, unknown>,
          ) => Record<string, string>;
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

  it('enables the anonymous plugin when the flag is on', () => {
    (getApiConfig as jest.Mock).mockReturnValueOnce({
      databaseUrl: 'postgres://test:test@localhost:5432/onepiecetcg',
      webOrigin: 'http://localhost:3001',
      isDevelopment: true,
      anonymousAuthEnabled: true,
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
    });

    const auth = createAuth() as {
      plugins?: Array<{ id?: string }>;
    };
    const anonymousPlugin = anonymous as jest.Mock;

    expect(auth.plugins?.map((plugin) => plugin.id)).toContain('anonymous');
    expect(anonymousPlugin).toHaveBeenCalledWith({
      emailDomainName: 'local.dev',
      generateName: expect.any(Function),
    });
    expect(anonymousPlugin.mock.calls[0]?.[0]?.generateName()).toBe(
      'Q7mR2xK9vB4n',
    );
    expect(createRandomDisplayName).toHaveBeenCalledTimes(1);
  });
});
