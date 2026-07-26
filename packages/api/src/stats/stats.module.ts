import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { CatalogModule } from '../catalog/catalog.module';
import { MatchResult } from './match-result.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchResult]),
    AccountsModule,
    CatalogModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
