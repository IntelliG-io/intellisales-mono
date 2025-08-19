import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { handleListProducts } from '../../controllers/productController'

const router = Router()

router.use(requireAuth)

// GET /products
router.get('/', handleListProducts)

export default router
