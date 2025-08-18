import request from 'supertest';
import app from '../app';

describe('health endpoints', () => {
  it('GET /health returns ok with uptime and timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('number');
  });

  it('GET /ready returns ok', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
