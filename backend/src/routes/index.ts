import { Router } from 'express';
import authRouter from './auth/index';
import productsRouter from './products';
import systemRouter from './system';

const router = Router();

export default router;

// Mount system routes (health, ready, echo)
router.use(systemRouter);

// Mount auth routes (exposes /auth/*)
router.use(authRouter);

// Mount product routes (exposes /products under /v1 and /api prefixes)
router.use(productsRouter);
