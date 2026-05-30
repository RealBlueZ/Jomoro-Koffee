import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class TransactionService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/jomoro-transaction';
    const adapter = new PrismaMariaDb(dbUrl);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // --- LOGIKA UTAMA KERANJANG BELANJA (CART) ---

  // Menambah atau memperbarui item di dalam keranjang
  async addToCart(addToCartDto: AddToCartDto) {
    const { user_id, product_id, quantity } = addToCartDto;

    // 1. Cari atau buat Cart aktif untuk user tersebut (Upsert pattern)
    const cart = await this.prisma.cart.upsert({
      where: { user_id },
      update: {},
      create: { user_id },
    });

    // 2. Periksa apakah produk kopi tersebut sudah ada di dalam keranjang ini
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id,
      },
    });

    if (existingItem) {
      // Jika sudah ada, tambahkan jumlah quantity-nya
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    // Jika belum ada, buat baris item baru di tabel cart_items
    return this.prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id,
        quantity,
      },
    });
  }

  // Melihat isi keranjang milik user tertentu
  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        cart_items: true, // Angkut semua item kopi di dalamnya
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart for User ID ${userId} is empty or not found`);
    }
    return cart;
  }

  // Menghapus satu item dari keranjang belanja
  async removeCartItem(itemId: number) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: `Item has been removed from cart.` };
  }

  // Checkout item dari keranjang
  async checkout(checkoutDto: CheckoutDto) {
    const { user_id } = checkoutDto;

    // 1. Ambil data keranjang aktif beserta itemnya
    const cart = await this.prisma.cart.findUnique({
      where: { user_id },
      include: { cart_items: true },
    });

    // Validasi jika keranjang tidak ditemukan atau kosong
    if (!cart || cart.cart_items.length === 0) {
      throw new BadRequestException(`Cannot checkout. Cart is empty or does not exist for User ID ${user_id}`);
    }

    // 2. Jalankan ACID Transaction untuk menjamin konsistensi data
    return this.prisma.$transaction(async (tx) => {
      
      // A. Buat data induk Order baru
      const newOrder = await tx.order.create({
        data: {
          user_id: user_id,
        },
      });

      // B. Pindahkan setiap CartItem ke OrderDetail dengan snapshot harga
      // (Di sini kita asumsikan harga dummy Rp 25000 untuk simulasi, idealnya fetch dari product-service)
      const mockPrice = 25000; 

      const orderDetailsData = cart.cart_items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: mockPrice, // Tipe data Float sesuai schema.prisma Anda
      }));

      // Masukkan massal (bulk insert) ke tabel order_details
      await tx.orderDetail.createMany({
        data: orderDetailsData,
      });

      // C. Kosongkan semua item di keranjang belanja user
      await tx.cartItem.deleteMany({
        where: { cart_id: cart.id },
      });

      // D. Kembalikan data Order utuh beserta detailnya untuk struk/nota
      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: { order_details: true },
      });
    });
  }

  // Tambahan opsi: Mengambil semua riwayat pesanan (Order) milik user
  async getOrderHistory(userId: number) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      include: { order_details: true },
      orderBy: { created_at: 'desc' },
    });
  }
}