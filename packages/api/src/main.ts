import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Server as HttpServer } from 'node:http';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { ColyseusService } from './colyseus/colyseus.service';
import { getApiConfig } from './runtime-config';

async function bootstrap() {
  const config = getApiConfig();
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: config.webOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  const httpServer = app.getHttpServer() as HttpServer;
  app.get(ColyseusService).attach(httpServer);
  await app.listen(config.port);
}
void bootstrap();
