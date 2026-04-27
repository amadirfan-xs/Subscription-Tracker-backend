import { config } from 'dotenv';

function getEnvFile(): string {
  const env = process.env.NODE_ENV || '';
  let envFile = '.env';
  if (env !== '') {
    envFile = `.env.${env.trim()}`;
  }
  return envFile;
}

config({ path: getEnvFile() });

import bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors({ origin: true, credentials: true });

  const apiDoc = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, apiDoc);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(Number(process.env.PORT ?? 3000));
}
void bootstrap();
