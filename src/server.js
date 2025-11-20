// server.js
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { errors as celebrateErrors } from 'celebrate';

import {
  PORT,
  MONGODB_URI,
  CORS_ORIGIN,
  NODE_ENV,
  NEWS_API_KEY,
  NEWS_API_LANG,
} from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { auth } from './middlewares/auth.js';
import { validateArticle } from './middlewares/validate.js';
import { listArticles, createArticle, deleteArticle } from './controllers/articleController.js';

const app = express();
app.set('trust proxy', 1);

/* ---------- seguridad ---------- */
app.use(helmet());

/* ---------- logs ---------- */
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ---------- body parser JSON ---------- */
app.use(express.json());

/* ---------- CORS MUY ABIERTO PARA DESARROLLO ---------- */
// Permite cualquier origen en desarrollo. Más adelante lo afinamos.
app.use(
  cors({
    origin: true, // refleja el Origin que venga en la request
    credentials: true,
  })
);

/* ---------- IMPORTANTE: SIN rate-limit EN DESARROLLO ---------- */
/*  Hemos eliminado por completo express-rate-limit para que
    no vuelva a dar 429 mientras desarrollas.
    (Antes aquí estaba app.use(limiter); )
*/

/* ---------- RUTAS BÁSICAS ---------- */
app.get('/healthz', (req, res) => {
  res.json({ ok: true });
});

/* ---------- BÚSQUEDA REAL USANDO NEWSAPI.ORG ---------- */
app.get('/search', async (req, res) => {
  const rawQ = (req.query.q || '').toString().trim();

  if (!rawQ) {
    return res.json({
      query: rawQ,
      total: 0,
      items: [],
    });
  }

  if (!NEWS_API_KEY) {
    return res.status(500).json({
      query: rawQ,
      total: 0,
      items: [],
      error: 'NEWS_API_KEY is not configured',
    });
  }

  try {
    const lang = NEWS_API_LANG || 'es';

    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', rawQ);
    url.searchParams.set('language', lang);
    url.searchParams.set('pageSize', '20');
    url.searchParams.set('sortBy', 'publishedAt');

    const resp = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': NEWS_API_KEY,
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('NewsAPI error:', resp.status, text);
      return res.status(502).json({
        query: rawQ,
        total: 0,
        items: [],
        error: 'NewsAPI request failed',
      });
    }

    const data = await resp.json();

    const items = (data.articles || []).map((a) => ({
      keyword: rawQ,
      title: a.title || 'No title',
      text: a.description || a.content || 'No description',
      date: a.publishedAt ? a.publishedAt.slice(0, 10) : '',
      source: (a.source && a.source.name) || 'Unknown',
      link: a.url,
      image: a.urlToImage || '',
    }));

    return res.json({
      query: rawQ,
      total: items.length,
      items,
    });
  } catch (err) {
    console.error('Error calling NewsAPI:', err);
    return res.status(500).json({
      query: rawQ,
      total: 0,
      items: [],
      error: 'Internal error calling NewsAPI',
    });
  }
});
/* ----------------------------------------------------------------------- */

/* ---------- RUTAS DE ARTÍCULOS ---------- */
app.get('/articles', auth, listArticles);
app.post('/articles', auth, validateArticle, createArticle);
app.delete('/articles/:id', auth, deleteArticle);

/* ---------- RUTAS DEL PROYECTO (auth, etc.) ---------- */
app.use('/', routes);

/* ---------- errores de celebrate ---------- */
app.use(celebrateErrors());

/* ---------- manejador general de errores ---------- */
app.use(errorHandler);

/* ---------- ARRANQUE ---------- */
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Mongo connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log('🔧 NODE_ENV =', NODE_ENV);
      console.log('🔧 CORS_ORIGIN =', CORS_ORIGIN);
      console.log('🔧 NEWS_API_LANG =', NEWS_API_LANG);
    });
  })
  .catch((err) => {
    console.error('❌ Mongo connect error', err);
    process.exit(1);
  });
