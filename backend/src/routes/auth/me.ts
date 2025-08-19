import { Router, type Request, type Response } from 'express';
import prisma from '../../prisma';
import { authenticateJWT, type AuthenticatedRequest } from '../../middleware/authenticateJWT';

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
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authedUser = req.user!; // set by authenticateJWT

    // Re-fetch with relations for response shaping
    const userWithRelations = await prisma.user.findUnique({
      where: { id: authedUser.id },
      include: {
        tenant: true,
        stores: { take: 1, include: { store: true } },
      },
    });

    if (!userWithRelations) {
      return res.status(404).json({ status: 404, code: 'USER_NOT_FOUND', message: 'User does not exist' });
    }

    const maybeActive = (userWithRelations as unknown as { active?: boolean }).active;
    if (typeof maybeActive === 'boolean' && !maybeActive) {
      return res.status(403).json({ status: 403, code: 'USER_INACTIVE', message: 'User account is inactive or blocked' });
    }

    const primaryStoreMember = userWithRelations.stores?.[0] || null;
    const primaryStore = primaryStoreMember ? primaryStoreMember.store : null;
    const isActive = typeof maybeActive === 'boolean' ? maybeActive : true;

    const response = {
      user: {
        id: userWithRelations.id,
        name: null as string | null, // Not present in schema
        email: userWithRelations.email,
        role: String(userWithRelations.role),
        status: isActive ? 'active' : 'inactive',
        tenant: userWithRelations.tenant
          ? {
              id: userWithRelations.tenant.id,
              name: userWithRelations.tenant.name,
              subscriptionStatus: null as 'active' | 'expired' | null, // Not present in schema
            }
          : null,
        store: primaryStore
          ? {
              id: primaryStore.id,
              name: primaryStore.name,
              location: null as string | null, // Not present in schema
            }
          : null,
      },
      token: (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || undefined,
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Unexpected error' });
  }
});

export default router;
