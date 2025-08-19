import { Router } from 'express'
import list from './list'
import create from './create'
import update from './update'
import remove from './remove'

const router = Router()

// Mount product sub-routes under /products
router.use('/products', list)
router.use('/products', create)
router.use('/products', update)
router.use('/products', remove)

export default router
