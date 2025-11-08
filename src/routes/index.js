import express from 'express';
import authRouter from './auth.js';
import articlesRouter from './articles.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/articles', articlesRouter);

router.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default router;
