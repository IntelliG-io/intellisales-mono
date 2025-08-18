import type { NextFunction, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { getJwtConfig } from '../config/env';
import prisma from '../prisma';
import type { Request } from 'express';
import type { User } from '@prisma/client';

export type AuthenticatedRequest = Request & { user?: User };

function extractBearerToken(req: Request): { token: string | null; malformed: boolean } {
  const header = req.headers.authorization;
  if (!header) return { token: null, malformed: false };
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return { token: null, malformed: true };
  }
  return { token: parts[1], malformed: false };
}

export async function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { token, malformed } = extractBearerToken(req);
  if (!token) {
    if (malformed) {
      res.status(401).json({ status: 401, error: 'Unauthorized', code: 'TOKEN_INVALID', message: 'Invalid or missing authentication token.' });
    } else {
      res.status(401).json({ status: 401, error: 'Unauthorized', code: 'TOKEN_MISSING', message: 'Invalid or missing authentication token.' });
    }
    return;
  }

  const cfg = getJwtConfig();

  try {
    const verifyKey = cfg.algorithm === 'RS256' ? (cfg.publicKey as string) : cfg.secretOrPrivateKey;
    const decoded = jwt.verify(token, verifyKey, {
      algorithms: [cfg.algorithm],
      audience: cfg.audience,
      issuer: cfg.issuer,
      clockTolerance: cfg.clockToleranceSec,
    });

    const payload: JwtPayload = typeof decoded === 'string' ? { sub: decoded } : decoded;
    const userId = payload.sub;
    if (!userId || typeof userId !== 'string') {
      res.status(401).json({ status: 401, error: 'Unauthorized', code: 'TOKEN_INVALID', message: 'Invalid or missing authentication token.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ status: 404, error: 'Not Found', code: 'USER_NOT_FOUND', message: 'User does not exist' });
      return;
    }

    // Optional inactive check if model has this field
    const maybeActive = (user as unknown as { active?: boolean }).active;
    if (maybeActive === false) {
      res.status(403).json({ status: 403, error: 'Forbidden', code: 'USER_INACTIVE', message: 'User account is inactive' });
      return;
    }

    req.user = user;
    next();
  } catch (e: any) {
    if (e && e.name === 'TokenExpiredError') {
      res.status(401).json({ status: 401, error: 'Unauthorized', code: 'TOKEN_INVALID', message: 'Invalid or missing authentication token.' });
      return;
    }
    res.status(401).json({ status: 401, error: 'Unauthorized', code: 'TOKEN_INVALID', message: 'Invalid or missing authentication token.' });
  }
}
