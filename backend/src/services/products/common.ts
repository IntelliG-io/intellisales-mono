import prisma from '../../prisma'
import { createProductRepository } from '../../repositories/productRepository'
import { HttpError } from '../../middleware/error'

export async function ensureStoreExists(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new HttpError(404, 'STORE_NOT_FOUND', 'Store not found')
}

export async function ensureNameUniqueInStore(storeId: string, name: string, excludeProductId?: string) {
  const repo = createProductRepository(prisma)
  const existing = excludeProductId
    ? await repo.findFirstByNameExcludingId(storeId, name, excludeProductId)
    : await repo.findFirstByName(storeId, name)
  if (existing) throw new HttpError(409, 'PRODUCT_EXISTS', 'Product name already exists in this store')
}

export async function ensureCategoryValidForStore(storeId: string, category: string) {
  // Business rule: category must match existing categories for the store.
  // Allow introducing the first category if none exist yet.
  const repo = createProductRepository(prisma)
  const totalInStore = await repo.count({ storeId })
  if (totalInStore === 0) return
  const found = await repo.findMany({ storeId, category }, { take: 1 })
  if (found.length === 0) throw new HttpError(400, 'CATEGORY_INVALID', 'Category must match an existing category for this store')
}

