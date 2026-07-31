import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayerAccountModule } from './player-account/player-account.module';
import { createAuth } from './auth';
import { BetterAuthAccount } from './better-auth/better-auth-account.entity';
import { BetterAuthSession } from './better-auth/better-auth-session.entity';
import { BetterAuthUser } from './better-auth/better-auth-user.entity';
import { BetterAuthVerification } from './better-auth/better-auth-verification.entity';
import { CatalogModule } from './catalog/catalog.module';
import { ColyseusService } from './colyseus/colyseus.service';
import { DeckModule } from './deck/deck.module';
import { DuelEventsModule } from './duel-events/duel-events.module';
import { LobbyController } from './lobby/lobby.controller';
import { getApiConfig } from './runtime-config';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/api/.env', '.env'],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule.forRoot({
      auth: createAuth(),
      disableGlobalAuthGuard: true,
      bodyParser: {
        json: { limit: '2mb' },
        urlencoded: { extended: true, limit: '2mb' },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: getApiConfig().database.host,
      port: getApiConfig().database.port,
      username: getApiConfig().database.user,
      password: getApiConfig().database.password,
      database: getApiConfig().database.name,
      entities: [
        BetterAuthAccount,
        BetterAuthSession,
        BetterAuthUser,
        BetterAuthVerification,
      ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    PlayerAccountModule,
    CatalogModule,
    DeckModule,
    StatsModule,
    DuelEventsModule,
  ],
  controllers: [AppController, LobbyController],
  providers: [AppService, ColyseusService],
})
export class AppModule {}
