import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { signAccessToken } from '../../auth/jwt';
import { getJwtConfig } from '../../config/env';

// Mocks for prisma used in middleware and route
const userFindUnique = jest.fn();

jest.mock('../../prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: (...args: any[]) => userFindUnique(...args),
      },
      $disconnect: jest.fn(),
    },
  };
});

beforeEach(() => {
  process.env.JWT_SECRET = 'super-secret-super-secret';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';
  process.env.ACCESS_TOKEN_TTL = '5m';
  process.env.REFRESH_TOKEN_TTL = '7d';
  process.env.JWT_CLOCK_TOLERANCE = '0s';

  userFindUnique.mockReset();
});

async function makeToken(sub: string) {
  return signAccessToken(sub);
}

function makeExpiredToken(sub: string) {
  const cfg = getJwtConfig();
  const payload = { sub, exp: Math.floor(Date.now() / 1000) - 10 };
  return jwt.sign(payload, cfg.secretOrPrivateKey, {
    algorithm: cfg.algorithm,
    issuer: cfg.issuer,
    audience: cfg.audience,
  });
}

describe('GET /api/auth/me', () => {
  test('✅ Valid token, active user → Returns user info with tenant & store', async () => {
    const userId = 'user-1';
    const token = await makeToken(userId);

    // First call (middleware): returns bare user
    userFindUnique.mockResolvedValueOnce({ id: userId, email: 'john@example.com', role: 'ADMIN' });
    // Second call (route): returns with relations
    userFindUnique.mockResolvedValueOnce({
      id: userId,
      email: 'john@example.com',
      role: 'ADMIN',
      tenant: { id: 'tenant-1', name: 'Acme Inc' },
      stores: [
        {
          store: { id: 'store-1', name: 'Main Store' },
        },
      ],
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(userId);
    expect(res.body.user.email).toBe('john@example.com');
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.user.status).toBe('active');
    expect(res.body.user.tenant).toMatchObject({ id: 'tenant-1', name: 'Acme Inc' });
    expect(res.body.user.store).toMatchObject({ id: 'store-1', name: 'Main Store' });
  });

  test('❌ Missing token → 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me').send();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
    expect(['TOKEN_MISSING', 'TOKEN_INVALID']).toContain(res.body.code);
  });

  test('❌ Invalid token → 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .send();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
    expect(res.body.code).toBe('TOKEN_INVALID');
  });

  test('❌ Expired token → 401 Unauthorized', async () => {
    const expired = makeExpiredToken('user-2');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expired}`)
      .send();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
    expect(res.body.code).toBe('TOKEN_INVALID');
  });

  test('❌ Valid token but inactive user → 403 Forbidden', async () => {
    const userId = 'user-3';
    const token = await makeToken(userId);

    // First call: middleware fetch returns inactive
    userFindUnique.mockResolvedValueOnce({ id: userId, email: 'jane@example.com', role: 'MANAGER', active: false });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
    expect(res.body.code).toBe('USER_INACTIVE');
  });
});
