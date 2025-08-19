import prisma from '../../prisma'
import { createProductRepository } from '../../repositories/productRepository'
import { HttpError } from '../../middleware/error'

export async function softDeleteProduct(id: string) {
  const repo = createProductRepository(prisma)
  const existing = await repo.findById(id)
  if (!existing) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found')

  if (existing.status === 'inactive') return existing

  const updated = await repo.softDelete(id)
  return updated
}
