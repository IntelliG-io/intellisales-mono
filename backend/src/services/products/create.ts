import { Prisma } from '@prisma/client'
import prisma from '../../prisma'
import { ensureStoreExists, ensureNameUniqueInStore, ensureCategoryValidForStore } from './common'

export interface CreateInput {
  storeId: string
  name: string
  description?: string
  price: string // normalized decimal string
  category: string
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
