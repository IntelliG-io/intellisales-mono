import dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });

import { Prisma, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function requireDemo() {
  const tenant = await prisma.tenant.findFirst({ where: { name: 'Demo Tenant' } });
  if (!tenant) throw new Error('Demo Tenant not found. Seed first.');
  const store = await prisma.store.findFirst({ where: { tenantId: tenant.id, name: 'Main Store' } });
  if (!store) throw new Error('Main Store not found. Seed first.');
  const user = await prisma.user.findFirst({ where: { tenantId: tenant.id, email: 'admin@demo.local' } });
  if (!user) throw new Error('Admin user not found. Seed first.');
  const membership = await prisma.storeMember.findUnique({ where: { storeId_userId: { storeId: store.id, userId: user.id } } });
  if (!membership) throw new Error('Admin user is not a member of Main Store.');
  return { tenant, store, user };
}

async function testUniqueConstraints(tenantId: string) {
  // Duplicate store name per tenant should fail
  let duplicateStoreOK = false;
  try {
    await prisma.store.create({ data: { tenantId, name: 'Main Store' } });
    duplicateStoreOK = true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      // expected
    } else {
      throw e;
    }
  }
  if (duplicateStoreOK) throw new Error('Expected unique constraint on (tenantId, name) to fail');

  // Duplicate email per tenant should fail
  let duplicateUserOK = false;
  try {
    await prisma.user.create({ data: { tenantId, email: 'admin@demo.local', passwordHash: 'x', role: Role.ADMIN } });
    duplicateUserOK = true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      // expected
    } else {
      throw e;
    }
  }
  if (duplicateUserOK) throw new Error('Expected unique constraint on (tenantId, email) to fail');
}

async function testCascades() {
  const tempTenant = await prisma.tenant.create({ data: { name: `Temp Tenant ${Date.now()}` } });
  const tempStore = await prisma.store.create({ data: { tenantId: tempTenant.id, name: 'Temp Store' } });
  const tempUser = await prisma.user.create({ data: { tenantId: tempTenant.id, email: `temp-${Date.now()}@demo.local`, passwordHash: 'x', role: Role.MANAGER } });
  await prisma.storeMember.create({ data: { storeId: tempStore.id, userId: tempUser.id } });

  // Delete tenant and verify cascades remove related rows
  await prisma.tenant.delete({ where: { id: tempTenant.id } });

  const [storeCount, userCount, memberCount] = await Promise.all([
    prisma.store.count({ where: { tenantId: tempTenant.id } }),
    prisma.user.count({ where: { tenantId: tempTenant.id } }),
    prisma.storeMember.count({ where: { storeId: tempStore.id, userId: tempUser.id } }),
  ]);

  if (storeCount !== 0 || userCount !== 0 || memberCount !== 0) {
    throw new Error('Cascade delete failed to remove related rows');
  }
}

async function main() {
  const { tenant } = await requireDemo();
  await testUniqueConstraints(tenant.id);
  await testCascades();

  // Basic relational query
  const stores = await prisma.store.findMany({
    where: { tenantId: tenant.id },
    include: { members: true, tenant: true },
  });

  console.log('Verified stores for Demo Tenant:', stores.map(s => ({ id: s.id, name: s.name, members: s.members.length })));
  console.log('All checks passed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
