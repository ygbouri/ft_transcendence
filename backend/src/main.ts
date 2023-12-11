import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { CustomSocketIOAdapter } from './socket-io-adapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function startApplication() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
    origin: `http://${configService.get('FRONTEND_IP')}`,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ft_transcendence')
    .setDescription('ft_transcendence API routes')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  // app.useStaticAssets(join(__dirname, '../'));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useWebSocketAdapter(new CustomSocketIOAdapter(app, configService));
  await app.listen(+`${configService.get('BACKEND_PORT')}`);
}

startApplication();
