import { Router, type Response } from 'express';
import { authenticateJWT, type AuthenticatedRequest } from '../../middleware/authenticateJWT';
import { handleMeStores } from '../../controllers/auth/stores';

const router = Router();

/**
 * @openapi
 * /auth/me/stores:
 *   get:
 *     summary: Get the currently authenticated user's stores
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's stores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       location:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User inactive
 *       404:
 *         description: User not found
 */
router.get('/me/stores', authenticateJWT, (req: AuthenticatedRequest, res: Response) => handleMeStores(req, res));

export default router;