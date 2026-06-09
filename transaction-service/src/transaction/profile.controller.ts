import { Controller, Get, Req, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from './prisma.service'; // <-- Mengarah ke service lokal baru kita
import type { Request } from 'express';

interface JwtUser {
  id: number;
  role: string;
}

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('profiles') 
@UseGuards(AuthGuard)
export class ProfileController {
  // Inject PrismaService resmi dari NestJS IoC Container
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch and return the authenticated user\'s details' })
  async getProfile(@Req() req: Request) {
    const user = req['user'] as JwtUser; 

    if (!user || !user.id) {
      throw new BadRequestException('Identitas user tidak ditemukan pada token.');
    }

    try {
      // Query database langsung menggunakan properti standar hasil generate schema.prisma
      const userDb = await this.prisma.user.findUnique({
        where: { id: Number(user.id) },
      });

      if (!userDb) {
        throw new NotFoundException(`User dengan ID ${user.id} tidak ditemukan di database.`);
      }

      return {
        first_name: userDb.first_name,
        last_name: userDb.last_name,
        email: userDb.email,
        role: userDb.role,
      };

    } catch (error) {
      throw new BadRequestException(`Gagal membaca database MariaDB. Detail: ${error}`);
    }
  }
}