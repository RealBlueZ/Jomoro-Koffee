import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

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
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'JomoroKoffeeService',
      });
      
      // Simpan data user 
      request['user'] = payload;

      const path = request.url;
      if(path.includes('/admin/')){
        if(payload.role !== 'ADMIN'){
          throw new ForbiddenException("Access Denied. Admin Only");
        }
      }

    } catch (err) {
      if(err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa.');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}