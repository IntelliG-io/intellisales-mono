import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { getJwtConfig } from '../../config/env';

// Mock prisma singleton used by service/repository
const tenantFindFirst = jest.fn();
const userFindFirst = jest.fn();

jest.mock('../../prisma', () => {
  return {
    __esModule: true,
    default: {
      tenant: { findFirst: (...args: any[]) => tenantFindFirst(...args) },
      user: {
        findFirst: (...args: any[]) => userFindFirst(...args),
      },
      $disconnect: jest.fn(),
    },
  };
});

beforeEach(() => {
  process.env.JWT_SECRET = 'change-me-change';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';
  process.env.ACCESS_TOKEN_TTL = '15m';
  process.env.REFRESH_TOKEN_TTL = '7d';
  process.env.JWT_CLOCK_TOLERANCE = '0s';
  process.env.BCRYPT_SALT_ROUNDS = '10';

  tenantFindFirst.mockReset();
  userFindFirst.mockReset();
});

async function makeHash(pw: string) {
  const rounds = 10;
  return bcrypt.hash(pw, rounds);
}

describe('POST /v1/auth/login', () => {
  test('Valid login returns 200 with tokens', async () => {
    tenantFindFirst.mockResolvedValue({ id: 'tenant-1' });
    const hash = await makeHash('Aa1!aaaa');
    userFindFirst.mockResolvedValue({ id: 'user-1', email: 'john.doe@example.com', passwordHash: hash });

    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'John.Doe@example.com', password: 'Aa1!aaaa' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 'user-1', email: 'john.doe@example.com' });
    expect(typeof res.body.tokens.accessToken).toBe('string');
    expect(typeof res.body.tokens.refreshToken).toBe('string');

    const cfg = getJwtConfig();
    const accessPayload = jwt.verify(res.body.tokens.accessToken, cfg.secretOrPrivateKey, {
      algorithms: ['HS256', 'RS256'],
      issuer: cfg.issuer,
      audience: cfg.audience,
    }) as jwt.JwtPayload;
    expect(accessPayload.sub).toBe('user-1');

    const refreshPayload = jwt.verify(res.body.tokens.refreshToken, cfg.secretOrPrivateKey, {
      algorithms: ['HS256', 'RS256'],
      issuer: cfg.issuer,
      audience: cfg.audience,
    }) as jwt.JwtPayload;
    expect(refreshPayload.sub).toBe('user-1');
  });

  test('Incorrect password returns 401 INVALID_CREDENTIALS', async () => {
    tenantFindFirst.mockResolvedValue({ id: 'tenant-1' });
    const hash = await makeHash('Aa1!aaaa');
    userFindFirst.mockResolvedValue({ id: 'user-1', email: 'john.doe@example.com', passwordHash: hash });

    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'john.doe@example.com', password: 'Wrong1!x' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  test('Non-existent email returns 401 INVALID_CREDENTIALS', async () => {
    tenantFindFirst.mockResolvedValue({ id: 'tenant-1' });
    userFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'nouser@example.com', password: 'Aa1!aaaa' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  test('Inactive user returns 403 USER_INACTIVE', async () => {
    tenantFindFirst.mockResolvedValue({ id: 'tenant-1' });
    const hash = await makeHash('Aa1!aaaa');
    userFindFirst.mockResolvedValue({ id: 'user-1', email: 'john.doe@example.com', passwordHash: hash, active: false });

    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'john.doe@example.com', password: 'Aa1!aaaa' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('USER_INACTIVE');
  });

  test('Missing email/password returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
