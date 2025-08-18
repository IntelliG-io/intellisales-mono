import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './authenticateJWT';
import { authenticateJWT } from './authenticateJWT';

// Backwards-compatible export: requireAuth now delegates to authenticateJWT
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return authenticateJWT(req, res, next);
}
