import request from 'supertest'
import app from '../../app'

describe('Products routes - unauthorized access', () => {
  test('GET /v1/products without token returns 401 TOKEN_MISSING', async () => {
    const res = await request(app).get('/v1/products')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('TOKEN_MISSING')
  })

  test('POST /v1/products without token returns 401 TOKEN_MISSING', async () => {
    const res = await request(app)
      .post('/v1/products')
      .send({})
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('TOKEN_MISSING')
  })

  test('PUT /v1/products/:id without token returns 401 TOKEN_MISSING', async () => {
    const res = await request(app)
      .put('/v1/products/prod_123')
      .send({})
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('TOKEN_MISSING')
  })

  test('DELETE /v1/products/:id without token returns 401 TOKEN_MISSING', async () => {
    const res = await request(app)
      .delete('/v1/products/prod_123')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('TOKEN_MISSING')
  })
})
