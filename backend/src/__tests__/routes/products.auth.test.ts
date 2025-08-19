import request from 'supertest'
import { Prisma } from '@prisma/client'

// Mock auth to inject a logged-in ADMIN by default
let currentRole: any = 'ADMIN'
jest.mock('../../middleware/auth', () => ({
  __esModule: true,
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: 'u-1', role: currentRole }
    next()
  },
}))

// Keep real requireRoles

// Mock product services used by controllers
const listProducts = jest.fn()
const createProduct = jest.fn()
const updateProduct = jest.fn()
const softDeleteProduct = jest.fn()

jest.mock('../../services/products', () => ({
  __esModule: true,
  listProducts: (...args: any[]) => (listProducts as any)(...args),
  createProduct: (...args: any[]) => (createProduct as any)(...args),
  updateProduct: (...args: any[]) => (updateProduct as any)(...args),
  softDeleteProduct: (...args: any[]) => (softDeleteProduct as any)(...args),
}))

// Import app after mocks
import app from '../../app'
import { HttpError } from '../../middleware/error'

describe('Products routes - authorized', () => {
  beforeEach(() => {
    currentRole = 'ADMIN'
    listProducts.mockReset()
    createProduct.mockReset()
    updateProduct.mockReset()
    softDeleteProduct.mockReset()
  })

  describe('GET /v1/products', () => {
    test('200 returns paginated data', async () => {
      listProducts.mockResolvedValue({ data: [], page: 1, limit: 10, total: 0, totalPages: 1 })
      const res = await request(app).get('/v1/products').query({ q: 'app', page: '1', limit: '10' })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ data: [], page: 1, limit: 10, total: 0, totalPages: 1 })
      expect(listProducts).toHaveBeenCalledWith({ q: 'app', page: 1, limit: 10 })
    })

    test('400 on invalid query (validator)', async () => {
      const res = await request(app).get('/v1/products').query({ q: '' })
      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
      expect(listProducts).not.toHaveBeenCalled()
    })
  })

  describe('POST /v1/products', () => {
    const body = {
      storeId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Apple',
      price: '1.50',
      category: 'Fruit',
      description: 'Fresh',
    }

    test('201 on success (ADMIN/MANAGER)', async () => {
      createProduct.mockResolvedValue({ id: 'p1', ...body, status: 'active' })
      const res = await request(app).post('/v1/products').send(body)
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('p1')
      expect(createProduct).toHaveBeenCalled()
    })

    test('403 when role is CASHIER', async () => {
      currentRole = 'CASHIER'
      const res = await request(app).post('/v1/products').send(body)
      expect(res.status).toBe(403)
      expect(res.body.code).toBe('FORBIDDEN')
    })

    test('400 on invalid body (validator)', async () => {
      const res = await request(app).post('/v1/products').send({})
      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
      expect(createProduct).not.toHaveBeenCalled()
    })

    test('409 when service throws HttpError PRODUCT_EXISTS', async () => {
      createProduct.mockRejectedValueOnce(new HttpError(409, 'PRODUCT_EXISTS', 'dup'))
      const res = await request(app).post('/v1/products').send(body)
      expect(res.status).toBe(409)
      expect(res.body.code).toBe('PRODUCT_EXISTS')
    })

    test('409 when Prisma P2002 is thrown', async () => {
      createProduct.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('dup', { clientVersion: '4.x.x', code: 'P2002' } as any))
      const res = await request(app).post('/v1/products').send(body)
      expect(res.status).toBe(409)
      expect(res.body.code).toBe('PRODUCT_EXISTS')
    })
  })

  describe('PUT /v1/products/:id', () => {
    test('200 on success', async () => {
      updateProduct.mockResolvedValue({ id: 'p1', name: 'New' })
      const res = await request(app).put('/v1/products/p1').send({ name: 'New' })
      expect(res.status).toBe(200)
      expect(res.body.id).toBe('p1')
    })

    test('400 on invalid body', async () => {
      const res = await request(app).put('/v1/products/p1').send({ status: 'deleted' })
      expect(res.status).toBe(400)
      expect(res.body.code).toBe('VALIDATION_ERROR')
      expect(updateProduct).not.toHaveBeenCalled()
    })

    test('404 when service throws PRODUCT_NOT_FOUND', async () => {
      updateProduct.mockRejectedValueOnce(new HttpError(404, 'PRODUCT_NOT_FOUND', 'nf'))
      const res = await request(app).put('/v1/products/p404').send({ name: 'New' })
      expect(res.status).toBe(404)
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND')
    })

    test('409 when Prisma P2002 is thrown', async () => {
      updateProduct.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('dup', { clientVersion: '4.x.x', code: 'P2002' } as any))
      const res = await request(app).put('/v1/products/p1').send({ name: 'New' })
      expect(res.status).toBe(409)
      expect(res.body.code).toBe('PRODUCT_EXISTS')
    })
  })

  describe('DELETE /v1/products/:id', () => {
    test('200 on success', async () => {
      softDeleteProduct.mockResolvedValue({ id: 'p1', status: 'inactive' })
      const res = await request(app).delete('/v1/products/p1')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('inactive')
    })

    test('404 when service throws PRODUCT_NOT_FOUND', async () => {
      softDeleteProduct.mockRejectedValueOnce(new HttpError(404, 'PRODUCT_NOT_FOUND', 'nf'))
      const res = await request(app).delete('/v1/products/p404')
      expect(res.status).toBe(404)
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND')
    })
  })
})
