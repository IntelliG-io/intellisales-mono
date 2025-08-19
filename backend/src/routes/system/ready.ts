import { Router } from 'express'

const router = Router()

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Readiness probe
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is ready to receive traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/ready', (_req, res) => {
  res.json({ status: 'ok' })
})

export default router
