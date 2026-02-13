import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'mon-restaurant' },
    update: {},
    create: {
      name: 'Mon Restaurant',
      slug: 'mon-restaurant',
      address: '1 rue Example, 75001 Paris',
      google_review_url: 'https://g.page/r/example',
      wheel_active: true,
    },
  });

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: { password_hash: passwordHash, role: 'ADMIN_RESTAURANT', restaurant_id: restaurant.id },
    create: {
      email: 'admin@restaurant.com',
      password_hash: passwordHash,
      role: 'ADMIN_RESTAURANT',
      restaurant_id: restaurant.id,
    },
  });

  console.log('Seed OK: restaurant', restaurant.id, '| Connexion: admin@restaurant.com / Admin123!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
