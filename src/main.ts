import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

// Origens liberadas no CORS: qualquer porta de localhost (desenvolvimento)
// e os endereços listados em CORS_ORIGINS, separados por vírgula.
function origensPermitidas() {
  const extras = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean);

  return [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    ...extras,
  ];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: origensPermitidas(),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Saúde Digital - API da UBS')
    .setDescription('Fila, consultas, solicitações de saída e login')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
