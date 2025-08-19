import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/authorize'
import type { Role } from '@prisma/client'
import { handleDeleteProduct } from '../../controllers/productController'

const router = Router()
const MANAGER_ROLES: Role[] = ['ADMIN', 'MANAGER'] as unknown as Role[]

router.use(requireAuth)

// DELETE /products/:id
router.delete('/:id', requireRoles(...MANAGER_ROLES), handleDeleteProduct)

export default router
