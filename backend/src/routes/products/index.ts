import { Router } from 'express'
import list from './list'
import create from './create'
import update from './update'
import remove from './remove'

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Manage products within a store
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         storeId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *           description: Decimal as string with 2 fraction digits
 *           example: "12.50"
 *         category:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductCreate:
 *       type: object
 *       required: [storeId, name, price, category]
 *       properties:
 *         storeId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: string
 *           description: Decimal as string with 2 fraction digits
 *           example: "12.50"
 *         category:
 *           type: string
 *     ProductUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         price:
 *           type: string
 *           description: Decimal as string with 2 fraction digits
 *         category:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *     PagedProducts:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 */
const router = Router()

// Mount product sub-routes under /products
router.use('/products', list)
router.use('/products', create)
router.use('/products', update)
router.use('/products', remove)

export default router
