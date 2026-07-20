import { betterAuth } from 'better-auth';
import { getApiConfig } from './runtime-config';

const config = getApiConfig();

export const auth = betterAuth({
  secret: config.auth.secret,
  baseURL: config.auth.baseURL,
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

