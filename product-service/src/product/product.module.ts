import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AdminProductController } from './admin-product.controller';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'JomoroKoffeeProductService',
    })
  ],
  controllers: [ProductController, AdminProductController],
  providers: [ProductService],
  exports: [ProductService], // Diekspor agar bisa di-reuse jika dibutuhkan modul lain
})

export class ProductModule {}
