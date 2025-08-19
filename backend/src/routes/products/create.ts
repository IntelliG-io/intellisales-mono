import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/authorize'
import type { Role } from '@prisma/client'
import { handleCreateProduct } from '../../controllers/products'

const router = Router()
const MANAGER_ROLES: Role[] = ['ADMIN', 'MANAGER'] as unknown as Role[]

router.use(requireAuth)

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Requires ADMIN or MANAGER role
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or invalid category
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient role)
 *       404:
 *         description: Store not found
 *       409:
 *         description: Product with same name already exists in the store
 */
// POST /products
router.post('/', requireRoles(...MANAGER_ROLES), handleCreateProduct)

export default router
