import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ReduceStockDto } from './dto/reduce-stock.dto';

// PUBLIC / GUEST ENDPOINTS
@ApiTags('Products & Categories')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('products')
  @ApiOperation({ summary: 'List all products' })
  findAll() {
    return this.productService.findAll();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get details of a specific product id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all available menu categories' })
  findAllCategories() {
    return this.productService.findAllCategories(); // Pastikan method ini ada di service Anda
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({ summary: 'Filter products by specific Category ID' })
  findProductsByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productService.findByCategory(categoryId); // Pastikan method ini ada di service Anda
  }


  // ADMIN ENDPOINT
  @Post('admin/products')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin Only)' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Post('admin/products/:id/update')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product details (Admin Only)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Post('admin/products/:id/reduce')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reduce product stock inventory' })
  reduceStock(@Param('id', ParseIntPipe) id: number, @Body() ReduceStockDto: ReduceStockDto) {
    return this.productService.reduceStock(id, ReduceStockDto.quantity);
  }

  @Post('admin/products/:id/delete')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product from system (Admin Only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
