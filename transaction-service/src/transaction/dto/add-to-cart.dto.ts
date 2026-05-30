import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID User/Customer dari Token JWT' })
    @IsNumber()
    user_id!: number;

  @ApiProperty({ example: 101, description: 'ID Produk Kopi yang dipilih' })
    @IsNumber()
    product_id!: number;

  @ApiProperty({ example: 2, description: 'Jumlah porsi yang dibeli' })
    @IsNumber()
    @Min(1)
    quantity!: number;
}