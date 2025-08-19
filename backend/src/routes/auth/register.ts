import { Router, type Request, type Response } from 'express';
import { validateUserRegistration } from '../../validators/userValidator';
import { registerUser } from '../../services/authService';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
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
 *                     firstName:
 *                       type: string
 *                       nullable: true
 *                     lastName:
 *                       type: string
 *                       nullable: true
 *                 tokens:
 *                   $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const input = validateUserRegistration(req.body);
    const result = await registerUser(input);
    return res.status(201).json(result);
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : 500;
    if (err?.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input data', details: err.details });
    }
    if (err?.code === 'USER_EXISTS') {
      return res.status(409).json({ code: 'USER_EXISTS', message: 'User already exists' });
    }
    return res.status(status).json({ code: 'DB_ERROR', message: 'Unexpected database error' });
  }
});

export default router;
