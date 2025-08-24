import { z } from 'zod'

// Common constraints
const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(255, 'Name must be at most 255 characters')

const descriptionSchema = z.string().trim().optional()

const priceSchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'number' ? v.toString() : v))
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), {
    message: 'Price must be a positive decimal with up to 2 decimal places',
  })
  .refine((v) => parseFloat(v) > 0, { message: 'Price must be greater than 0' })

const categorySchema = z
  .string()
  .trim()
  .min(1, 'Category is required')
  .max(100, 'Category must be at most 100 characters')

const statusSchema = z.enum(['active', 'inactive'])

const uuidSchema = z
  .string()
  .uuid('storeId must be a valid UUID')

export const productCreateSchema = z
  .object({
    name: nameSchema,
    description: descriptionSchema,
    price: priceSchema,
    category: categorySchema,
    storeId: uuidSchema,
  })
  .strict()

export type ProductCreateInput = z.infer<typeof productCreateSchema>

export const productUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    description: descriptionSchema,
    price: priceSchema.optional(),
    category: categorySchema.optional(),
    status: statusSchema.optional(),
  })
  .strict()

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

export const productQuerySchema = z
  .object({
    storeId: uuidSchema.optional(),
    category: categorySchema.optional(),
    q: z.string().trim().min(1).max(255).optional(),
    page: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => (v == null ? undefined : Number(v)))
      .refine((v) => v == null || (Number.isInteger(v) && v >= 1), {
        message: 'page must be an integer >= 1',
      }),
    limit: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => (v == null ? undefined : Number(v)))
      .refine((v) => v == null || (Number.isInteger(v) && v >= 1 && v <= 50), {
        message: 'limit must be an integer between 1 and 50',
      }),
  })
  .strict()

export type ProductQueryInput = z.infer<typeof productQuerySchema>

export type NormalizedProductQuery = {
  storeId?: string
  category?: string
  q?: string
  page: number
  limit: number
}

export function validateProductCreate(input: unknown): ProductCreateInput {
  const parsed = productCreateSchema.safeParse(input)
  if (!parsed.success) {
    const err: any = new Error('Invalid input data')
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    err.details = parsed.error.flatten()
    throw err
  }
  return parsed.data
}

export function validateProductUpdate(input: unknown): ProductUpdateInput {
  const parsed = productUpdateSchema.safeParse(input)
  if (!parsed.success) {
    const err: any = new Error('Invalid input data')
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    err.details = parsed.error.flatten()
    throw err
  }
  return parsed.data
}

export function validateProductQuery(input: unknown): NormalizedProductQuery {
  const parsed = productQuerySchema.safeParse(input)
  if (!parsed.success) {
    const err: any = new Error('Invalid query parameters')
    err.code = 'VALIDATION_ERROR'
    err.status = 400
    err.details = parsed.error.flatten()
    throw err
  }
  const page = parsed.data.page ?? 1
  const limit = parsed.data.limit ?? 10
  return { ...parsed.data, page, limit }
}
