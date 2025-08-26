import type { Response } from 'express'
import prisma from '../../prisma'
import type { AuthenticatedRequest } from '../../middleware/authenticateJWT'

export async function handleMeStores(req: AuthenticatedRequest, res: Response) {
  try {
    const authedUser = req.user!

    // Get user with their associated stores
    const userWithStores = await prisma.user.findUnique({
      where: { id: authedUser.id },
      include: {
        stores: {
          include: {
            store: true,
          },
        },
      },
    })

    if (!userWithStores) {
      return res.status(404).json({ 
        status: 404, 
        code: 'USER_NOT_FOUND', 
        message: 'User does not exist' 
      })
    }

    // Check if user is active
    const maybeActive = (userWithStores as unknown as { active?: boolean }).active
    if (typeof maybeActive === 'boolean' && !maybeActive) {
      return res.status(403).json({ 
        status: 403, 
        code: 'USER_INACTIVE', 
        message: 'User account is inactive or blocked' 
      })
    }

    // Transform stores data for frontend
    const stores = userWithStores.stores.map((storeMember) => ({
      id: storeMember.store.id,
      name: storeMember.store.name,
      location: null as string | null, // Add location field when it's added to schema
    }))

    const response = {
      stores,
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Error fetching user stores:', error)
    return res.status(500).json({ 
      status: 500, 
      code: 'SERVER_ERROR', 
      message: 'Unexpected error' 
    })
  }
}