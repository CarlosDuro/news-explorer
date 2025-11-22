import express from 'express';
import { searchNews } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', searchNews);

export default router;
