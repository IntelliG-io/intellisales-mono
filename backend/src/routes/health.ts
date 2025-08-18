import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

router.get('/ready', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;
