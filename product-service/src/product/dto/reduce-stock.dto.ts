import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReduceStockDto {
  @ApiProperty({ example: 5, description: 'Jumlah stok produk yang ingin dikurangi' })
    @IsNumber()
    @Min(1, { message: 'Kuantitas pengurangan harus minimal 1' })
    quantity!: number;
}