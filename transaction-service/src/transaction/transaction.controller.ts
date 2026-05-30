import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('Cart & Transactions')
@Controller('cart')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add product coffee to cart' })
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.transactionService.addToCart(addToCartDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get active cart by User ID' })
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionService.getCart(userId);
  }

  @Delete('item/:itemId')
  @ApiOperation({ summary: 'Remove an item from cart by CartItem ID' })
  removeItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.transactionService.removeCartItem(itemId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout active cart to create an official order' })
  checkout(@Body() checkoutDto: CheckoutDto) {
    return this.transactionService.checkout(checkoutDto);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get order history by User ID' })
  getOrderHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionService.getOrderHistory(userId);
  }
}