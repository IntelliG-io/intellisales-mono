import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { handleListProducts } from '../../controllers/productController'

const router = Router()

router.use(requireAuth)

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Paged list of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagedProducts'
 *       401:
 *         description: Unauthorized
 */
// GET /products
router.get('/', handleListProducts)

export default router
