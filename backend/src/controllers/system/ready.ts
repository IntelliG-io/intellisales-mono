import type { Request, Response } from 'express'

export function handleReady(_req: Request, res: Response) {
  res.json({ status: 'ok' })
}
