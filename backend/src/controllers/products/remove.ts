import type { Request, Response } from 'express'
import { softDeleteProduct } from '../../services/productService'
import { HttpError } from '../../middleware/error'

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
