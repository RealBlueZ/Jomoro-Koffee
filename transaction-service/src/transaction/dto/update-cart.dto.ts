import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
  @ApiProperty({ example: 1, description: 'ID User yang memiliki keranjang' })
    @IsNumber()
    user_id!: number;

  @ApiProperty({ example: 3, description: 'Kuantitas baru untuk produk di dalam keranjang' })
    @IsNumber()
    @Min(1, { message: 'Kuantitas minimal adalah 1' })
    quantity!: number;
}