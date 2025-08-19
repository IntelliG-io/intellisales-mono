import prisma from '../../prisma'
import { HttpError } from '../../middleware/error'

export async function ensureStoreExists(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new HttpError(404, 'STORE_NOT_FOUND', 'Store not found')
}

export async function ensureNameUniqueInStore(storeId: string, name: string, excludeProductId?: string) {
  const existing = await (prisma as any).product.findFirst({
    where: {
      storeId,
      name,
      ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
    },
    select: { id: true },
  })
  if (existing) throw new HttpError(409, 'PRODUCT_EXISTS', 'Product name already exists in this store')
}

export async function ensureCategoryValidForStore(storeId: string, category: string) {
  // Business rule: category must match existing categories for the store.
  // Allow introducing the first category if none exist yet.
  const categories = await (prisma as any).product.findMany({
    where: { storeId },
    select: { category: true },
    distinct: ['category'],
    take: 1,
  })
  if (categories.length === 0) return
  const found = await (prisma as any).product.findFirst({ where: { storeId, category } })
  if (!found) throw new HttpError(400, 'CATEGORY_INVALID', 'Category must match an existing category for this store')
}
