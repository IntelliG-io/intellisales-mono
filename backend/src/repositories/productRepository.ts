import type { Prisma, PrismaClient, Product } from '@prisma/client';
import { DuplicateError, DatabaseError, NotFoundError } from './errors';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findFirstByName(storeId: string, name: string): Promise<Product | null>;
  findFirstByNameExcludingId(storeId: string, name: string, excludeId: string): Promise<Product | null>;
  findMany(
    filter: { storeId?: string; category?: string; q?: string; status?: string },
    options?: { skip?: number; take?: number; orderBy?: Prisma.ProductOrderByWithRelationInput }
  ): Promise<Product[]>;
  count(filter: { storeId?: string; category?: string; q?: string; status?: string }): Promise<number>;
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
  softDelete(id: string): Promise<Product>;
}

function isPrismaKnownError(e: unknown): e is { code?: string; name?: string } {
  return !!e && typeof e === 'object' && 'name' in e;
}

function mapAndThrow(e: unknown, action: string): never {
  if (isPrismaKnownError(e)) {
    const code = (e as any).code;
    if (code === 'P2002') {
      throw new DuplicateError(`Duplicate constraint on ${action}`);
    }
    if (code === 'P2025') {
      throw new NotFoundError(`${action} target not found`);
    }
  }
  throw new DatabaseError(`${action} failed`);
}

export function createProductRepository(prisma: PrismaClient): ProductRepository {
  return {
    async findById(id: string): Promise<Product | null> {
      return prisma.product.findUnique({ where: { id } });
    },

    async findFirstByName(storeId: string, name: string): Promise<Product | null> {
      return prisma.product.findFirst({ where: { storeId, name } });
    },

    async findFirstByNameExcludingId(storeId: string, name: string, excludeId: string): Promise<Product | null> {
      return prisma.product.findFirst({ where: { storeId, name, id: { not: excludeId } } });
    },

    async findMany(
      filter,
      options
    ): Promise<Product[]> {
      const { storeId, category, q, status } = filter || {};
      const where: Prisma.ProductWhereInput = {
        ...(status ? { status } : {}),
        ...(storeId ? { storeId } : {}),
        ...(category ? { category } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      };
      return prisma.product.findMany({
        where,
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        skip: options?.skip,
        take: options?.take,
      });
    },

    async count(filter): Promise<number> {
      const { storeId, category, q, status } = filter || {};
      const where: Prisma.ProductWhereInput = {
        ...(status ? { status } : {}),
        ...(storeId ? { storeId } : {}),
        ...(category ? { category } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      };
      return prisma.product.count({ where });
    },

    async create(data: Prisma.ProductCreateInput): Promise<Product> {
      try {
        return await prisma.product.create({ data });
      } catch (e) {
        mapAndThrow(e, 'createProduct');
      }
    },

    async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
      try {
        return await prisma.product.update({ where: { id }, data });
      } catch (e) {
        mapAndThrow(e, 'updateProduct');
      }
    },

    async softDelete(id: string): Promise<Product> {
      try {
        return await prisma.product.update({ where: { id }, data: { status: 'inactive' } });
      } catch (e) {
        mapAndThrow(e, 'softDeleteProduct');
      }
    },
  };
}
