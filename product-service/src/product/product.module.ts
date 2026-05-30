import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Diekspor agar bisa di-reuse jika dibutuhkan modul lain
})
export class ProductModule {}