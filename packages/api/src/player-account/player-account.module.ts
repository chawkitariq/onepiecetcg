import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAccountController } from './player-account.controller';
import { PlayerAccountService } from './player-account.service';
import { PlayerAccount } from './player-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerAccount])],
  controllers: [PlayerAccountController],
  providers: [PlayerAccountService],
  exports: [PlayerAccountService],
})
export class PlayerAccountModule {}
