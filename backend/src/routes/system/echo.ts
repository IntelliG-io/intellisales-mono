import { Router } from 'express'

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
router.get('/echo', (req, res) => {
  res.json({ method: 'GET', query: req.query, headers: req.headers })
})

router.post('/echo', (req, res) => {
  res.json({ method: 'POST', body: req.body, headers: req.headers })
})

export default router
