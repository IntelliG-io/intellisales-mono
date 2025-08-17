import dotenv from 'dotenv';
// Load env similar to server startup
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Link user to store
  await prisma.storeMember.upsert({
    where: { storeId_userId: { storeId: store.id, userId: user.id } },
    update: {},
    create: { storeId: store.id, userId: user.id },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    tenant: { id: tenant.id, name: tenant.name },
    store: { id: store.id, name: store.name },
    user: { id: user.id, email: user.email, role: user.role },
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
