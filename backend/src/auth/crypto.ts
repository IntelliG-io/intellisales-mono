import bcrypt from 'bcrypt';
import { getBcryptSaltRounds, InvalidArgumentError } from '../config/env';

export interface HashOptions {
  pepper?: string;
}

function normalize(input: string): string {
  return (input ?? '').trim();
}

export async function hashPassword(plain: string, opts: HashOptions = {}): Promise<string> {
  const normalized = normalize(plain);
  if (normalized.length < 8) {
    throw new InvalidArgumentError('Password must be at least 8 characters.');
  }
  const withPepper = opts.pepper ? normalized + opts.pepper : normalized;
  const rounds = getBcryptSaltRounds();
  return bcrypt.hash(withPepper, rounds);
}

export async function verifyPassword(plain: string, hash: string, opts: HashOptions = {}): Promise<boolean> {
  try {
    const normalized = normalize(plain);
    const withPepper = opts.pepper ? normalized + opts.pepper : normalized;
    return await bcrypt.compare(withPepper, hash);
  } catch {
    return false;
  }
}
