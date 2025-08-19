import { Router } from 'express';
import authRouter from './auth/index';
import productsRouter from './products';

const router = Router();

router.get('/echo', (req, res) => {
  res.json({ method: 'GET', query: req.query, headers: req.headers });
});

router.post('/echo', (req, res) => {
  res.json({ method: 'POST', body: req.body, headers: req.headers });
});

export default router;

// Mount auth routes (exposes /auth/*)
router.use(authRouter);

// Mount product routes (exposes /products under /v1 and /api prefixes)
router.use(productsRouter);
