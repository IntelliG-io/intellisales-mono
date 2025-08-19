import { Prisma } from '@prisma/client'
import prisma from '../../prisma'
import { HttpError } from '../../middleware/error'
import { ensureNameUniqueInStore, ensureCategoryValidForStore } from './common'

export interface UpdateInput {
  name?: string
  description?: string
  price?: string
  category?: string
  status?: 'active' | 'inactive'
}

export async function updateProduct(id: string, input: UpdateInput) {
  const existing = await (prisma as any).product.findUnique({ where: { id } })
  if (!existing) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found')

  if (input.name && input.name !== existing.name) {
    await ensureNameUniqueInStore(existing.storeId, input.name, id)
  }
  if (input.category) {
    await ensureCategoryValidForStore(existing.storeId, input.category)
  }

  const updated = await (prisma as any).product.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description ?? null } : {}),
      ...(input.price ? { price: new Prisma.Decimal(input.price) } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
  })
  return updated
}
