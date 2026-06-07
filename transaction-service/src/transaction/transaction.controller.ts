import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CheckoutDto } from './dto/checkout.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('Cart & Transactions')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  
  // 1. CART ENDPOINT (/cart)

  @Get('cart')
  @ApiOperation({ summary: 'Retrieve authenticated user\'s cart and items' })
  @ApiQuery({ name: 'user_id', type: Number, required: true, description: 'ID dari user yang memiliki keranjang' })
  getCart(@Query() query: any) {
    // Catatan: Pada integrasi lanjutan, userId idealnya diekstrak langsung dari payload JWT Request
    const userIdRaw = query.user_id || query.userId;

    if (!userIdRaw) {
      throw new BadRequestException('Parameter user_id wajib diisi.');
    }

    // Konversi string menjadi angka murni secara aman di dalam JavaScript
    const userIdNumeric = parseInt(userIdRaw, 10);
    
    if (isNaN(userIdNumeric)) {
      throw new BadRequestException('User ID harus berupa angka yang valid.');
    }

    return this.transactionService.getCart(userIdNumeric);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Add product item to cart' })
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.transactionService.addToCart(addToCartDto);
  }

  @Post('cart/:product_id/update')
  @ApiOperation({ summary: 'Update product quantity inside the cart' })
  updateCartQuantity(
    @Param('product_id', ParseIntPipe) productId: number,
    @Body() updateCartDto: UpdateCartDto // <--- Menggunakan DTO agar kotak input Box muncul di Swagger
  ) {
    return this.transactionService.updateCartQuantity(
      updateCartDto.user_id, 
      productId, 
      updateCartDto.quantity
    );
  }

  @Post('cart/:product_id/delete')
  @ApiOperation({ summary: 'Delete specific product from cart' })
  deleteCartItem(@Param('product_id', ParseIntPipe) productId: number, @Body('user_id', ParseIntPipe) userId: number) {
    return this.transactionService.deleteCartItem(userId, productId);
  }

  @Post('cart/clear')
  @ApiOperation({ summary: 'Clear all items from user\'s cart' })
  clearCart(@Body('user_id', ParseIntPipe) userId: number) {
    return this.transactionService.clearCart(userId);
  }

  // 2. ORDER & CHECKOUT ENDPOINT (/orders)

  @Post('orders')
  @ApiOperation({ summary: 'Process checkout from active cart to official order' })
  checkout(@Body() checkoutDto: CheckoutDto) {
    return this.transactionService.checkout(checkoutDto);
  }
  
  @Get('orders')
  @ApiOperation({ summary: 'List all authenticated user\'s orders history' })
  @ApiQuery({ name: 'user_id', type: Number, description: 'ID dari user untuk melihat riwayat order' })
  getOrderHistory(@Body('user_id', ParseIntPipe) userId: number) {
    return this.transactionService.getOrderHistory(userId);
  }

  @Post('orders/:id')
  @ApiOperation({ summary: 'Fetch specific order detail product items' })
  getOrderDetail(@Param('id', ParseIntPipe) orderId: number) {
    return this.transactionService.getOrderDetail(orderId);
  }
}