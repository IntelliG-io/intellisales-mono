import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from './authenticateJWT'
import type { Role } from '@prisma/client'

export function requireRoles(...allowed: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      return res.status(401).json({ status: 401, error: 'Unauthorized', code: 'TOKEN_MISSING', message: 'Invalid or missing authentication token.' })
    }
    if (!allowed.includes(user.role)) {
      return res.status(403).json({ status: 403, error: 'Forbidden', code: 'FORBIDDEN', message: 'Insufficient permissions' })
    }
    next()
  }
}
