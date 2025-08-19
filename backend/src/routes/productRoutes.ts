import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { requireRoles } from '../middleware/authorize'
import type { Role } from '@prisma/client'
import {
  handleCreateProduct,
  handleDeleteProduct,
  handleListProducts,
  handleUpdateProduct,
} from '../controllers/productController'

const router = Router()

// All routes require authentication
router.use(requireAuth)

// GET /api/products?storeId=&category=&page=&limit=&q=
router.get('/products', handleListProducts)

// Only admins/managers can mutate products
const MANAGER_ROLES: Role[] = ['ADMIN', 'MANAGER'] as unknown as Role[]
router.post('/products', requireRoles(...MANAGER_ROLES), handleCreateProduct)
router.put('/products/:id', requireRoles(...MANAGER_ROLES), handleUpdateProduct)
router.delete('/products/:id', requireRoles(...MANAGER_ROLES), handleDeleteProduct)

export default router
