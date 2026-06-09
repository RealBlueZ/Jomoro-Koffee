import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class TransactionService implements OnModuleInit, OnModuleDestroy {
  [x: string]: any;
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

    const productResponse = await fetch(`http://localhost:3002/products/${product_id}`);
    if (!productResponse.ok) {
      throw new NotFoundException(`Produk dengan ID ${product_id} tidak ditemukan di Product Service.`);
    }
    const productData = await productResponse.json();

    if (quantity > productData.stock) {
      throw new BadRequestException(`Jumlah yang diminta (${quantity}) melebihi stok tersedia (${productData.stock}).`);
    }

    const cart = await this.prisma.cart.upsert({
      where: { user_id },
      update: {},
      create: { user_id },
    });

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    await this.prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id,
        quantity,
      },
    });

    return { message: 'Item berhasil ditambahkan ke dalam keranjang.' };
  }

  async updateCartQuantity(userId: number, productId: number, quantity: number) {

    if (!productId || isNaN(productId)) {
      throw new BadRequestException('ID Produk yang dikirim harus berupa angka murni yang valid.');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      throw new NotFoundException(`Keranjang belanja untuk User ID ${userId} belum dibuat.`);
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id: productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Produk ID ${productId} tidak ditemukan di dalam keranjang user ini.`);
    }

    const targetUrl = `http://localhost:3002/products/${productId}`;
    const productResponse = await fetch(targetUrl);

    if (!productResponse.ok) {
      const errorData = await productResponse.json().catch(() => ({}));
      throw new BadRequestException('Gagal melakukan sinkronisasi data produk dengan Product Service. Alasan ${errorData.message}');
    }
    const productData = await productResponse.json();

    if (quantity > productData.stock) {
      throw new BadRequestException(`Gagal memperbarui kuantitas. Batas maksimal stok yang tersedia: ${productData.stock}`);
    }

    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: quantity },
    });

    return { message: 'Kuantitas produk di dalam keranjang berhasil diperbarui.' };
  }

  // Melihat isi keranjang milik user
  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        cart_items: true,
      },
    });

    if (!cart || cart.cart_items.length === 0) {
      throw new NotFoundException(`Cart for User ID ${userId} is empty or not found`);
    }
    const detailedItems = await Promise.all(
      cart.cart_items.map(async (item) => {
        try {
          const res = await fetch(`http://localhost:3002/products/${item.product_id}`);
          if (res.ok) {
            const product = await res.json();
            return {
              product_id: item.product_id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
            };
          }
        } catch (e) {
        }
        return {
          product_id: item.product_id,
          name: 'Unknown Product',
          price: 0,
          quantity: item.quantity,
        };
      })
    );

    return {
      cart_id: cart.id,
      user_id: cart.user_id,
      items: detailedItems,
    };
  }

  // Menghapus satu item dari keranjang
  async deleteCartItem(userId: number, productId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { user_id: userId } });
    if (!cart) throw new NotFoundException('Keranjang tidak ditemukan.');

    const item = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (!item) {
      throw new NotFoundException(`Produk dengan ID ${productId} tidak ada di keranjang.`);
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return { message: `Product successfully removed from cart.` };
  }

  // Membersihkan isi keranjang
  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { user_id: userId } });
    if (!cart) throw new NotFoundException('Keranjang tidak ditemukan.');

    await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    return { message: 'Semua item di dalam keranjang berhasil dibersihkan.' };
  }

  // Checkout item 
  async checkout(checkoutDto: CheckoutDto, token: string) {
    const { user_id } = checkoutDto;

    const cart = await this.prisma.cart.findUnique({
      where: { user_id },
      include: { cart_items: true },
    });

    if (!cart || cart.cart_items.length === 0) {
      throw new BadRequestException(`Tidak dapat melakukan checkout. Keranjang belanja kosong.`);
    }

    return this.prisma.$transaction(async (tx) => {

      const newOrder = await tx.order.create({
        data: { user_id: user_id },
      });

      for (const item of cart.cart_items) {
        const productRes = await fetch(`http://localhost:3002/products/${item.product_id}`, {
          headers: token ? { 'Authorization': token } : {},
        });
        if (!productRes.ok) {
          throw new BadRequestException(`Produk ID ${item.product_id} tidak valid saat checkout.`);
        }
        const productData = await productRes.json();

        await tx.orderDetail.create({
          data: {
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: productData.price, 
          },
        });

        const reduceRes = await fetch(`http://localhost:3002/admin/products/${item.product_id}/reduce`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token || ''
          },
          body: JSON.stringify({ quantity: item.quantity }),
        });

        if (!reduceRes.ok) {
          throw new BadRequestException(`Gagal memotong stok untuk produk ID ${item.product_id} di inventory.`);
        }
      }

      // C. Kosongkan keranjang belanja
      await tx.cartItem.deleteMany({
        where: { cart_id: cart.id },
      });

      return {
        message: 'Checkout sukses dilakukan. Pesanan Anda berhasil diproses. ',
        order_id: newOrder.id,
      };
    });
  }

  async getOrderDetail(orderId: number, token?: string) {
    const orderDetails = await this.prisma.orderDetail.findMany({
      where: { order_id: orderId },
    });

    if (!orderDetails || orderDetails.length === 0) {
      throw new NotFoundException(`Detail pesanan dengan Order ID ${orderId} tidak ditemukan.`);
    }

    // Gabungkan data lokal transaksi dengan detail nama produk dari Product Service (Port 3002)
    const detailedItems = await Promise.all(
      orderDetails.map(async (item) => {
        try {
          const res = await fetch(`http://localhost:3002/products/${item.product_id}`, {
            headers: token ? { 'Authorization': token } : {},
          });
          if (res.ok) {
            const product = await res.json();
            return {
              product_id: item.product_id,
              name: product.name,
              quantity: item.quantity,
              price: item.price, // Menggunakan snapshot harga saat pembelian
            };
          }
        } catch (e) {
          // Fallback jika Product Service mati / kendala jaringan
        }
        return {
          product_id: item.product_id,
          name: 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    return {
      order_id: orderId,
      items: detailedItems,
    };
  }
  
  // History pesanan
  async getOrderHistory(userId: number) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      include: { order_details: true },
      orderBy: { created_at: 'desc' },
    });
  }
}