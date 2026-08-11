import { prisma } from '../lib/prisma';

async function check() {
  const now = new Date();
  console.log('Hozirgi vaqt (UTC):', now.toISOString());
  console.log('Hozirgi vaqt (local):', now.toLocaleString('uz', { timeZone: 'Asia/Tashkent' }));
  console.log('Bugun (UTC getDay):', now.getDay(), ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][now.getDay()]);

  const users = await prisma.user.findMany({
    where: { telegramChatId: { not: null } },
    include: { groups: true }
  });

  console.log('\nTelegram ulangan foydalanuvchilar:', users.length);

  for (const u of users) {
    console.log('\nUser:', u.email, '| ChatID:', u.telegramChatId);
    for (const g of u.groups) {
      console.log('  Guruh:', g.name);
      console.log('  Vaqt:', g.time);
      console.log('  Kunlar:', JSON.stringify(g.days));

      if (g.time) {
        const [hoursStr, minutesStr] = g.time.split(':');
        const lessonHour = parseInt(hoursStr, 10);
        const lessonMinute = parseInt(minutesStr, 10);
        const lessonTime = new Date();
        lessonTime.setHours(lessonHour, lessonMinute, 0, 0);
        const minutesUntilLesson = (lessonTime.getTime() - now.getTime()) / (1000 * 60);
        console.log('  Darsgacha qolgan vaqt (min):', minutesUntilLesson.toFixed(1));
        console.log('  25-35 oralig\'ida:', minutesUntilLesson >= 25 && minutesUntilLesson <= 35 ? 'HA ✅' : 'YO\'Q ❌');
      }
    }
  }

  await prisma.$disconnect();
}

check().catch(console.error);
