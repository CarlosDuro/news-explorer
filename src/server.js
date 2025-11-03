import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errors as celebrateErrors } from 'celebrate';

import { PORT, MONGODB_URI, CORS_ORIGIN, NODE_ENV } from './config/index.js';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.set('trust proxy', 1);

/* ---------- PRE-OPTIONS UNIVERSAL (Express 5) ---------- */
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next();

  const origin = req.headers.origin;
  const allowList = Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : [];
  const allowed =
    !origin || allowList.length === 0 || allowList.includes(origin);

  if (!allowed) return res.sendStatus(403);

  res.setHeader('Vary', 'Origin');
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization',
  );
  return res.sendStatus(204);
});
/* ------------------------------------------------------- */

app.use(
  helmet({
    // ajusta si luego necesitas imágenes externas
  }),
);
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

const corsOpts = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (CORS_ORIGIN.length === 0 || CORS_ORIGIN.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOpts));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    skip: (req) =>
      req.method === 'OPTIONS' || req.path === '/healthz',
  }),
);

/* ---------- RUTAS ---------- */
app.get('/healthz', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);

// aquí montamos en los dos prefijos
app.use('/articles', articleRoutes);
app.use('/api/articles', articleRoutes);

app.use(celebrateErrors());

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Mongo connected');
    app.listen(PORT, () => {
      console.log(`🚀 API on :${PORT}`);
      console.log('🔧 CORS_ORIGIN =', CORS_ORIGIN);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
