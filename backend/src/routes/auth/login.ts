import { Router, type Request, type Response } from 'express';
import { validateUserLogin } from '../../validators/userValidator';
import { loginUser } from '../../services/authService';

const router = Router();

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
