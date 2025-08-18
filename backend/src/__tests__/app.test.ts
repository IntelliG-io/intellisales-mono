import request from 'supertest';
import app from '../app';

describe('app', () => {
  test('GET /v1/echo?x=1 -> echoes query', async () => {
    const res = await request(app).get('/v1/echo?x=1');
    expect(res.status).toBe(200);
    expect(res.body.method).toBe('GET');
    expect(res.body.query.x).toBe('1');
  });

  test('POST /v1/echo -> echoes body', async () => {
    const res = await request(app).post('/v1/echo').send({ hello: 'world' });
    expect(res.status).toBe(200);
    expect(res.body.method).toBe('POST');
    expect(res.body.body).toEqual({ hello: 'world' });
  });

  test('404 unknown route -> JSON error shape', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(typeof res.body.message).toBe('string');
  });

  test('helmet headers present', async () => {
    const res = await request(app).get('/v1/echo');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  test('CORS preflight responds with configured origin', async () => {
    const res = await request(app)
      .options('/v1/echo')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');
    // We allow '*' by default in dev; header may be '*'
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
