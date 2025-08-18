import type { PrismaClient, User, Prisma } from '@prisma/client';
import { createUserRepository } from '../../repositories/userRepository';
import { DuplicateError } from '../../repositories/errors';

describe('userRepository', () => {
  const makeMock = () => {
    const created: User = {
      id: 'u1',
      tenantId: 't1',
      email: 'a@example.com',
      passwordHash: 'hash',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    const prisma = {
      user: {
        create: jest.fn<Promise<User>, [Prisma.UserCreateArgs]>().mockResolvedValue(created),
        findUnique: jest.fn<Promise<User | null>, [Prisma.UserFindUniqueArgs]>().mockResolvedValue(created),
        findFirst: jest.fn<Promise<User | null>, [Prisma.UserFindFirstArgs]>().mockResolvedValue(created),
      },
    } as unknown as PrismaClient;

    return { prisma, created };
  };

  test('create and retrieve user by id', async () => {
    const { prisma, created } = makeMock();
    const repo = createUserRepository(prisma);

    const data: Prisma.UserCreateInput = {
      email: created.email,
      passwordHash: created.passwordHash,
      role: 'ADMIN',
      tenant: { connect: { id: created.tenantId } },
    };

    const u = await repo.createUser(data);
    expect(u.id).toBe('u1');

    const found = await repo.findUserById('u1');
    expect(found?.email).toBe(created.email);
  });

  test('lookup user by email', async () => {
    const { prisma, created } = makeMock();
    const repo = createUserRepository(prisma);

    const found = await repo.findUserByEmail(created.email);
    expect(found?.id).toBe('u1');
  });

  test('duplicate email → DuplicateError', async () => {
    const { prisma } = makeMock();
    const repo = createUserRepository(prisma);

    (prisma.user.create as any).mockRejectedValueOnce({ name: 'PrismaClientKnownRequestError', code: 'P2002' });

    const data: Prisma.UserCreateInput = {
      email: 'dup@example.com',
      passwordHash: 'hash',
      role: 'ADMIN',
      tenant: { connect: { id: 't1' } },
    };

    await expect(repo.createUser(data)).rejects.toBeInstanceOf(DuplicateError);
  });
});
