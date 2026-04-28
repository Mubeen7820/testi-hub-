import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables = ['OTP', 'User', 'Testimonial', 'DownloadEvent', 'ActivityPlan'];
  
  console.log('Enabling Row Level Security (RLS) on tables...');
  
  for (const table of tables) {
    try {
      // Use double quotes for table names in case of case sensitivity
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✅ RLS enabled for table: ${table}`);
    } catch (error) {
      console.error(`❌ Failed to enable RLS for table ${table}:`, error.message);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
