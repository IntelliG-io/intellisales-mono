import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/authorize'
import type { Role } from '@prisma/client'
import { handleDeleteProduct } from '../../controllers/productController'

const router = Router()
const MANAGER_ROLES: Role[] = ['ADMIN', 'MANAGER'] as unknown as Role[]

router.use(requireAuth)

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Soft-delete a product (set status to inactive)
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
 *     responses:
 *       200:
 *         description: Product soft-deleted (returns updated product)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient role)
 *       404:
 *         description: Product not found
 */
// DELETE /products/:id
router.delete('/:id', requireRoles(...MANAGER_ROLES), handleDeleteProduct)

export default router
