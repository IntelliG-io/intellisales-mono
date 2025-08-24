import type { PrismaClient, Product } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { createProductRepository } from '../../repositories/productRepository';
import { DuplicateError, NotFoundError } from '../../repositories/errors';

function now() { return new Date(); }

describe('productRepository', () => {
  const makeMock = () => {
    const t = now();
    const products: Product[] = [
      { id: 'p1', storeId: 's1', name: 'Apple', description: null, price: new Prisma.Decimal(1.50), category: 'Fruit', status: 'active', createdAt: t, updatedAt: t } as unknown as Product,
      { id: 'p2', storeId: 's1', name: 'Banana', description: null, price: new Prisma.Decimal(0.99), category: 'Fruit', status: 'inactive', createdAt: t, updatedAt: t } as unknown as Product,
      { id: 'p3', storeId: 's2', name: 'Carrot', description: null, price: new Prisma.Decimal(2.00), category: 'Veg', status: 'active', createdAt: t, updatedAt: t } as unknown as Product,
    ];

    const prisma = {
      product: {
        create: jest.fn<Promise<Product>, [Prisma.ProductCreateArgs]>().mockImplementation(async (args) => {
          const data = args.data as any;
          const created: Product = {
            id: 'p_new',
            storeId: data.store.connect.id,
            name: data.name,
            description: data.description ?? null,
            price: data.price,
            category: data.category,
            status: data.status ?? 'active',
            createdAt: t,
            updatedAt: t,
          } as Product;
          products.push(created);
          return created;
        }),
        findUnique: jest.fn<Promise<Product | null>, [Prisma.ProductFindUniqueArgs]>().mockImplementation(async (args) => {
          const id = (args.where as any).id as string;
          return products.find(p => p.id === id) ?? null;
        }),
        findFirst: jest.fn<Promise<Product | null>, [Prisma.ProductFindFirstArgs]>().mockImplementation(async (args) => {
          const where = (args.where || {}) as any;
          const storeId = where.storeId as string | undefined;
          const name = where.name as string | undefined;
          const idNot = typeof where.id === 'object' && where.id ? (where.id as any).not : undefined;
          return products.find(p =>
            (storeId ? p.storeId === storeId : true) &&
            (name ? p.name === name : true) &&
            (idNot ? p.id !== idNot : true)
          ) ?? null;
        }),
        findMany: jest.fn<Promise<Product[]>, [Prisma.ProductFindManyArgs]>().mockImplementation(async (args) => {
          const where = (args.where || {}) as any;
          const q = where.name?.contains as string | undefined;
          const storeId = where.storeId as string | undefined;
          const category = where.category as string | undefined;
          const status = where.status as string | undefined;
          let list = products.filter(p =>
            (storeId ? p.storeId === storeId : true) &&
            (category ? p.category === category : true) &&
            (status ? p.status === status : true) &&
            (q ? p.name.toLowerCase().includes(q.toLowerCase()) : true)
          );
          // naive orderBy createdAt desc
          list = list.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          if (typeof args.skip === 'number') list = list.slice(args.skip);
          if (typeof args.take === 'number') list = list.slice(0, args.take);
          return list;
        }),
        count: jest.fn<Promise<number>, [Prisma.ProductCountArgs]>().mockImplementation(async (args) => {
          const where = (args.where || {}) as any;
          const q = where.name?.contains as string | undefined;
          const storeId = where.storeId as string | undefined;
          const category = where.category as string | undefined;
          const status = where.status as string | undefined;
          const n = products.filter(p =>
            (storeId ? p.storeId === storeId : true) &&
            (category ? p.category === category : true) &&
            (status ? p.status === status : true) &&
            (q ? p.name.toLowerCase().includes(q.toLowerCase()) : true)
          ).length;
          return n;
        }),
        update: jest.fn<Promise<Product>, [Prisma.ProductUpdateArgs]>().mockImplementation(async (args) => {
          const id = (args.where as any).id as string;
          const idx = products.findIndex(p => p.id === id);
          if (idx === -1) {
            const err: any = { name: 'PrismaClientKnownRequestError', code: 'P2025' };
            throw err;
          }
          const data = (args.data || {}) as any;
          const current = products[idx];
          const updated = {
            ...current,
            name: data.name ?? current.name,
            description: (data.description === null || typeof data.description === 'string') ? data.description : current.description,
            price: data.price ?? current.price,
            category: data.category ?? current.category,
            status: data.status ?? current.status,
            updatedAt: t,
          } as Product;
          products[idx] = updated;
          return updated;
        }),
      },
    } as unknown as PrismaClient;

    return { prisma, products };
  };

  test('create and retrieve by id', async () => {
    const { prisma } = makeMock();
    const repo = createProductRepository(prisma);

    const created = await repo.create({
      store: { connect: { id: 's1' } },
      name: 'Dates',
      description: 'Sweet',
      price: new Prisma.Decimal(3.25),
      category: 'Dry Fruit',
      status: 'active',
    });

    expect(created.id).toBeDefined();
    const found = await repo.findById(created.id);
    expect(found?.name).toBe('Dates');
  });

  test('find by name and excluding id', async () => {
    const { prisma } = makeMock();
    const repo = createProductRepository(prisma);

    const p = await repo.findFirstByName('s1', 'Apple');
    expect(p?.id).toBe('p1');

    const ex = await repo.findFirstByNameExcludingId('s1', 'Apple', 'p1');
    expect(ex).toBeNull();
  });

  test('findMany and count with filters + pagination', async () => {
    const { prisma } = makeMock();
    const repo = createProductRepository(prisma);

    const totalActiveFruitS1 = await repo.count({ storeId: 's1', category: 'Fruit', status: 'active' });
    expect(totalActiveFruitS1).toBe(1);

    const list = await repo.findMany({ storeId: 's1', q: 'a' }, { take: 1, skip: 0 });
    expect(list.length).toBe(1);
    expect(list[0].storeId).toBe('s1');
  });

  test('softDelete sets status inactive', async () => {
    const { prisma } = makeMock();
    const repo = createProductRepository(prisma);

    const updated = await repo.softDelete('p1');
    expect(updated.status).toBe('inactive');
  });

  test('duplicate on create -> DuplicateError', async () => {
    const { prisma } = makeMock();
    const repo = createProductRepository(prisma);

    (prisma.product.create as any).mockRejectedValueOnce({ name: 'PrismaClientKnownRequestError', code: 'P2002' });

    await expect(repo.create({
      store: { connect: { id: 's1' } },
      name: 'Apple',
      price: new Prisma.Decimal(1.5),
      category: 'Fruit',
    } as any)).rejects.toBeInstanceOf(DuplicateError);
  });

  test('update not found -> NotFoundError', async () => {
    const { prisma } = makeMock();
    const repo = createProductRepository(prisma);

    await expect(repo.update('does-not-exist', { name: 'X' })).rejects.toBeInstanceOf(NotFoundError);
  });
});
