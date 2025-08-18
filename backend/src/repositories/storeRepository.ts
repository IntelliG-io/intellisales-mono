import type { Prisma, PrismaClient, Store } from '@prisma/client';
import { DuplicateError, DatabaseError, NotFoundError } from './errors';

export interface StoreRepository {
  findStoresByTenant(tenantId: string): Promise<Store[]>;
  findStoreById(tenantId: string, storeId: string): Promise<Store | null>;
  createStore(tenantId: string, data: Prisma.StoreCreateInput): Promise<Store>;
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

export function createStoreRepository(prisma: PrismaClient): StoreRepository {
  return {
    async findStoresByTenant(tenantId: string): Promise<Store[]> {
      return prisma.store.findMany({ where: { tenantId } });
    },

    async findStoreById(tenantId: string, storeId: string): Promise<Store | null> {
      const store = await prisma.store.findFirst({ where: { id: storeId, tenantId } });
      if (!store) throw new NotFoundError('Store not found');
      return store;
    },

    async createStore(tenantId: string, data: Prisma.StoreCreateInput): Promise<Store> {
      try {
        // Ensure tenant scoping via relation connect; override any incoming tenant relation
        const payload: Prisma.StoreCreateInput = {
          ...data,
          tenant: { connect: { id: tenantId } },
        };
        return await prisma.store.create({ data: payload });
      } catch (e) {
        mapAndThrow(e, 'createStore');
      }
    },
  };
}
