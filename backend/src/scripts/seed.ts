import dotenv from 'dotenv';
// Load env similar to server startup
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });

import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getBcryptSaltRounds } from '../config/env';

const prisma = new PrismaClient();

async function main() {
  const tenantName = 'Demo Tenant';
  const storeName = 'Main Store';
  const adminEmail = 'admin@demo.local';
  const adminPassword = 'admin123';

  const tenant = await prisma.tenant.upsert({
    where: { name: tenantName },
    update: {},
    create: { name: tenantName },
  });

  const store = await prisma.store.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: storeName } },
    update: {},
    create: { tenantId: tenant.id, name: storeName },
  });

  const rounds = getBcryptSaltRounds();
  const passwordHash = await bcrypt.hash(adminPassword, rounds);

  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Link user to store
  await prisma.storeMember.upsert({
    where: { storeId_userId: { storeId: store.id, userId: user.id } },
    update: {},
    create: { storeId: store.id, userId: user.id },
  });

  // Seed some demo products for the store (idempotent via skipDuplicates)
  const products = [
    {
      name: 'Espresso Beans',
      description: '1kg premium Arabica espresso blend',
      price: new Prisma.Decimal('14.99'),
      category: 'Beverages',
      status: 'active',
    },
    {
      name: 'Whole Milk 1L',
      description: 'Fresh dairy whole milk 1 litre',
      price: new Prisma.Decimal('1.99'),
      category: 'Dairy',
      status: 'active',
    },
    {
      name: 'Croissant',
      description: 'Butter croissant, baked fresh daily',
      price: new Prisma.Decimal('2.49'),
      category: 'Bakery',
      status: 'active',
    },
    {
      name: 'Chocolate Bar',
      description: '70% dark chocolate 100g',
      price: new Prisma.Decimal('3.25'),
      category: 'Snacks',
      status: 'active',
    },
    {
      name: 'Sparkling Water 500ml',
      description: 'Natural mineral sparkling water',
      price: new Prisma.Decimal('0.99'),
      category: 'Beverages',
      status: 'active',
    },
  ];

  await prisma.product.createMany({
    data: products.map((p) => ({ ...p, storeId: store.id })),
    skipDuplicates: true,
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    tenant: { id: tenant.id, name: tenant.name },
    store: { id: store.id, name: store.name },
    user: { id: user.id, email: user.email, role: user.role },
    products: products.map((p) => p.name),
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
