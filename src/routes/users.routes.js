import { Router } from 'express';
import github from '../services/github.service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { limit, since } = req.query;
    const result = await github.getUsers(limit, since);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:username', async (req, res, next) => {
  try {
    const result = await github.getUserDetails(req.params.username);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:username/repos', async (req, res, next) => {
  try {
    const { sort, language, limit } = req.query;
    const result = await github.getUserRepos(req.params.username, {
      sort,
      language,
      limit
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:username/stats', async (req, res, next) => {
  try {
    const result = await github.getUserStats(req.params.username);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;