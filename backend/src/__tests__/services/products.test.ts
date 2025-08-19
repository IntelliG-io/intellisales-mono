import { Prisma } from '@prisma/client'
import { createProduct, updateProduct, softDeleteProduct, listProducts } from '../../services/products'
import { HttpError } from '../../middleware/error'

// Mocks for validation helpers
const ensureStoreExists = jest.fn()
const ensureNameUniqueInStore = jest.fn()
const ensureCategoryValidForStore = jest.fn()

jest.mock('../../services/products/common', () => ({
  __esModule: true,
  ensureStoreExists: (...args: any[]) => (ensureStoreExists as any)(...args),
  ensureNameUniqueInStore: (...args: any[]) => (ensureNameUniqueInStore as any)(...args),
  ensureCategoryValidForStore: (...args: any[]) => (ensureCategoryValidForStore as any)(...args),
}))

// Mock repository factory
const repo = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  count: jest.fn(),
  findMany: jest.fn(),
}

const createProductRepository = jest.fn(() => repo)
jest.mock('../../repositories/productRepository', () => ({
  __esModule: true,
  createProductRepository: (...args: any[]) => (createProductRepository as any)(...args),
}))

describe('product services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createProduct', () => {
    test('happy path calls validations and repo.create with Decimal price', async () => {
      const input = { storeId: 's1', name: 'Apple', price: '1.50', category: 'Fruit', description: 'Fresh' }
      const created = { id: 'p1', ...input, description: 'Fresh', status: 'active' }
      repo.create.mockResolvedValue(created)

      const res = await createProduct(input as any)

      expect(ensureStoreExists).toHaveBeenCalledWith('s1')
      expect(ensureNameUniqueInStore).toHaveBeenCalledWith('s1', 'Apple')
      expect(ensureCategoryValidForStore).toHaveBeenCalledWith('s1', 'Fruit')
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Apple',
          description: 'Fresh',
          price: expect.any(Prisma.Decimal),
          category: 'Fruit',
          store: { connect: { id: 's1' } },
        })
      )
      expect(res).toBe(created)
    })

    test('name not unique -> bubbles HttpError 409', async () => {
      ensureNameUniqueInStore.mockRejectedValueOnce(new HttpError(409, 'PRODUCT_EXISTS', 'dup'))
      await expect(
        createProduct({ storeId: 's1', name: 'Apple', price: '1.00', category: 'Fruit' } as any)
      ).rejects.toHaveProperty('code', 'PRODUCT_EXISTS')
      expect(repo.create).not.toHaveBeenCalled()
    })
  })

  describe('updateProduct', () => {
    test('not found -> throws HttpError 404', async () => {
      repo.findById.mockResolvedValue(null)
      await expect(updateProduct('p404', { name: 'X' })).rejects.toHaveProperty('code', 'PRODUCT_NOT_FOUND')
    })

    test('name/category validations and repo.update with Decimal conversion', async () => {
      repo.findById.mockResolvedValue({ id: 'p1', storeId: 's1', name: 'Old', category: 'Fruit', status: 'active' })
      const updated = { id: 'p1', storeId: 's1', name: 'New', category: 'Veg', status: 'active' }
      repo.update.mockResolvedValue(updated)

      const res = await updateProduct('p1', { name: 'New', price: '9.99', category: 'Veg', description: null as any })

      expect(ensureNameUniqueInStore).toHaveBeenCalledWith('s1', 'New', 'p1')
      expect(ensureCategoryValidForStore).toHaveBeenCalledWith('s1', 'Veg')
      expect(repo.update).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ name: 'New', price: expect.any(Prisma.Decimal), category: 'Veg', description: null })
      )
      expect(res).toBe(updated)
    })
  })

  describe('softDeleteProduct', () => {
    test('not found -> throws 404', async () => {
      repo.findById.mockResolvedValue(null)
      await expect(softDeleteProduct('p404')).rejects.toHaveProperty('code', 'PRODUCT_NOT_FOUND')
    })

    test('already inactive -> returns as-is', async () => {
      const existing = { id: 'p2', status: 'inactive' }
      repo.findById.mockResolvedValue(existing)
      const res = await softDeleteProduct('p2')
      expect(repo.softDelete).not.toHaveBeenCalled()
      expect(res).toBe(existing as any)
    })

    test('active -> repo.softDelete called', async () => {
      const existing = { id: 'p3', status: 'active' }
      const after = { ...existing, status: 'inactive' }
      repo.findById.mockResolvedValue(existing)
      repo.softDelete.mockResolvedValue(after)
      const res = await softDeleteProduct('p3')
      expect(repo.softDelete).toHaveBeenCalledWith('p3')
      expect(res).toBe(after as any)
    })
  })

  describe('listProducts', () => {
    test('returns pagination data and filters by active', async () => {
      repo.count.mockResolvedValue(0)
      repo.findMany.mockResolvedValue([])
      const out = await listProducts({ page: 1, limit: 10, q: 'app' })
      expect(repo.count).toHaveBeenCalledWith({ status: 'active', storeId: undefined, category: undefined, q: 'app' })
      expect(repo.findMany).toHaveBeenCalledWith(
        { status: 'active', storeId: undefined, category: undefined, q: 'app' },
        expect.objectContaining({ orderBy: { createdAt: 'desc' }, skip: 0, take: 10 })
      )
      expect(out).toEqual({ data: [], page: 1, limit: 10, total: 0, totalPages: 1 })
    })
  })
})
