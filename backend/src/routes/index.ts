import { Router } from 'express';

const router = Router();

router.get('/echo', (req, res) => {
  res.json({ method: 'GET', query: req.query, headers: req.headers });
});

router.post('/echo', (req, res) => {
  res.json({ method: 'POST', body: req.body, headers: req.headers });
});

export default router;
