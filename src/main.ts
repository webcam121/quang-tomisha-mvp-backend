import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['debug', 'error', 'verbose', 'warn'],
  });

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Disable 304 cache
  app.set('etag', false);

  // Serve all routes on /api/*
  // app.setGlobalPrefix('api');

  // Global validation pipe https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: configService.get('isProd'),
    whitelist: true,
    transform: true,
  }));

  // Enchance header response security
  app.use(helmet());

  // For reverse proxy
  app.set('trust proxy', 1);

  if (!configService.get('isProd')) {
    // API Documentation https://docs.nestjs.com/recipes/swagger#openapi-swagger
    const options = new DocumentBuilder()
      .setTitle('TOMISHA')
      .setDescription('API description')
      .setVersion('0.1')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('doc', app, document);
  }

  // Start app
  const port = configService.get('port');
  await app.listen(port);

  Logger.log(`[${process.env.NODE_ENV || 'development'}] Listening on ${port}`, 'BOOSTRAP');
}
bootstrap();
