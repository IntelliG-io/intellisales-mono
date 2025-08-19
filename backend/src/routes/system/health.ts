import { Router } from 'express'

const router = Router()

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness probe
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                 timestamp:
 *                   type: number
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() })
})

export default router
