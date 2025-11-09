import { Router } from 'express';

// estas rutas deberían existir ya en tu proyecto, porque antes sí podías hacer /auth/signin y /articles
import authRouter from './auth.js';
import usersRouter from './users.js';
import articlesRouter from './articles.js';

const router = Router();

// auth: /auth/signin, /auth/signup, etc.
router.use('/auth', authRouter);

// users: /users/me, etc. (si tu proyecto lo trae)
router.use('/users', usersRouter);

// artículos guardados: esto es lo que el frontend está llamando con GET /articles y POST /articles
router.use('/articles', articlesRouter);

export default router;
