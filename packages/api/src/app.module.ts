import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from './auth';
import { ColyseusService } from './realtime/colyseus.service';
import { getApiConfig } from './runtime-config';
import { SpikeModule } from './spike/spike.module';

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
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
      autoLoadEntities: true,
      synchronize: true,
    }),
    SpikeModule,
  ],
  controllers: [AppController],
  providers: [AppService, ColyseusService],
})
export class AppModule {}
