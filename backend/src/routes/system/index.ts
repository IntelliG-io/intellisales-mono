import { Router } from 'express'
import health from './health'
import ready from './ready'
import echo from './echo'

const router = Router()

/**
 * @openapi
 * tags:
 *   - name: System
 *     description: System health and troubleshooting endpoints
 */

router.use(health)
router.use(ready)
router.use(echo)

export default router
