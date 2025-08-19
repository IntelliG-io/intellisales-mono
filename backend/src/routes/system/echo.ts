import { Router } from 'express'
import { handleEchoGet, handleEchoPost } from '../../controllers/system'

const router = Router()

/**
 * @openapi
 * /echo:
 *   get:
 *     summary: Echo request metadata
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Echo of query and headers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   post:
 *     summary: Echo request body
 *     tags: [System]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Echo of body and headers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/echo', handleEchoGet)

router.post('/echo', handleEchoPost)

export default router
