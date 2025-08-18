import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticateJWT, type AuthenticatedRequest } from '../../middleware/authenticateJWT';
import prisma from '../../prisma';

jest.mock('../../prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as { user: { findUnique: jest.Mock } };

function buildApp() {
  const app = express();
  app.get('/protected', authenticateJWT, (req: AuthenticatedRequest, res) => {
    res.json({ ok: true, userId: req.user?.id });
  });
  return app;
}

describe('authenticateJWT middleware', () => {
  const SECRET = 'this_is_a_long_enough_secret_123';
  const ISSUER = 'your-app';
  const AUDIENCE = 'your-app-clients';

  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
    process.env.JWT_ISSUER = ISSUER;
    process.env.JWT_AUDIENCE = AUDIENCE;
    process.env.JWT_CLOCK_TOLERANCE = '5s';
  });

  beforeEach(() => {
    mockedPrisma.user.findUnique.mockReset();
    jest.restoreAllMocks();
  });

  test('No Authorization header -> 401 TOKEN_MISSING', async () => {
    const app = buildApp();
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ code: 'TOKEN_MISSING' });
  });

  test('Malformed header -> 401 TOKEN_INVALID', async () => {
    const app = buildApp();
    const res = await request(app).get('/protected').set('Authorization', 'Bearer');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ code: 'TOKEN_INVALID' });
  });

  test('Expired token -> 401 TOKEN_INVALID', async () => {
    const app = buildApp();
    // Force jsonwebtoken.verify to throw TokenExpiredError
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      // @ts-ignore TokenExpiredError constructor typing
      throw new jwt.TokenExpiredError('jwt expired', new Date());
    });
    const res = await request(app).get('/protected').set('Authorization', 'Bearer expired.token.here');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ code: 'TOKEN_INVALID' });
  });

  test('Valid token but user not found -> 404 USER_NOT_FOUND', async () => {
    const app = buildApp();
    const token = jwt.sign({ sub: 'u-404' }, SECRET, { algorithm: 'HS256', issuer: ISSUER, audience: AUDIENCE, expiresIn: '15m' });
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-404' } });
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'USER_NOT_FOUND' });
  });

  test('Valid token but inactive user -> 403 USER_INACTIVE', async () => {
    const app = buildApp();
    const token = jwt.sign({ sub: 'u-inactive' }, SECRET, { algorithm: 'HS256', issuer: ISSUER, audience: AUDIENCE, expiresIn: '15m' });
    // Return a user object with active: false (cast to any to simulate field)
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 'u-inactive', active: false } as any);
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ code: 'USER_INACTIVE' });
  });

  test('Valid token with active user -> next() called and req.user populated', async () => {
    const app = buildApp();
    const token = jwt.sign({ sub: 'u-1' }, SECRET, { algorithm: 'HS256', issuer: ISSUER, audience: AUDIENCE, expiresIn: '15m' });
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 'u-1' } as any);
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, userId: 'u-1' });
  });
});
