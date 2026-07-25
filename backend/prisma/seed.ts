import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/slug.js';

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('parol123', 10);

  // 1) Super admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ku.uz' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@ku.uz', role: 'SUPER_ADMIN', passwordHash: pass },
  });

  // 2) Tashkilot egasi + tashkilot (5% keshbek)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@dokon.uz' },
    update: {},
    create: { name: 'Do‘kon Egasi', email: 'owner@dokon.uz', role: 'ORG_OWNER', passwordHash: pass },
  });

  const org = await prisma.organization.upsert({
    where: { slug: slugify('Yangi Bozor Market') },
    update: {},
    create: {
      name: 'Yangi Bozor Market',
      slug: slugify('Yangi Bozor Market'),
      category: 'Oziq-ovqat',
      description: 'Har kunlik xaridlar uchun market',
      cashbackType: 'PERCENT',
      cashbackValue: 5,
      minPurchase: 10000,
      maxCashbackPerTxn: 50000,
      isActive: true,
      ownerId: owner.id,
    },
  });
  await prisma.user.update({ where: { id: owner.id }, data: { organizationId: org.id } });

  // 3) Kassir
  await prisma.user.upsert({
    where: { email: 'kassir@dokon.uz' },
    update: {},
    create: {
      name: 'Kassir Aziz',
      email: 'kassir@dokon.uz',
      role: 'CASHIER',
      passwordHash: pass,
      organizationId: org.id,
    },
  });

  // 4) Xaridor (referral kodi bilan)
  const customer = await prisma.user.upsert({
    where: { phone: '+998901234567' },
    update: {},
    create: {
      name: 'Xaridor Ali',
      phone: '+998901234567',
      role: 'CUSTOMER',
      passwordHash: pass,
      referralCode: 'KUALI01',
    },
  });

  console.log('✅ Demo ma‘lumotlar tayyor:');
  console.log('   Admin:   admin@ku.uz / parol123');
  console.log('   Ega:     owner@dokon.uz / parol123');
  console.log('   Kassir:  kassir@dokon.uz / parol123');
  console.log('   Xaridor: +998901234567 / parol123');
  console.log(`   Xaridor taklif kodi: ${customer.referralCode}`);
  console.log(`   Tashkilot: ${org.name} (${org.cashbackValue}% keshbek)`);
  console.log(`   Admin ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
