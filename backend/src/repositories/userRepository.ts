import type { Prisma, PrismaClient, User } from '@prisma/client';
import { DuplicateError, DatabaseError } from './errors';

export interface UserRepository {
  findUserByEmail(tenantId: string, email: string): Promise<User | null>;
  createUser(data: Prisma.UserCreateInput): Promise<User>;
  findUserById(id: string): Promise<User | null>;
}

function isPrismaKnownError(e: unknown): e is { code?: string; name?: string } {
  return !!e && typeof e === 'object' && 'name' in e;
}

function mapAndThrow(e: unknown, action: string): never {
  if (isPrismaKnownError(e) && (e as any).code === 'P2002') {
    throw new DuplicateError(`Duplicate constraint on ${action}`);
  }
  throw new DatabaseError(`${action} failed`);
}

export function createUserRepository(prisma: PrismaClient): UserRepository {
  return {
    async findUserByEmail(tenantId: string, email: string): Promise<User | null> {
      return prisma.user.findFirst({ where: { tenantId, email } });
    },

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
      try {
        return await prisma.user.create({ data });
      } catch (e) {
        mapAndThrow(e, 'createUser');
      }
    },

    async findUserById(id: string): Promise<User | null> {
      return prisma.user.findUnique({ where: { id } });
    },
  };
}
