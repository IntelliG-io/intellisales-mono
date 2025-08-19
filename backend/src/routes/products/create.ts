import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRoles } from '../../middleware/authorize'
import type { Role } from '@prisma/client'
import { handleCreateProduct } from '../../controllers/productController'

const router = Router()
const MANAGER_ROLES: Role[] = ['ADMIN', 'MANAGER'] as unknown as Role[]

router.use(requireAuth)

// POST /products
router.post('/', requireRoles(...MANAGER_ROLES), handleCreateProduct)

export default router
