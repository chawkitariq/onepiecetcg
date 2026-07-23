import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DEV_FIXTURE_ACCOUNTS } from './dev-fixtures/dev-fixture-accounts';
import { getApiConfig } from './runtime-config';

/**
 * Public, unauthenticated auth capability flags the frontend can use to decide what to render.
 */
export type AuthConfigResponse = {
  emailPasswordEnabled: boolean;
  devFixtureAccounts: { name: string; email: string; password: string }[];
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Exposes whether the dev-only email/password provider is enabled, and the seeded
   * fixture accounts, so the frontend never has to guess the API's environment itself.
   * Both are always empty/false outside development.
   */
  @Get('auth-config')
  getAuthConfig(): AuthConfigResponse {
    const isDevelopment = getApiConfig().isDevelopment;

    return {
      emailPasswordEnabled: isDevelopment,
      devFixtureAccounts: isDevelopment ? DEV_FIXTURE_ACCOUNTS : [],
    };
  }
}
