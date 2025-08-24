import prisma from '../../prisma'
import { createProductRepository } from '../../repositories/productRepository'

export interface ListParams {
  storeId?: string
  category?: string
  q?: string
  page: number
  limit: number
}

export async function listProducts(params: ListParams) {
  const { storeId, category, q, page, limit } = params
  const repo = createProductRepository(prisma)

  const filter = { status: 'active' as const, storeId, category, q }
  const [total, items] = await Promise.all([
    repo.count(filter),
    repo.findMany(filter, {
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.ceil(total / limit) || 1
  return { data: items, page, limit, total, totalPages }
}
