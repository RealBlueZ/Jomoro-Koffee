import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService implements OnModuleInit, OnModuleDestroy {
  [x: string]: any;
  private prisma: PrismaClient;

  constructor() {
    // URL database khusus untuk Jomoro Product
    const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/jomoro-product';

    // Gunakan adapter MariaDB murni pilihan Anda
    const adapter = new PrismaMariaDb(dbUrl);

    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Menambahkan produk baru
  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  // Mengambil semua daftar produk beserta relasi kategorinya (opsional tapi bagus untuk visual)
  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { id: 'desc' },
    });
  }

  // Mengambil satu detail produk berdasarkan ID
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // Memperbarui data produk
  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Validasi apakah barangnya ada
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async reduceStock(id: number, quantity: number){
    const product = await this.findOne(id);

    if(quantity > product.stock){
      throw new BadRequestException("Stock insufficient. Available stock(s): ${product.stock}");
    }

    return this.prisma.product.update({
      where: {id},
      data: {
        stock: product.stock - quantity,
      }
    });
  }

  // Menghapus produk dari database
  async remove(id: number) {
    await this.findOne(id); // Validasi apakah barangnya ada
    await this.prisma.product.delete({
      where: { id },
    });
    return { message: `Product with ID ${id} has been successfully deleted.` };
  }
}