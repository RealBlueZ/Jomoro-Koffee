import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';

// Definisi interface payload JWT sesuai standard project
interface JwtUser {
  id: number;
  role: string;
}

@ApiTags('Shopping Cart')
@ApiBearerAuth()
@Controller('cart') // Base path: /cart
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // 1. GET /cart (Retrieve authenticated user's cart)
  @Get()
  @ApiOperation({ summary: "Retrieve authenticated user's cart and items" })
  getCart(@Req() req: Request) {
    const user = req['user'] as JwtUser;
    return this.transactionService.getCart(user.id);
  }

  // 2. POST /cart (Add item to cart)
  @Post()
  @ApiOperation({ summary: 'Add an item to the shopping cart' })
  addToCart(
    @Req() req: Request,
    @Body() body: { product_id: number; quantity: number },
  ) {
    const user = req['user'] as JwtUser;

    if (!body.product_id || !body.quantity) {
      throw new BadRequestException('product_id dan quantity wajib diisi.');
    }

    // Memetakan ke DTO internal dengan user_id dari JWT yang aman
    return this.transactionService.addToCart({
      user_id: user.id,
      product_id: Number(body.product_id),
      quantity: Number(body.quantity),
    });
  }

  // 3. POST /cart/:product_id/update (Update product's quantity in cart)
  @Post(':product_id/update')
  @ApiOperation({ summary: "Update product's quantity in cart" })
  updateCartQuantity(
    @Req() req: Request,
    @Param('product_id', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    const user = req['user'] as JwtUser;
    return this.transactionService.updateCartQuantity(user.id, productId, quantity);
  }

  // 4. POST /cart/:product_id/delete (Delete product from cart)
  @Post(':product_id/delete')
  @ApiOperation({ summary: 'Remove a specified product from the cart' })
  deleteCartItem(
    @Req() req: Request,
    @Param('product_id', ParseIntPipe) productId: number,
  ) {
    const user = req['user'] as JwtUser;
    return this.transactionService.deleteCartItem(user.id, productId);
  }

  // 5. POST /cart/clear (Clear all items from the user's cart)
  @Post('clear')
  @ApiOperation({ summary: "Remove all items from the user's cart" })
  clearCart(@Req() req: Request) {
    const user = req['user'] as JwtUser;
    return this.transactionService.clearCart(user.id);
  }
}