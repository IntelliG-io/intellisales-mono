import type { Request, Response } from 'express'
import { validateProductQuery } from '../../validators/productValidator'
import { listProducts } from '../../services/productService'

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
