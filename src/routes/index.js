import { Router } from 'express';
import authRouter from './auth.js';
import articlesRouter from './articles.js';
import searchRouter from './search.js';

const router = Router();

// login, registro, me
router.use('/auth', authRouter);

// artículos guardados (requiere auth dentro del archivo)
router.use('/articles', articlesRouter);

// buscador (el mock que tienes en src/routes/search.js)
router.use('/search', searchRouter);

export default router;
