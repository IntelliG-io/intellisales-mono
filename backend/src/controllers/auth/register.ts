import type { Request, Response } from 'express'
import { validateUserRegistration } from '../../validators/userValidator'
import { registerUser } from '../../services/authService'

export async function handleRegister(req: Request, res: Response) {
  try {
    const input = validateUserRegistration(req.body)
    const result = await registerUser(input)
    return res.status(201).json(result)
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : 500
    if (err?.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input data', details: err.details })
    }
    if (err?.code === 'USER_EXISTS') {
      return res.status(409).json({ code: 'USER_EXISTS', message: 'User already exists' })
    }
    return res.status(status).json({ code: 'DB_ERROR', message: 'Unexpected database error' })
  }
}
