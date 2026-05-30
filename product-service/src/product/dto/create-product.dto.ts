import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Espresso Romano' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Kopi espresso dengan perasan lemon segar' })
  @IsString()
  @IsNotEmpty() // Wajib diisi sesuai dengan skema prisma Anda
  description!: string;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: null, required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  // Sesuaikan menjadi snake_case mengikuti field di schema.prisma Anda
  @ApiProperty({ example: 1, description: 'ID dari Kategori Produk' })
  @IsNumber()
  @IsNotEmpty()
  category_id!: number;
}