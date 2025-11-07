import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errors as celebrateErrors } from 'celebrate';

import { PORT, MONGODB_URI, CORS_ORIGIN, NODE_ENV } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/auth.js';
import articlesRoutes from './routes/articles.js';
import searchRouter from './routes/search.js';
import { auth } from './middlewares/auth.js';

const app = express();
app.set('trust proxy', 1);

/* OPTIONS antes de todo (para Express 5 en Render) */
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next();

  const origin = req.headers.origin;
  const allowList = Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : [];
  const allowed = !origin || allowList.length === 0 || allowList.includes(origin);

  if (!allowed) return res.sendStatus(403);

  res.setHeader('Vary', 'Origin');
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res.sendStatus(204);
});

/* seguridad + json */
app.use(helmet());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

/* CORS real */
const corsOpts = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (CORS_ORIGIN.length === 0 || CORS_ORIGIN.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOpts));

/* rate limit (no OPTIONS / no healthz) */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: (req) => req.method === 'OPTIONS' || req.path === '/healthz',
  })
);

/* health */
app.get('/healthz', (req, res) => res.json({ ok: true }));

/* públicas */
app.use('/auth', authRoutes);
app.use('/search', searchRouter);

/* protegidas */
app.use('/articles', auth, articlesRoutes);

/* celebrate */
app.use(celebrateErrors());

/* errores */
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Mongo connected');
  } catch (err) {
    console.error('❌ Mongo connection failed', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 API on :${PORT}`);
    console.log('🔧 CORS_ORIGIN =', CORS_ORIGIN);
  });
}

start();
