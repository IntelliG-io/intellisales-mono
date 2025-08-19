import prisma from '../../prisma'
import { createUserRepository } from '../../repositories/userRepository'
import { verifyPassword } from '../../auth/crypto'
import { signAccessToken, signRefreshToken } from '../../auth/jwt'
import type { UserLoginInput } from '../../validators/userValidator'

export interface LoginResult {
  user: { id: string; email: string }
  tokens: { accessToken: string; refreshToken: string }
}

export async function loginUser(input: UserLoginInput): Promise<LoginResult> {
  const repo = createUserRepository(prisma)

  const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!tenant) {
    const err: any = new Error('No tenant configured')
    err.status = 500
    err.code = 'DB_ERROR'
    throw err
  }

  const user = await repo.findUserByEmail(tenant.id, input.email)
  if (!user) {
    const err: any = new Error('Email or password incorrect')
    err.status = 401
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }

  if (Object.prototype.hasOwnProperty.call(user as any, 'active') && !(user as any).active) {
    const err: any = new Error('User account is inactive')
    err.status = 403
    err.code = 'USER_INACTIVE'
    throw err
  }

  const ok = await verifyPassword(input.password, user.passwordHash)
  if (!ok) {
    const err: any = new Error('Email or password incorrect')
    err.status = 401
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }

  const accessToken = await signAccessToken(user.id)
  const refreshToken = await signRefreshToken(user.id)

  return {
    user: { id: user.id, email: user.email },
    tokens: { accessToken, refreshToken },
  }
}
