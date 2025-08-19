import type { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { validateProductCreate } from '../../validators/productValidator'
import { createProduct } from '../../services/products'
import { HttpError } from '../../middleware/error'

export async function handleCreateProduct(req: Request, res: Response) {
  try {
    const input = validateProductCreate(req.body)
    const created = await createProduct(input)
    return res.status(201).json(created)
  } catch (err: any) {
    if (err?.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input data', details: err.details })
    }
    if (err instanceof HttpError) {
      return res.status(err.status).json({ code: err.code, message: err.message })
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ code: 'PRODUCT_EXISTS', message: 'Product name already exists in this store' })
      }
    }
    return res.status(500).json({ code: 'DB_ERROR', message: 'Unexpected database error' })
  }
}
