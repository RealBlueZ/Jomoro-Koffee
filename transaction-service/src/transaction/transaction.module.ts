import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { OrderController } from './order.controller';
import { JwtModule } from '@nestjs/jwt';
import { ProfileController } from './profile.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'JomoroKoffeService',
    })
  ],
  controllers: [TransactionController, OrderController, ProfileController],
  providers: [TransactionService, PrismaService],
  exports: [PrismaService],
})
export class TransactionModule {}
