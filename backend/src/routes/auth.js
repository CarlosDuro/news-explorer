import { Router } from 'express';
import { signin, signup, me } from '../controllers/authController.js';
import { validateSignin, validateSignup } from '../middlewares/validate.js';
import { auth } from '../middlewares/auth.js';

const router = Router();
router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
router.get('/me', auth, me);

export default router;
