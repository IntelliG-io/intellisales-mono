import { hashPassword, verifyPassword } from '../auth/crypto';
import { signAccessToken, signRefreshToken, verifyToken } from '../auth/jwt';
import { ConfigurationError } from '../config/env';
import { generateKeyPairSync } from 'crypto';

// Helper to sleep
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('Password hashing utilities', () => {
  beforeEach(() => {
    process.env.BCRYPT_SALT_ROUNDS = '10';
  });

  test('hash/verify roundtrip without pepper', async () => {
    const pwd = 'supersecret';
    const hash = await hashPassword(pwd);
    expect(hash).toMatch(/\$2[aby]\$/);
    const ok = await verifyPassword(pwd, hash);
    expect(ok).toBe(true);
  });

  test('hash/verify roundtrip with pepper', async () => {
    const pwd = 'supersecret';
    const pepper = 'my-pepper';
    const hash = await hashPassword(pwd, { pepper });
    const ok = await verifyPassword(pwd, hash, { pepper });
    expect(ok).toBe(true);
    const bad = await verifyPassword(pwd, hash, { pepper: 'wrong' });
    expect(bad).toBe(false);
  });

  test('verifyPassword false on wrong password', async () => {
    const hash = await hashPassword('correcthorsebatterystaple');
    const ok = await verifyPassword('wrong-password', hash);
    expect(ok).toBe(false);
  });

  test('verifyPassword false on corrupted hash', async () => {
    const hash = await hashPassword('anothersecret');
    const corrupted = hash.slice(0, -3) + 'abc';
    const ok = await verifyPassword('anothersecret', corrupted);
    expect(ok).toBe(false);
  });

  test('hashPassword throws on short password', async () => {
    await expect(hashPassword('short')).rejects.toThrowError();
  });
});

describe('JWT utilities', () => {
  beforeEach(() => {
    // Reset to HS256 by default
    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;
    process.env.JWT_SECRET = 'change-me-change';
    process.env.JWT_ISSUER = 'your-app';
    process.env.JWT_AUDIENCE = 'your-app-clients';
    process.env.ACCESS_TOKEN_TTL = '15m';
    process.env.REFRESH_TOKEN_TTL = '7d';
    process.env.JWT_CLOCK_TOLERANCE = '0s';
  });

  test('HS256 with JWT_SECRET', async () => {
    const access = await signAccessToken('user-123', { role: 'admin' });
    const verified = await verifyToken(access);
    expect(verified.valid).toBe(true);
    if (verified.valid) {
      expect(verified.payload.sub).toBe('user-123');
      expect(verified.payload.iss).toBe('your-app');
      expect(verified.payload.aud).toBe('your-app-clients');
    }
  });

  test('RS256 with PEM keys', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    process.env.JWT_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    delete process.env.JWT_SECRET;

    const token = await signAccessToken('user-456');
    const res = await verifyToken(token);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.payload.sub).toBe('user-456');
    }
  });

  test('expired token → reason: expired', async () => {
    process.env.ACCESS_TOKEN_TTL = '1s';
    const token = await signAccessToken('user-789');
    await sleep(1200);
    const res = await verifyToken(token);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reason).toBe('expired');
  });

  test('aud/iss mismatch → reason: invalid', async () => {
    // Sign with current env
    const token = await signAccessToken('user-xyz');
    // Verify with different audience
    process.env.JWT_AUDIENCE = 'another-audience';
    const res = await verifyToken(token);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reason).toBe('invalid');
  });

  test('throws ConfigurationError when secrets missing', async () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;
    await expect(signAccessToken('user-1')).rejects.toThrow(ConfigurationError);
  });
});
