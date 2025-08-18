import request from 'supertest';
import app from '../../app';

// Mock prisma singleton used by service/repository
const tenantFindFirst = jest.fn();
const userFindFirst = jest.fn();
const userCreate = jest.fn();

jest.mock('../../prisma', () => {
  return {
    __esModule: true,
    default: {
      tenant: { findFirst: (...args: any[]) => tenantFindFirst(...args) },
      user: {
        findFirst: (...args: any[]) => userFindFirst(...args),
        create: (...args: any[]) => userCreate(...args),
      },
      $disconnect: jest.fn(),
    },
  };
});

// Set JWT envs for token signing
beforeEach(() => {
  process.env.JWT_SECRET = 'change-me-change';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';
  process.env.ACCESS_TOKEN_TTL = '15m';
  process.env.REFRESH_TOKEN_TTL = '7d';
  process.env.JWT_CLOCK_TOLERANCE = '0s';

  tenantFindFirst.mockReset();
  userFindFirst.mockReset();
  userCreate.mockReset();
});

describe('POST /v1/auth/register', () => {
  test('creates user and returns tokens (201)', async () => {
    tenantFindFirst.mockResolvedValue({ id: 'tenant-1' });
    userFindFirst.mockResolvedValue(null);
    userCreate.mockResolvedValue({ id: 'user-1', email: 'john.doe@example.com' });

    const res = await request(app)
      .post('/v1/auth/register')
      .send({
        email: 'John.Doe@example.com',
        password: 'Aa1!aaaa',
        firstName: 'John',
        lastName: 'Doe',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ id: 'user-1', email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe' });
    expect(typeof res.body.tokens.accessToken).toBe('string');
    expect(typeof res.body.tokens.refreshToken).toBe('string');

    // Ensure tenant-scoped duplicate check and create were called
    expect(tenantFindFirst).toHaveBeenCalled();
    expect(userFindFirst).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1', email: 'john.doe@example.com' } });
    expect(userCreate).toHaveBeenCalled();
  });

  test('400 on validation error', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short', firstName: 'A', lastName: '' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.details).toBeDefined();
  });

  test('409 when user already exists', async () => {
    tenantFindFirst.mockResolvedValue({ id: 'tenant-1' });
    userFindFirst.mockResolvedValue({ id: 'existing', email: 'john@x.com' });

    const res = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'john@x.com', password: 'Aa1!aaaa', firstName: 'John', lastName: 'Doe' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('USER_EXISTS');
  });

  test('500 when no tenant configured', async () => {
    tenantFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'john@x.com', password: 'Aa1!aaaa', firstName: 'John', lastName: 'Doe' });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('DB_ERROR');
  });
});
