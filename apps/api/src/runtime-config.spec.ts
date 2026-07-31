import { getApiConfig } from './runtime-config';

describe('getApiConfig', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
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
});
