import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export function IsAtLeastThreeWords(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAtLeastThreeWords',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Pisahkan kata menggunakan spasi dan bersihkan spasi berlebih
          const words = value.trim().split(/\s+/); 
          return words.length >= 3;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Product name must contain at least 3 words.';
        },
      },
    });
  };
}

export class CreateProductDto {
  @ApiProperty({ example: 'Espresso Romano' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Kopi espresso dengan perasan lemon segar' })
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty({ example: 1, description: 'ID dari Kategori Produk' })
  @IsNumber()
  @IsNotEmpty()
  category_id!: number;
}