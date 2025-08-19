import prisma from '../../prisma'
import { HttpError } from '../../middleware/error'

export async function softDeleteProduct(id: string) {
  const existing = await (prisma as any).product.findUnique({ where: { id } })
  if (!existing) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found')

  if (existing.status === 'inactive') return existing

  const updated = await (prisma as any).product.update({ where: { id }, data: { status: 'inactive' } })
  return updated
}
