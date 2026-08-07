import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const email = process.argv[2];

if (!email) {
  console.error('❌ Xato: Email kiritilmadi!');
  console.log('Foydalanish: npx tsx src/scripts/set-admin.ts email@example.com');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const targetEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      console.error(`\n❌ '${targetEmail}' pochtali foydalanuvchi topilmadi.`);
      console.log('💡 Avval DarsHub saytida ushbu email bilan ro\'yxatdan o\'ting, so\'ngra shu buyruqni qayta yurgazing.\n');
      process.exit(1);
    }

    await prisma.user.update({
      where: { email: targetEmail },
      data: { role: 'admin' },
    });

    console.log(`\n🎉 MUVAFFAQIYAT: ${user.fullName} (${user.email}) foydalanuvchisiga ADMIN huquqi berildi! 🛡️\n`);
  } catch (error: any) {
    console.error('Xato:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

makeAdmin();
