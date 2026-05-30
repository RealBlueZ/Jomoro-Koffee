import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({ example: 1, description: 'ID User/Customer yang akan checkout' })
  @IsNumber()
  user_id!: number;
}
