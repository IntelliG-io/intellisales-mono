import prisma from '../../prisma'
import { createUserRepository } from '../../repositories/userRepository'
import { hashPassword } from '../../auth/crypto'
import { signAccessToken, signRefreshToken } from '../../auth/jwt'
import type { UserRegistrationInput } from '../../validators/userValidator'

export interface RegistrationResult {
  user: { id: string; email: string; firstName: string; lastName: string }
  tokens: { accessToken: string; refreshToken: string }
}

export async function registerUser(input: UserRegistrationInput): Promise<RegistrationResult> {
  const repo = createUserRepository(prisma)

  const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!tenant) {
    const err: any = new Error('No tenant configured')
    err.status = 500
    err.code = 'DB_ERROR'
    throw err
  }

  const existing = await repo.findUserByEmail(tenant.id, input.email)
  if (existing) {
    const err: any = new Error('User already exists')
    err.status = 409
    err.code = 'USER_EXISTS'
    throw err
  }

  const passwordHash = await hashPassword(input.password)

  const user = await repo.createUser({
    email: input.email,
    passwordHash,
    tenant: { connect: { id: tenant.id } },
  })

  const accessToken = await signAccessToken(user.id)
  const refreshToken = await signRefreshToken(user.id)

  return {
    user: { id: user.id, email: user.email, firstName: input.firstName, lastName: input.lastName },
    tokens: { accessToken, refreshToken },
  }
}
