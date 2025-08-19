import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/authorize'
import type { Role } from '@prisma/client'
import { handleUpdateProduct } from '../../controllers/products'

const router = Router()
const MANAGER_ROLES: Role[] = ['ADMIN', 'MANAGER'] as unknown as Role[]

router.use(requireAuth)

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Requires ADMIN or MANAGER role
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Product updated
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
 *         description: Product not found
 */
// PUT /products/:id
router.put('/:id', requireRoles(...MANAGER_ROLES), handleUpdateProduct)

export default router
