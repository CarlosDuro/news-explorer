import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errors as celebrateErrors } from 'celebrate';

import { PORT, MONGODB_URI, CORS_ORIGIN, NODE_ENV } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

import searchRoutes from './routes/search.js'; // público
import authRoutes from './routes/auth.js'; // público (/signup, /signin, /me)
import articlesRoutes from './routes/articles.js'; // protegido (usa middleware auth dentro de routes)

// App
const app = express();
app.set('trust proxy', 1); // Render / proxies

/* Seguridad y utilidades */
app.use(helmet());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

/* CORS robusto + OPTIONS global */
const corsOpts = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow same-origin / curl
    if (Array.isArray(CORS_ORIGIN) && (CORS_ORIGIN.length === 0 || CORS_ORIGIN.includes(origin))) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOpts));
app.options('*', cors(corsOpts)); // responde preflight en 204 siempre que pase origin

/* Rate limit (ignora OPTIONS para no romper preflights) */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
  })
);

/* Health */
app.get('/healthz', (_req, res) => res.json({ ok: true }));

/* Rutas públicas */
app.use('/search', searchRoutes);
app.use('/auth', authRoutes);

/* Rutas protegidas (el router ya aplica auth internamente) */
app.use('/articles', articlesRoutes);

/* Errores de celebrate (400) */
app.use(celebrateErrors());

/* Manejador final de errores */
app.use(errorHandler);

// Inicio
async function start() {
  try {
    mongoose.connection.on('connected', () => console.log('✅ Mongo connected'));
    mongoose.connection.on('disconnected', () => console.warn('⚠️ Mongo disconnected'));
    mongoose.connection.on('error', (e) => console.error('❌ Mongo error', e?.message || e));

    await mongoose.connect(MONGODB_URI);
    console.log('🔧 NODE_ENV=', NODE_ENV);
    console.log('🔧 PORT=', PORT);
    console.log(
      '🔧 CORS_ORIGIN=',
      Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN.join(',') : CORS_ORIGIN
    );
    console.log(
      '🔧 Mongo host preview=',
      (MONGODB_URI || '').replace(/:\/\/.*?:.*?@/, '://<user>:<pass>@').replace(/(\?.*)$/, '?...')
    );

    app.listen(PORT, () => console.log(`🚀 API on :${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err?.message || err);
    process.exit(1);
  }
}
start();
