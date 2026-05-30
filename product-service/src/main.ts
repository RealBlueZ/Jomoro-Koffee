import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Aktifkan validasi DTO secara global
  app.useGlobalPipes(new ValidationPipe());

  // 2. Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Jomoro Product Service')
    .setDescription('API Documentation for Jomoro Koffee Product Management')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 3. AMBIL PORT DARI .ENV ATAU FALLBACK KE 3002
  const port = process.env.PORT || 3002;
  
  await app.listen(port);
  console.log(`Product Service is running on: http://localhost:${port}`);
  console.log(`Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();