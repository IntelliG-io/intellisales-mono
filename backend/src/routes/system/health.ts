import { Router } from 'express'
import { handleHealth } from '../../controllers/system'

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
router.get('/health', handleHealth)

export default router
