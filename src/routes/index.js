import express from 'express';

const router = express.Router();

/**
 * Aquí deberías montar tus rutas reales si las tienes,
 * por ejemplo:
 *   import auth from '../routes/auth.js';
 *   router.use('/auth', auth);
 *
 * Pero como en Render está fallando porque no encuentra este
 * archivo, metemos un router mínimo.
 */

router.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default router;
