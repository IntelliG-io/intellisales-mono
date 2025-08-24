import type { Request, Response } from 'express'
import { verifyToken, signAccessToken, signRefreshToken } from '../../auth'
import prisma from '../../prisma'

export async function handleRefresh(req: Request, res: Response) {
  try {
    const { refreshToken } = (req.body ?? {}) as { refreshToken?: unknown }
    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'refreshToken is required' })
    }

    const verify = await verifyToken(refreshToken)
    if (!verify.valid) {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid or expired refresh token' })
    }

    const payload: any = verify.payload
    if ((payload?.typ ?? '').toLowerCase() !== 'refresh') {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid refresh token type' })
    }

    const userId = payload.sub as string | undefined
    if (!userId) {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid refresh token subject' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User does not exist' })
    }
    const maybeActive = (user as unknown as { active?: boolean }).active
    if (maybeActive === false) {
      return res.status(403).json({ code: 'USER_INACTIVE', message: 'User account is inactive' })
    }

    const newAccess = await signAccessToken(userId)
    const newRefresh = await signRefreshToken(userId)

    return res.status(200).json({ accessToken: newAccess, refreshToken: newRefresh })
  } catch (err) {
    return res.status(500).json({ code: 'SERVER_ERROR', message: 'Unexpected error' })
  }
}
