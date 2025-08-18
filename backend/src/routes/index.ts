import { Router } from 'express';
import registerRouter from './auth/register';
import loginRouter from './auth/login';
import meRouter from './auth/me';

const router = Router();

router.get('/echo', (req, res) => {
  res.json({ method: 'GET', query: req.query, headers: req.headers });
});

router.post('/echo', (req, res) => {
  res.json({ method: 'POST', body: req.body, headers: req.headers });
});

export default router;

// Mount auth routes
router.use('/auth', registerRouter);
router.use('/auth', loginRouter);
router.use('/auth', meRouter);
