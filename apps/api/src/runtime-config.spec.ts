import { getApiConfig } from './runtime-config';

describe('getApiConfig', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAnonymousAuthEnabled = process.env.AUTH_ANONYMOUS_ENABLED;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalAnonymousAuthEnabled === undefined) {
      delete process.env.AUTH_ANONYMOUS_ENABLED;
    } else {
      process.env.AUTH_ANONYMOUS_ENABLED = originalAnonymousAuthEnabled;
    }
  });

  describe('isDevelopment', () => {
    it('is true only when NODE_ENV is exactly "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(getApiConfig().isDevelopment).toBe(true);
    });

    it('is false for production', () => {
      process.env.NODE_ENV = 'production';
      expect(getApiConfig().isDevelopment).toBe(false);
    });

    it('is false when NODE_ENV is unset (fail-closed)', () => {
      delete process.env.NODE_ENV;
      expect(getApiConfig().isDevelopment).toBe(false);
    });

    it('is false for any other value, e.g. a typo like "developement"', () => {
      process.env.NODE_ENV = 'developement';
      expect(getApiConfig().isDevelopment).toBe(false);
    });
  });

  describe('anonymousAuthEnabled', () => {
    it('defaults to true in development when the dedicated flag is unset', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.AUTH_ANONYMOUS_ENABLED;

      expect(getApiConfig().anonymousAuthEnabled).toBe(true);
    });

    it('defaults to false outside development when the dedicated flag is unset', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.AUTH_ANONYMOUS_ENABLED;

      expect(getApiConfig().anonymousAuthEnabled).toBe(false);
    });

    it('allows explicitly enabling anonymous auth outside development', () => {
      process.env.NODE_ENV = 'production';
      process.env.AUTH_ANONYMOUS_ENABLED = 'true';

      expect(getApiConfig().anonymousAuthEnabled).toBe(true);
    });

    it('allows explicitly disabling anonymous auth in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.AUTH_ANONYMOUS_ENABLED = 'false';

      expect(getApiConfig().anonymousAuthEnabled).toBe(false);
    });
  });
});
