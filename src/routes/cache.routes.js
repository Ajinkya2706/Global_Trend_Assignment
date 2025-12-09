import { Router } from 'express';
import cache from '../services/cache.service.js';

const router = Router();

router.get('/stats', (req, res) => {
  res.json(cache.getStats());
});

router.delete('/clear', (req, res) => {
  const cleared = cache.clear();
  res.json({ 
    message: 'Cache cleared successfully',
    itemsCleared: cleared 
  });
});

export default router;