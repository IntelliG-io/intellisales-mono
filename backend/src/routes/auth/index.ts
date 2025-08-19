import { Router } from 'express'
import register from './register'
import login from './login'
import me from './me'
import refresh from './refresh'

const router = Router()

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 * components:
 *   schemas:
 *     Tokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */
// Mount auth sub-routes under /auth
router.use('/auth', register)
router.use('/auth', login)
router.use('/auth', me)
router.use('/auth', refresh)

export default router
