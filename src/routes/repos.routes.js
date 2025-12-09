import { Router } from 'express';
import github from '../services/github.service.js';

const router = Router();

router.get('/:owner/:repo', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const result = await github.getRepoDetails(owner, repo);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;