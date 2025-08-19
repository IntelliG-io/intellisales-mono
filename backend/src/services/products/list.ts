import prisma from '../../prisma'

export interface ListParams {
  storeId?: string
  category?: string
  q?: string
  page: number
  limit: number
}

export async function listProducts(params: ListParams) {
  const { storeId, category, q, page, limit } = params
  const where = {
    status: 'active',
    ...(storeId ? { storeId } : {}),
    ...(category ? { category } : {}),
    ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
  }

  const db: any = prisma

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = Math.ceil(total / limit) || 1
  return { data: items, page, limit, total, totalPages }
}
