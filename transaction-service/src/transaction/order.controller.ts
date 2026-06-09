import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { TransactionService } from './transaction.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

// Bentuk payload hasil decode JWT (lihat auth.guard.ts -> request['user'])
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

  // POST /orders -> checkout keranjang aktif menjadi order resmi
  @Post()
  @ApiOperation({ summary: 'Checkout active cart into an official order' })
  checkout(@Req() req: Request) {
    const user = req['user'] as JwtUser;
    // user_id diambil dari token, bukan dari body (lebih aman)
    const token = req.headers.authorization;
    return this.transactionService.checkout({ user_id: user.id }, token);
  }

  // GET /orders -> riwayat pesanan milik user yang sedang login
  @Get()
  @ApiOperation({ summary: 'Get order history of the logged-in user' })
  getHistory(@Req() req: Request) {
    const user = req['user'] as JwtUser;
    return this.transactionService.getOrderHistory(user.id);
  }
}
