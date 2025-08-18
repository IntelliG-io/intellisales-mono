import type { PrismaClient, Store, Prisma } from '@prisma/client';
import { createStoreRepository } from '../../repositories/storeRepository';
import { NotFoundError } from '../../repositories/errors';

function makeNow() { return new Date(); }

describe('storeRepository', () => {
  const makeMock = () => {
    const now = makeNow();
    const stores: Store[] = [
      { id: 's1', tenantId: 't1', name: 'A', createdAt: now, updatedAt: now } as Store,
      { id: 's2', tenantId: 't2', name: 'B', createdAt: now, updatedAt: now } as Store,
    ];

    const prisma = {
      store: {
        create: jest.fn<Promise<Store>, [Prisma.StoreCreateArgs]>().mockImplementation(async (args) => {
          const name = (args.data as any).name as string;
          const tid = (args.data as any).tenant.connect.id as string;
          const s: Store = { id: 's3', tenantId: tid, name, createdAt: now, updatedAt: now } as Store;
          stores.push(s);
          return s;
        }),
        findFirst: jest.fn<Promise<Store | null>, [Prisma.StoreFindFirstArgs]>().mockImplementation(async (args) => {
          const id = (args.where as any).id as string | undefined;
          const tid = (args.where as any).tenantId as string | undefined;
          return stores.find((s) => (!id || s.id === id) && (!tid || s.tenantId === tid)) ?? null;
        }),
        findMany: jest.fn<Promise<Store[]>, [Prisma.StoreFindManyArgs]>().mockImplementation(async (args) => {
          const tid = (args.where as any)?.tenantId as string | undefined;
          return tid ? stores.filter((s) => s.tenantId === tid) : stores.slice();
        }),
      },
    } as unknown as PrismaClient;

    return { prisma, stores };
  };

  test('create and retrieve store by tenant id', async () => {
    const { prisma } = makeMock();
    const repo = createStoreRepository(prisma);

    const created = await repo.createStore('t1', { name: 'C', tenant: { connect: { id: 't1' } } } as any);
    expect(created.id).toBeDefined();

    const fetched = await repo.findStoreById('t1', created.id);
    expect(fetched?.name).toBe('C');
  });

  test('cross-tenant access → NotFoundError', async () => {
    const { prisma } = makeMock();
    const repo = createStoreRepository(prisma);

    await expect(repo.findStoreById('t1', 's2')).rejects.toBeInstanceOf(NotFoundError); // s2 belongs to t2
  });

  test('findStoresByTenant returns correct isolation', async () => {
    const { prisma } = makeMock();
    const repo = createStoreRepository(prisma);

    const t1Stores = await repo.findStoresByTenant('t1');
    expect(t1Stores.every((s) => s.tenantId === 't1')).toBe(true);

    const t2Stores = await repo.findStoresByTenant('t2');
    expect(t2Stores.every((s) => s.tenantId === 't2')).toBe(true);
  });
});
