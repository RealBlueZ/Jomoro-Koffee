import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  // Nama Produk: minimal harus terdiri dari 3 kata
  @ApiProperty({ example: 'Kopi Espresso Romano' }) // contoh 3 kata agar lolos validasi
  @IsString()
  @IsNotEmpty()
  @MinWords(3, { message: 'Nama produk minimal harus terdiri dari 3 kata' })
  name!: string;

  // Deskripsi: minimal panjang 20 karakter
  @ApiProperty({ example: 'Kopi espresso dengan perasan lemon segar khas Italia' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Deskripsi minimal harus memiliki panjang 20 karakter' })
  description!: string;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0)
  price!: number;

  // Stok: angka bulat (integer) di antara 0 hingga 999
  @ApiProperty({ example: 50, description: 'Angka bulat antara 0 hingga 999' })
  @IsInt({ message: 'Stok harus berupa angka bulat (tidak boleh desimal)' })
  @Min(0, { message: 'Stok tidak boleh kurang dari 0' })
  @Max(999, { message: 'Stok tidak boleh lebih dari 999' })
  stock!: number;

  @ApiProperty({ example: null, required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: 1, description: 'ID dari Kategori Produk' })
  @IsNumber()
  @IsNotEmpty()
  category_id!: number;
}

export function MinWords(min: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'minWords',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min],
      options: validationOptions,
      validator: {
        // Logika utama menghitung kata
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Memecah teks berdasarkan spasi satu atau lebih (regex: \s+)
          const words = value.trim().split(/\s+/);
          const minWordsRequired = args.constraints[0];
          
          // Mengembalikan true jika jumlah kata memenuhi kriteria minimum
          return words.filter(word => word.length > 0).length >= minWordsRequired;
        },
        // Pesan eror default jika kriteria tidak terpenuhi
        defaultMessage(args: ValidationArguments) {
          const minWordsRequired = args.constraints[0];
          return `${args.property} harus memiliki minimal ${minWordsRequired} kata.`;
        },
      },
    });
  };
}
