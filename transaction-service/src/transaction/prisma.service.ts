import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb'; // <-- Pastikan di-import sesuai package tim Anda
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load variabel lingkungan secara absolut sebelum class terbentuk
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  [x: string]: any;
  
  constructor() {
    // 1. Ambil URL database, gunakan fallback jika .env belum siap saat runtime awal
    const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/jomoro-transaction';

    // 2. Inisialisasi adapter MariaDB sesuai cara kelompok Anda
    const adapter = new PrismaMariaDb(dbUrl);

    // 3. Alirkan adapter ke constructor induk PrismaClient
    super({ adapter } as any);

    console.log('──> PrismaService berhasil terhubung ke MariaDB via Adapter Pattern!');
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}