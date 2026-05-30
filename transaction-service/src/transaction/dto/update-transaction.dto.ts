import { PartialType } from '@nestjs/swagger';
import { CheckoutDto } from './checkout.dto';

export class UpdateTransactionDto extends PartialType(CheckoutDto) {}
