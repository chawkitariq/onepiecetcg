import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('auth-config', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('reports email/password enabled and fixture accounts only when NODE_ENV is exactly "development"', () => {
      process.env.NODE_ENV = 'development';
      const result = appController.getAuthConfig();
      expect(result.emailPasswordEnabled).toBe(true);
      expect(result.devFixtureAccounts.length).toBeGreaterThan(0);
    });

    it('reports email/password disabled and no fixture accounts for production', () => {
      process.env.NODE_ENV = 'production';
      expect(appController.getAuthConfig()).toEqual({
        emailPasswordEnabled: false,
        devFixtureAccounts: [],
      });
    });

    it('reports email/password disabled and no fixture accounts when NODE_ENV is unset (fail-closed)', () => {
      delete process.env.NODE_ENV;
      expect(appController.getAuthConfig()).toEqual({
        emailPasswordEnabled: false,
        devFixtureAccounts: [],
      });
    });
  });
});
