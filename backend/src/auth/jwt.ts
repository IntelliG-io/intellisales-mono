import jwt, { type SignOptions, type VerifyOptions, type JwtPayload } from 'jsonwebtoken';
import { getJwtConfig, type JwtAlgorithm } from '../config/env';

export type TokenVerifyResult =
  | { valid: true; payload: JwtPayload & { sub?: string } }
  | { valid: false; reason: 'expired' | 'invalid' | 'malformed' };

function normalize(input: string): string {
  return (input ?? '').trim();
}

function signAsync(payload: object, secretOrKey: string, options: SignOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretOrKey, options, (err, token) => {
      if (err || !token) return reject(err ?? new Error('Failed to sign token'));
      resolve(token);
    });
  });
}

function verifyAsync(token: string, key: string, options: VerifyOptions & { algorithms: JwtAlgorithm[] }): Promise<JwtPayload | string> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, options, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as JwtPayload | string);
    });
  });
}

export async function signAccessToken(sub: string, extraClaims: Record<string, unknown> = {}): Promise<string> {
  const cfg = getJwtConfig();
  const payload = { ...extraClaims };
  const options: SignOptions = ({
    algorithm: cfg.algorithm,
    issuer: cfg.issuer,
    audience: cfg.audience,
    subject: normalize(sub),
    expiresIn: cfg.accessTtl,
  } as unknown) as SignOptions;
  return signAsync(payload, cfg.secretOrPrivateKey, options);
}

export async function signRefreshToken(sub: string, extraClaims: Record<string, unknown> = {}): Promise<string> {
  const cfg = getJwtConfig();
  const payload = { ...extraClaims, typ: 'refresh' };
  const options: SignOptions = ({
    algorithm: cfg.algorithm,
    issuer: cfg.issuer,
    audience: cfg.audience,
    subject: normalize(sub),
    expiresIn: cfg.refreshTtl,
  } as unknown) as SignOptions;
  return signAsync(payload, cfg.secretOrPrivateKey, options);
}

export async function verifyToken(token: string): Promise<TokenVerifyResult> {
  const cfg = getJwtConfig();
  try {
    const options: VerifyOptions & { algorithms: JwtAlgorithm[] } = {
      algorithms: ['HS256', 'RS256'],
      issuer: cfg.issuer,
      audience: cfg.audience,
      clockTolerance: cfg.clockToleranceSec,
    };

    const key = cfg.algorithm === 'RS256' ? (cfg.publicKey as string) : cfg.secretOrPrivateKey;
    const decoded = await verifyAsync(token, key, options);
    if (typeof decoded === 'string') {
      // Should not happen for JWT with JSON payload
      return { valid: false, reason: 'malformed' };
    }
    if (!decoded.sub || typeof decoded.sub !== 'string' || decoded.sub.trim().length === 0) {
      return { valid: false, reason: 'invalid' };
    }
    return { valid: true, payload: decoded };
  } catch (err: any) {
    if (err && err.name === 'TokenExpiredError') return { valid: false, reason: 'expired' };
    if (err && err.name === 'JsonWebTokenError') {
      const msg = String(err.message || '').toLowerCase();
      if (msg.includes('malformed')) return { valid: false, reason: 'malformed' };
      return { valid: false, reason: 'invalid' };
    }
    return { valid: false, reason: 'invalid' };
  }
}
