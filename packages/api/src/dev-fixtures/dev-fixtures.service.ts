import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Repository } from 'typeorm';
import { BetterAuthUser } from '../auth/better-auth-user.entity';
import { getApiConfig } from '../runtime-config';
import { DEV_FIXTURE_ACCOUNTS } from './dev-fixture-accounts';

/**
 * Seeds fixed email/password test accounts on startup, in development only
 * (see runtime-config.ts `isDevelopment`). Never runs in production.
 */
@Injectable()
export class DevFixturesService implements OnModuleInit {
  private readonly logger = new Logger(DevFixturesService.name);

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(BetterAuthUser)
    private readonly users: Repository<BetterAuthUser>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!getApiConfig().isDevelopment) {
      return;
    }

    for (const account of DEV_FIXTURE_ACCOUNTS) {
      await this.seedAccount(account);
    }
  }

  private async seedAccount(account: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    const existing = await this.users.findOne({
      where: { email: account.email },
    });

    if (existing) {
      return;
    }

    await this.authService.api.signUpEmail({
      body: account,
    });
    this.logger.log(`Seeded dev fixture account: ${account.email}`);
  }
}
