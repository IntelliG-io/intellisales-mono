import { Router, type Response } from 'express';
import { authenticateJWT, type AuthenticatedRequest } from '../../middleware/authenticateJWT';
import { handleMe } from '../../controllers/auth';

const router = Router();

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User inactive
 *       404:
 *         description: User not found
 */
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => handleMe(req, res));

export default router;
