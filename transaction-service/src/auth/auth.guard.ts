import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan. Silakan login terlebih dahulu.');
    }

    try {
      // Pastikan secret key ini SAMA dengan yang ada di Auth Service Anda
      const secretKey = process.env.JWT_SECRET || 'JomoroKoffeeService';
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      });
      
      // Simpan data user hasil decode (id, role, dll) ke dalam objek request
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa.');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}