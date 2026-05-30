import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/jomoro-product';
  const adapter = new PrismaMariaDb(dbUrl);
  const prisma = new PrismaClient({ adapter });

  await prisma.$connect();

  // DEFAULT CATEGORY
  await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Coffee',
    },
  });

  console.log('Seeding data kategori berhasil!');
  await prisma.$disconnect();
}

main();