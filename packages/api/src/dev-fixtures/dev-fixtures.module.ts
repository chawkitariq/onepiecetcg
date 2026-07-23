import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetterAuthUser } from '../auth/better-auth-user.entity';
import { DevFixturesService } from './dev-fixtures.service';

/**
 * Dev-only module: seeds fixed email/password test accounts on startup.
 * Safe to always import — DevFixturesService no-ops outside development.
 */
@Module({
  imports: [TypeOrmModule.forFeature([BetterAuthUser])],
  providers: [DevFixturesService],
})
export class DevFixturesModule {}
