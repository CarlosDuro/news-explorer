import express from 'express';

const router = express.Router();

/**
 * Router mínimo para que Render no truene.
 * Luego aquí puedes montar:
 *   router.use('/auth', authRouter);
 *   router.use('/articles', articleRouter);
 */
router.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default router;
