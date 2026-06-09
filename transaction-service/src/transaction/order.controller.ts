import { Controller, Get, Post, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { TransactionService } from './transaction.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

interface JwtUser {
  id: number;
  role: string;
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly transactionService: TransactionService) {}

  // 1. POST /orders -> Checkout keranjang menjadi order resmi
  @Post()
  @ApiOperation({ summary: 'Checkout active cart into an official order' })
  checkout(@Req() req: Request) {
    const user = req['user'] as JwtUser;
    const token = req.headers.authorization ?? ''; // Ambil token JWT aktif
    return this.transactionService.checkout({ user_id: user.id }, token);
  }

  // 2. GET /orders -> Riwayat pesanan milik user login
  @Get()
  @ApiOperation({ summary: 'Get order history of the logged-in user' })
  getHistory(@Req() req: Request) {
    const user = req['user'] as JwtUser;
    return this.transactionService.getOrderHistory(user.id);
  }

  // 3. PERBAIKAN SOAL: POST /orders/:id -> Ambil detail spesifik order berdasarkan ID
  @Post(':id')
  @ApiOperation({ summary: "Fetch specific order's product details" })
  getOrderDetail(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() req: Request
  ) {
    const token = req.headers.authorization; // Teruskan token untuk mengambil data produk
    return this.transactionService.getOrderDetail(orderId, token);
  }
}