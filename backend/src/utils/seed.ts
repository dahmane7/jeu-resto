import { airtable, TABLES } from './airtable';
import * as bcrypt from 'bcrypt';

// Note: Les enums doivent être définis dans votre code
// car Airtable stocke les valeurs comme strings

async function main() {
  console.log('🌱 Seeding Airtable database...');

  try {
    // Create super admin user
    const superAdminPassword = await bcrypt.hash('Admin123!', 10);
    
    const existingSuperAdmin = await airtable.findByField(
      TABLES.USERS,
      'email',
      'admin@platform.com'
    );

    if (!existingSuperAdmin) {
      await airtable.create(TABLES.USERS, {
        email: 'admin@platform.com',
        password_hash: superAdminPassword,
        role: 'SUPER_ADMIN',
        created_at: new Date(),
      });
      console.log('✅ Created super admin: admin@platform.com');
    } else {
      console.log('ℹ️  Super admin already exists');
    }

    // Create Restaurant 1: Le Bistrot Gourmand
    let bistrot = await airtable.findByField(
      TABLES.RESTAURANTS,
      'slug',
      'bistrot-gourmand'
    );

    if (!bistrot) {
      bistrot = await airtable.create(TABLES.RESTAURANTS, {
        name: 'Le Bistrot Gourmand',
        slug: 'bistrot-gourmand',
        address: '15 Rue de la Gastronomie, 75001 Paris',
        google_review_url: 'https://g.page/r/bistrot-gourmand/review',
        phone: '+33123456789',
        email: 'contact@bistrot-gourmand.com',
        is_active: true,
        wheel_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('✅ Created restaurant: Le Bistrot Gourmand');
    } else {
      console.log('ℹ️  Bistrot already exists');
    }

    // Create admin for Bistrot
    const bistrotAdminPassword = await bcrypt.hash('Admin123!', 10);
    const existingBistrotAdmin = await airtable.findByField(
      TABLES.USERS,
      'email',
      'admin-bistrot@test.com'
    );

    if (!existingBistrotAdmin) {
      await airtable.create(TABLES.USERS, {
        email: 'admin-bistrot@test.com',
        password_hash: bistrotAdminPassword,
        role: 'ADMIN_RESTAURANT',
        restaurant_id: [bistrot.id], // Airtable links sont des arrays
        created_at: new Date(),
      });
      console.log('✅ Created bistrot admin: admin-bistrot@test.com');
    }

    // Create staff for Bistrot
    const bistrotStaffPassword = await bcrypt.hash('Staff123!', 10);
    const existingBistrotStaff = await airtable.findByField(
      TABLES.USERS,
      'email',
      'staff-bistrot@test.com'
    );

    if (!existingBistrotStaff) {
      await airtable.create(TABLES.USERS, {
        email: 'staff-bistrot@test.com',
        password_hash: bistrotStaffPassword,
        role: 'STAFF',
        restaurant_id: [bistrot.id],
        created_at: new Date(),
      });
      console.log('✅ Created bistrot staff: staff-bistrot@test.com');
    }

    // Create prizes for Bistrot (total: 80%)
    const bistrotPrizes = [
      {
        name: 'Café offert',
        percentage: 30.0,
        message: 'Félicitations ! Vous avez gagné un café offert.',
      },
      {
        name: 'Dessert offert',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné un dessert offert.',
      },
      {
        name: '-10% prochaine commande',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné une réduction de 10% sur votre prochaine commande.',
      },
    ];

    for (const prize of bistrotPrizes) {
      const existingPrize = await airtable.findMany(TABLES.PRIZES, {
        filterByFormula: `AND({restaurant_id} = "${bistrot.id}", {name} = "${prize.name}")`,
        maxRecords: 1,
      });

      if (existingPrize.length === 0) {
        await airtable.create(TABLES.PRIZES, {
          restaurant_id: [bistrot.id],
          name: prize.name,
          percentage: prize.percentage,
          message: prize.message,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    console.log('✅ Created bistrot prizes: 3');

    // Create Restaurant 2: La Trattoria
    let trattoria = await airtable.findByField(
      TABLES.RESTAURANTS,
      'slug',
      'trattoria'
    );

    if (!trattoria) {
      trattoria = await airtable.create(TABLES.RESTAURANTS, {
        name: 'La Trattoria',
        slug: 'trattoria',
        address: '42 Avenue des Pâtes, 75008 Paris',
        google_review_url: 'https://g.page/r/trattoria/review',
        phone: '+33987654321',
        email: 'contact@trattoria.com',
        is_active: true,
        wheel_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('✅ Created restaurant: La Trattoria');
    } else {
      console.log('ℹ️  Trattoria already exists');
    }

    // Create admin for Trattoria
    const trattoriaAdminPassword = await bcrypt.hash('Admin123!', 10);
    const existingTrattoriaAdmin = await airtable.findByField(
      TABLES.USERS,
      'email',
      'admin-trattoria@test.com'
    );

    if (!existingTrattoriaAdmin) {
      await airtable.create(TABLES.USERS, {
        email: 'admin-trattoria@test.com',
        password_hash: trattoriaAdminPassword,
        role: 'ADMIN_RESTAURANT',
        restaurant_id: [trattoria.id],
        created_at: new Date(),
      });
      console.log('✅ Created trattoria admin: admin-trattoria@test.com');
    }

    // Create staff for Trattoria
    const trattoriaStaffPassword = await bcrypt.hash('Staff123!', 10);
    const existingTrattoriaStaff = await airtable.findByField(
      TABLES.USERS,
      'email',
      'staff-trattoria@test.com'
    );

    if (!existingTrattoriaStaff) {
      await airtable.create(TABLES.USERS, {
        email: 'staff-trattoria@test.com',
        password_hash: trattoriaStaffPassword,
        role: 'STAFF',
        restaurant_id: [trattoria.id],
        created_at: new Date(),
      });
      console.log('✅ Created trattoria staff: staff-trattoria@test.com');
    }

    // Create prizes for Trattoria (total: 80%)
    const trattoriaPrizes = [
      {
        name: 'Café offert',
        percentage: 30.0,
        message: 'Félicitations ! Vous avez gagné un café offert.',
      },
      {
        name: 'Dessert offert',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné un dessert offert.',
      },
      {
        name: '-10% prochaine commande',
        percentage: 25.0,
        message: 'Félicitations ! Vous avez gagné une réduction de 10% sur votre prochaine commande.',
      },
    ];

    for (const prize of trattoriaPrizes) {
      const existingPrize = await airtable.findMany(TABLES.PRIZES, {
        filterByFormula: `AND({restaurant_id} = "${trattoria.id}", {name} = "${prize.name}")`,
        maxRecords: 1,
      });

      if (existingPrize.length === 0) {
        await airtable.create(TABLES.PRIZES, {
          restaurant_id: [trattoria.id],
          name: prize.name,
          percentage: prize.percentage,
          message: prize.message,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    console.log('✅ Created trattoria prizes: 3');

    console.log('\n✨ Seeding completed!');
    console.log('\n📋 Summary:');
    console.log('  - 1 Super Admin (admin@platform.com / Admin123!)');
    console.log('  - 2 Restaurants (bistrot-gourmand, trattoria)');
    console.log('  - 2 Admins (admin-bistrot@test.com, admin-trattoria@test.com / Admin123!)');
    console.log('  - 2 Staff (staff-bistrot@test.com, staff-trattoria@test.com / Staff123!)');
    console.log('  - 6 Prizes (3 per restaurant, total 80% each)');
  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
