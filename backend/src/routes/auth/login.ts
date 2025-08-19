import { Router, type Request, type Response } from 'express';
import { validateUserLogin } from '../../validators/userValidator';
import { loginUser } from '../../services/authService';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive access and refresh tokens
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
 *       200:
 *         description: Login successful
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
 *                 tokens:
 *                   $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User inactive
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const input = validateUserLogin(req.body);
    const result = await loginUser(input);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : 500;
    if (err?.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input data', details: err.details });
    }
    if (err?.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Email or password incorrect' });
    }
    if (err?.code === 'USER_INACTIVE') {
      return res.status(403).json({ code: 'USER_INACTIVE', message: 'User account is inactive' });
    }
    return res.status(status).json({ code: 'DB_ERROR', message: 'Unexpected database error' });
  }
});

export default router;
