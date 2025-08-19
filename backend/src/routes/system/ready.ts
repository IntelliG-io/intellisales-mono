import { Router } from 'express'
import { handleReady } from '../../controllers/system'

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
router.get('/ready', handleReady)

export default router
