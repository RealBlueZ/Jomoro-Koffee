import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add product coffee to cart' })
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.transactionService.addToCart(addToCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get active cart by User ID' })
  getCart(@Query ('userId', ParseIntPipe) userId: number) {
    return this.transactionService.getCart(userId);
  }

  @Delete('cart/:product_id/delete')
  @ApiOperation({ summary: 'Remove an item from cart by CartItem ID' })
  deleteCartItem(
    @Param('product_id', ParseIntPipe) ProductId: number,
    @Query('user_id', ParseIntPipe)userId: number
  ) {
    return this.transactionService.deleteCartItem(userId, ProductId);
  }
}
