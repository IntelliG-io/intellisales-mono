import { Router, type Request, type Response } from 'express';
import { verifyToken, signAccessToken, signRefreshToken } from '../../auth';
import prisma from '../../prisma';

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
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = (req.body ?? {}) as { refreshToken?: unknown };
    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'refreshToken is required' });
    }

    const verify = await verifyToken(refreshToken);
    if (!verify.valid) {
      // treat any invalid/expired/malformed refresh token as 401
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid or expired refresh token' });
    }

    const payload: any = verify.payload;
    if ((payload?.typ ?? '').toLowerCase() !== 'refresh') {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid refresh token type' });
    }

    const userId = payload.sub as string | undefined;
    if (!userId) {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid refresh token subject' });
    }

    // Ensure user still exists and not blocked
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User does not exist' });
    }
    const maybeActive = (user as unknown as { active?: boolean }).active;
    if (maybeActive === false) {
      return res.status(403).json({ code: 'USER_INACTIVE', message: 'User account is inactive' });
    }

    const newAccess = await signAccessToken(userId);
    const newRefresh = await signRefreshToken(userId);

    return res.status(200).json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    return res.status(500).json({ code: 'SERVER_ERROR', message: 'Unexpected error' });
  }
});

export default router;
