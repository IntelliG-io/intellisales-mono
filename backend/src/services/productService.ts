import { Prisma } from '@prisma/client'
import prisma from '../prisma'
import { HttpError } from '../middleware/error'

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
    status: 'active', // list only active by default
    ...(storeId ? { storeId } : {}),
    ...(category ? { category } : {}),
    ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
  }

  // Cast prisma to any to avoid transient type errors if Prisma Client types are stale locally
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

export interface CreateInput {
  storeId: string
  name: string
  description?: string
  price: string // normalized decimal string
  category: string
}

async function ensureStoreExists(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new HttpError(404, 'STORE_NOT_FOUND', 'Store not found')
}

async function ensureNameUniqueInStore(storeId: string, name: string, excludeProductId?: string) {
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

async function ensureCategoryValidForStore(storeId: string, category: string) {
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

export async function createProduct(input: CreateInput) {
  await ensureStoreExists(input.storeId)
  await ensureNameUniqueInStore(input.storeId, input.name)
  await ensureCategoryValidForStore(input.storeId, input.category)

  const created = await (prisma as any).product.create({
    data: {
      storeId: input.storeId,
      name: input.name,
      description: input.description ?? null,
      price: new Prisma.Decimal(input.price),
      category: input.category,
    },
  })
  return created
}

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

export async function softDeleteProduct(id: string) {
  const existing = await (prisma as any).product.findUnique({ where: { id } })
  if (!existing) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found')

  if (existing.status === 'inactive') return existing

  const updated = await (prisma as any).product.update({ where: { id }, data: { status: 'inactive' } })
  return updated
}
