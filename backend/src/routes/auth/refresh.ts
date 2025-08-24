import { Router } from 'express';
import { handleRefresh } from '../../controllers/auth';

const router = Router();

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Missing or invalid input
 *       401:
 *         description: Invalid or expired refresh token
 *       403:
 *         description: User inactive
 *       404:
 *         description: User not found
 */
router.post('/refresh', handleRefresh);

export default router;
