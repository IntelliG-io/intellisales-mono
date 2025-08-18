/* eslint-disable @typescript-eslint/no-explicit-any */
// Centralized environment parsing and typed errors

export class InvalidArgumentError extends Error {
  name = 'InvalidArgumentError' as const;
}

export class ConfigurationError extends Error {
  name = 'ConfigurationError' as const;
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

// Parse duration strings like "15m", "7d", "5s" into seconds
export function parseDuration(input: string | undefined, fallback: string): string {
  // We keep string form for jsonwebtoken's expiresIn, but validate format
  const v = (input ?? fallback).trim();
  if (!/^\d+\s*[smhd]$/.test(v)) {
    // Normalize common variants like '5 s'
    throw new ConfigurationError(`Invalid duration format: ${v}. Expected e.g. 15m, 7d, 5s, 1h`);
  }
  return v.replace(/\s+/g, '') as string;
}

export function parseClockToleranceSeconds(input: string | undefined, fallback: string): number {
  const v = (input ?? fallback).trim();
  const m = v.match(/^(\d+)\s*([smhd])$/);
  if (!m) throw new ConfigurationError(`Invalid clock tolerance: ${v}`);
  const n = Number.parseInt(m[1], 10);
  const unit = m[2];
  switch (unit) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 86400;
    default:
      throw new ConfigurationError(`Unsupported unit in clock tolerance: ${unit}`);
  }
}

export type JwtAlgorithm = 'HS256' | 'RS256';

export interface JwtEnvConfig {
  issuer: string;
  audience: string;
  accessTtl: string; // jsonwebtoken supports string durations
  refreshTtl: string;
  clockToleranceSec: number;
  algorithm: JwtAlgorithm;
  secretOrPrivateKey: string; // HS256 secret or RS256 private key
  publicKey?: string; // RS256 public key
}

function looksLikePem(key: string, type: 'PUBLIC' | 'PRIVATE') {
  const header = type === 'PRIVATE' ? '-----BEGIN' : '-----BEGIN';
  return key.includes(`${header} `) && key.includes('KEY-----');
}

export function getBcryptSaltRounds(): number {
  const raw = parseIntSafe(process.env.BCRYPT_SALT_ROUNDS);
  const rounds = clamp(raw ?? 12, 10, 14);
  return rounds;
}

export function getJwtConfig(): JwtEnvConfig {
  const issuer = (process.env.JWT_ISSUER ?? 'your-app').trim();
  const audience = (process.env.JWT_AUDIENCE ?? 'your-app-clients').trim();
  const accessTtl = parseDuration(process.env.ACCESS_TOKEN_TTL, '15m');
  const refreshTtl = parseDuration(process.env.REFRESH_TOKEN_TTL, '7d');
  const clockToleranceSec = parseClockToleranceSeconds(process.env.JWT_CLOCK_TOLERANCE, '5s');

  const hasRS = !!process.env.JWT_PRIVATE_KEY && !!process.env.JWT_PUBLIC_KEY;
  const hasHS = !!process.env.JWT_SECRET;

  let algorithm: JwtAlgorithm;
  let secretOrPrivateKey: string;
  let publicKey: string | undefined;

  if (hasRS) {
    algorithm = 'RS256';
    secretOrPrivateKey = String(process.env.JWT_PRIVATE_KEY);
    publicKey = String(process.env.JWT_PUBLIC_KEY);
    if (!looksLikePem(secretOrPrivateKey, 'PRIVATE') || !looksLikePem(publicKey, 'PUBLIC')) {
      throw new ConfigurationError('Invalid RS256 keys: ensure PEM-formatted JWT_PRIVATE_KEY and JWT_PUBLIC_KEY');
    }
  } else if (hasHS) {
    algorithm = 'HS256';
    secretOrPrivateKey = String(process.env.JWT_SECRET);
    if (secretOrPrivateKey.trim().length < 16) {
      throw new ConfigurationError('JWT_SECRET is too short; use at least 16 characters');
    }
  } else {
    throw new ConfigurationError('No JWT secrets configured. Set JWT_SECRET for HS256 or JWT_PRIVATE_KEY/JWT_PUBLIC_KEY for RS256.');
  }

  return { issuer, audience, accessTtl, refreshTtl, clockToleranceSec, algorithm, secretOrPrivateKey, publicKey };
}

export interface ServerEnvConfig {
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  LOG_LEVEL: string;
  CORS_ORIGIN: string;
  CORS_METHODS: string;
  CORS_CREDENTIALS: boolean;
  JSON_BODY_LIMIT: string;
  TRUST_PROXY: boolean;
  isProd: boolean;
  isDev: boolean;
}

export function getServerEnv(): ServerEnvConfig {
  const NODE_ENV = (process.env.NODE_ENV || 'development').trim();
  const isProd = NODE_ENV === 'production';
  const isDev = !isProd;
  const PORT = Number.parseInt(process.env.PORT || process.env.BACKEND_PORT || '3000', 10) || 3000;
  const HOST = (process.env.HOST || '0.0.0.0').trim();
  const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').trim();
  const CORS_ORIGIN = (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '*').trim();
  const CORS_METHODS = (process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS').trim();
  const CORS_CREDENTIALS = String(process.env.CORS_CREDENTIALS || 'false').toLowerCase() === 'true';
  const JSON_BODY_LIMIT = (process.env.JSON_BODY_LIMIT || '1mb').trim();
  const TRUST_PROXY = String(process.env.TRUST_PROXY || 'false').toLowerCase() === 'true';

  return { NODE_ENV, PORT, HOST, LOG_LEVEL, CORS_ORIGIN, CORS_METHODS, CORS_CREDENTIALS, JSON_BODY_LIMIT, TRUST_PROXY, isProd, isDev };
}
