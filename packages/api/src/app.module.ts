import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
import { createAuth } from './auth';
import { BetterAuthAccount } from './auth/better-auth-account.entity';
import { BetterAuthSession } from './auth/better-auth-session.entity';
import { BetterAuthUser } from './auth/better-auth-user.entity';
import { BetterAuthVerification } from './auth/better-auth-verification.entity';
import { CatalogModule } from './catalog/catalog.module';
import { DecksModule } from './decks/decks.module';
import { ColyseusService } from './realtime/colyseus.service';
import { LobbyController } from './realtime/lobby.controller';
import { getApiConfig } from './runtime-config';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['packages/api/.env', '.env'],
      isGlobal: true,
    }),
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
    AccountsModule,
    CatalogModule,
    DecksModule,
    StatsModule,
  ],
  controllers: [AppController, LobbyController],
  providers: [AppService, ColyseusService],
})
export class AppModule {}
