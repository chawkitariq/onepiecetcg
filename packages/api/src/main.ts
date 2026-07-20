import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ColyseusService } from './realtime/colyseus.service';
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

  await app.init();
  app.get(ColyseusService).attach(app.getHttpServer());
  await app.listen(config.port);
}
bootstrap();
