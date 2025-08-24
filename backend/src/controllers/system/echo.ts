import type { Request, Response } from 'express'

export function handleEchoGet(req: Request, res: Response) {
  res.json({ method: 'GET', query: req.query, headers: req.headers })
}

export function handleEchoPost(req: Request, res: Response) {
  res.json({ method: 'POST', body: req.body, headers: req.headers })
}
