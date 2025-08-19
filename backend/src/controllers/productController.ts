import type { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import {
  validateProductCreate,
  validateProductQuery,
  validateProductUpdate,
} from '../validators/productValidator'
import {
  createProduct,
  listProducts,
  softDeleteProduct,
  updateProduct,
} from '../services/productService'
import { HttpError } from '../middleware/error'

export async function handleListProducts(req: Request, res: Response) {
  try {
    const q = validateProductQuery(req.query)
    const result = await listProducts(q)
    return res.status(200).json(result)
  } catch (err: any) {
    if (err?.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: err.details })
    }
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Unexpected error' })
  }
}

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

export async function handleUpdateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params
    const input = validateProductUpdate(req.body)
    const updated = await updateProduct(id, input as any)
    return res.status(200).json(updated)
  } catch (err: any) {
    if (err?.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input data', details: err.details })
    }
    if (err instanceof HttpError) {
      return res.status(err.status).json({ code: err.code, message: err.message })
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ code: 'PRODUCT_EXISTS', message: 'Product name already exists in this store' })
    }
    return res.status(500).json({ code: 'DB_ERROR', message: 'Unexpected database error' })
  }
}

export async function handleDeleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updated = await softDeleteProduct(id)
    return res.status(200).json(updated)
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ code: err.code, message: err.message })
    }
    return res.status(500).json({ code: 'DB_ERROR', message: 'Unexpected database error' })
  }
}
