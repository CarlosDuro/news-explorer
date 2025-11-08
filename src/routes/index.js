import express from 'express';
import authRouter from './auth.js';
import usersRouter from './users.js';
import articlesRouter from './articles.js';

const router = express.Router();

// auth (signup / signin)
router.use('/auth', authRouter);

// info del usuario
router.use('/users', usersRouter);

// artículos guardados
router.use('/articles', articlesRouter);

// fallback 404
router.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default router;
