import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const allowedOrigins = [
    process.env.WEB_APP_URL,
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests and same-origin calls.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Allow common LAN development hosts (e.g. http://192.168.x.x:3001).
      const isLanDevOrigin = /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}:3001$/.test(
        origin,
      );
      callback(isLanDevOrigin ? null : new Error('Not allowed by CORS'), isLanDevOrigin);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('MeetWise API')
    .setDescription('The API documentation for the MeetWise application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
