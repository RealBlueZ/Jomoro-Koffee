import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/registerDTO';
import { LoginDto } from './dto/loginDTO';

import * as mysql from 'mysql2';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(private jwtService: JwtService) {

    const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/jomoro-auth';

    const adapter = new PrismaMariaDb(dbUrl);

    this.prisma = new PrismaClient({ adapter });
  }

  private countDigits(str: string): number {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] >= '0' && str[i] <= '9') {
        count++;
      }
    }
    return count;
  }

  async register(dto: RegisterDto) {

    if (this.countDigits(dto.password) < 2) {
      throw new BadRequestException('Password must contain at least 2 numeric digits.');
    }
    
    const emailLower = dto.email.toLowerCase();
    const isValidDomain = 
      emailLower.endsWith('.com') || 
      emailLower.endsWith('.net') || 
      emailLower.endsWith('.org') || 
      emailLower.endsWith('.id');

    if (!isValidDomain) {
      throw new BadRequestException('Email must end with a valid domain (.com, .net, .org, or .id).');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    // 3. Daftarkan user baru dengan role default "CUSTOMER" (atau sesuaikan kebutuhan)
    // Password disimpan secara PLAIN TEXT sesuai permintaan soal
    await this.prisma.user.create({
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        password: dto.password,
        role: 'CUSTOMER', // "ADMIN" atau "CUSTOMER"
      },
    });

    return { message: 'User registered successfully.' };
  }

  async login(dto: LoginDto) {
    // 1. Cek apakah email ada di database
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email does not exist.');
    }

    // 2. Cek apakah password cocok
    if (user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials (password mismatch).');
    }

    // 3. Generate JWT Payload berisi id dan role
    const payload = { id: user.id, role: user.role };
    
    return {
      message: 'Login successful',
      access_token: this.jwtService.sign(payload),
    };
  }
}