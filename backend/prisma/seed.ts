import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin user
  const superAdminPassword = await bcrypt.hash('Admin123!', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      password_hash: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('✅ Created super admin:', superAdmin.email);

  // Create Restaurant 1: Le Bistrot Gourmand
  const bistrot = await prisma.restaurant.upsert({
    where: { slug: 'bistrot-gourmand' },
    update: {},
    create: {
      name: 'Le Bistrot Gourmand',
      slug: 'bistrot-gourmand',
      address: '15 Rue de la Gastronomie, 75001 Paris',
      google_review_url: 'https://g.page/r/bistrot-gourmand/review',
      phone: '+33123456789',
      email: 'contact@bistrot-gourmand.com',
      is_active: true,
      wheel_active: true,
    },
  });

  console.log('✅ Created restaurant:', bistrot.name);

  // Create admin for Bistrot
  const bistrotAdminPassword = await bcrypt.hash('Admin123!', 10);
  const bistrotAdmin = await prisma.user.upsert({
    where: { email: 'admin-bistrot@test.com' },
    update: {},
    create: {
      email: 'admin-bistrot@test.com',
      password_hash: bistrotAdminPassword,
      role: Role.ADMIN_RESTAURANT,
      restaurant_id: bistrot.id,
    },
  });

  console.log('✅ Created bistrot admin:', bistrotAdmin.email);

  // Create staff for Bistrot
  const bistrotStaffPassword = await bcrypt.hash('Staff123!', 10);
  const bistrotStaff = await prisma.user.upsert({
    where: { email: 'staff-bistrot@test.com' },
    update: {},
    create: {
      email: 'staff-bistrot@test.com',
      password_hash: bistrotStaffPassword,
      role: Role.STAFF,
      restaurant_id: bistrot.id,
    },
  });

  console.log('✅ Created bistrot staff:', bistrotStaff.email);

  // Create prizes for Bistrot (total: 80%)
  const bistrotPrizes = await Promise.all([
    prisma.prize.upsert({
      where: {
        restaurant_id_name: {
          restaurant_id: bistrot.id,
          name: 'Café offert',
        },
      },
      update: {},
      create: {
        restaurant_id: bistrot.id,
        name: 'Café offert',
        percentage: 30.0,
        message: 'Félicitations ! Vous avez gagné un café offert.',
        is_active: true,
      },
    }),
    prisma.prize.upsert({
      where: {
        restaurant_id_name: {
          restaurant_id: bistrot.id,
          name: 'Dessert offert',
        },
      },
      update: {},
      create: {
        restaurant_id: bistrot.id,
        name: 'Dessert offert',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné un dessert offert.',
        is_active: true,
      },
    }),
    prisma.prize.upsert({
      where: {
        restaurant_id_name: {
          restaurant_id: bistrot.id,
          name: '-10% prochaine commande',
        },
      },
      update: {},
      create: {
        restaurant_id: bistrot.id,
        name: '-10% prochaine commande',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné une réduction de 10% sur votre prochaine commande.',
        is_active: true,
      },
    }),
  ]);

  console.log('✅ Created bistrot prizes:', bistrotPrizes.length);

  // Create Restaurant 2: La Trattoria
  const trattoria = await prisma.restaurant.upsert({
    where: { slug: 'trattoria' },
    update: {},
    create: {
      name: 'La Trattoria',
      slug: 'trattoria',
      address: '42 Avenue des Pâtes, 75008 Paris',
      google_review_url: 'https://g.page/r/trattoria/review',
      phone: '+33987654321',
      email: 'contact@trattoria.com',
      is_active: true,
      wheel_active: true,
    },
  });

  console.log('✅ Created restaurant:', trattoria.name);

  // Create admin for Trattoria
  const trattoriaAdminPassword = await bcrypt.hash('Admin123!', 10);
  const trattoriaAdmin = await prisma.user.upsert({
    where: { email: 'admin-trattoria@test.com' },
    update: {},
    create: {
      email: 'admin-trattoria@test.com',
      password_hash: trattoriaAdminPassword,
      role: Role.ADMIN_RESTAURANT,
      restaurant_id: trattoria.id,
    },
  });

  console.log('✅ Created trattoria admin:', trattoriaAdmin.email);

  // Create staff for Trattoria
  const trattoriaStaffPassword = await bcrypt.hash('Staff123!', 10);
  const trattoriaStaff = await prisma.user.upsert({
    where: { email: 'staff-trattoria@test.com' },
    update: {},
    create: {
      email: 'staff-trattoria@test.com',
      password_hash: trattoriaStaffPassword,
      role: Role.STAFF,
      restaurant_id: trattoria.id,
    },
  });

  console.log('✅ Created trattoria staff:', trattoriaStaff.email);

  // Create prizes for Trattoria (total: 80%)
  const trattoriaPrizes = await Promise.all([
    prisma.prize.upsert({
      where: {
        restaurant_id_name: {
          restaurant_id: trattoria.id,
          name: 'Café offert',
        },
      },
      update: {},
      create: {
        restaurant_id: trattoria.id,
        name: 'Café offert',
        percentage: 30.0,
        message: 'Félicitations ! Vous avez gagné un café offert.',
        is_active: true,
      },
    }),
    prisma.prize.upsert({
      where: {
        restaurant_id_name: {
          restaurant_id: trattoria.id,
          name: 'Dessert offert',
        },
      },
      update: {},
      create: {
        restaurant_id: trattoria.id,
        name: 'Dessert offert',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné un dessert offert.',
        is_active: true,
      },
    }),
    prisma.prize.upsert({
      where: {
        restaurant_id_name: {
          restaurant_id: trattoria.id,
          name: '-10% prochaine commande',
        },
      },
      update: {},
      create: {
        restaurant_id: trattoria.id,
        name: '-10% prochaine commande',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné une réduction de 10% sur votre prochaine commande.',
        is_active: true,
      },
    }),
  ]);

  console.log('✅ Created trattoria prizes:', trattoriaPrizes.length);

  console.log('✨ Seeding completed!');
  console.log('\n📋 Summary:');
  console.log('  - 1 Super Admin (admin@platform.com / Admin123!)');
  console.log('  - 2 Restaurants (bistrot-gourmand, trattoria)');
  console.log('  - 2 Admins (admin-bistrot@test.com, admin-trattoria@test.com / Admin123!)');
  console.log('  - 2 Staff (staff-bistrot@test.com, staff-trattoria@test.com / Staff123!)');
  console.log('  - 6 Prizes (3 per restaurant, total 80% each)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
