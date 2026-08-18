import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnonymousAccountCleanupService } from './anonymous-account-cleanup.service';
import { PlayerAccountController } from './player-account.controller';
import { PlayerAccountService } from './player-account.service';
import { PlayerAccount } from './player-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerAccount])],
  controllers: [PlayerAccountController],
  providers: [PlayerAccountService, AnonymousAccountCleanupService],
  exports: [PlayerAccountService],
})
export class PlayerAccountModule {}
