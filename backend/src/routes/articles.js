import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { validateArticle } from '../middlewares/validate.js';
import {
  listArticles,
  createArticle,
  deleteArticle,
} from '../controllers/articleController.js';

const router = Router();

// todas las rutas de artículos requieren auth
router.use(auth);

router.get('/', listArticles);
router.post('/', validateArticle, createArticle);
router.delete('/:id', deleteArticle);

export default router;
