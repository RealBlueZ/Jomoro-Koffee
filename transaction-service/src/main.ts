import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Aktifkan validasi global untuk DTO
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  // 2. Setup Swagger Documentation Khusus Transaksi
  const config = new DocumentBuilder()
    .setTitle('Jomoro Transaction Service')
    .setDescription('API Documentation for Jomoro Koffee Cart & Order Management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 3. AMBIL PORT DARI .ENV ATAU FALLBACK KE 3003
  const port = process.env.PORT || 3003;

  await app.listen(port);
  console.log(`Transaction Service is running on: http://localhost:${port}`);
  console.log(`Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();