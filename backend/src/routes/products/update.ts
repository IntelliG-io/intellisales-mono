import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/authorize'
import type { Role } from '@prisma/client'
import { handleUpdateProduct } from '../../controllers/productController'

const router = Router()
const MANAGER_ROLES: Role[] = ['ADMIN', 'MANAGER'] as unknown as Role[]

router.use(requireAuth)

// PUT /products/:id
router.put('/:id', requireRoles(...MANAGER_ROLES), handleUpdateProduct)

export default router
