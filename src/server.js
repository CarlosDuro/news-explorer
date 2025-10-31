import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errors as celebrateErrors } from 'celebrate';
import { PORT, MONGODB_URI, CORS_ORIGIN, NODE_ENV } from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import searchRoutes from './routes/search.js';

const app = express();
app.set('trust proxy', 1);

/* ---------- PRE-OPTIONS UNIVERSAL (Express 5) ---------- */
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
/* ------------------------------------------------------- */

/* Security & utils */
app.use(helmet({
  // Opcional: ajusta si sirves imágenes externas, etc.
}));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

/* CORS para peticiones reales */
const corsOpts = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (CORS_ORIGIN.length === 0 || CORS_ORIGIN.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOpts));

/* Rate limit (ignora OPTIONS y /healthz) */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/healthz',
}));

/* Health */

app.use(searchRoutes);
app.get('/healthz', (_, res) => res.json({ ok: true }));

/* ====== TUS RUTAS ======
   import authRoutes from './routes/auth.js';
   import articleRoutes from './routes/articles.js';
   app.use('/auth', authRoutes);
   app.use('/articles', articleRoutes);
   app.get('/search', ...);
   ====================== */

/* Celebrate validation errors */
app.use(celebrateErrors());

/* Error handler final */
app.use(errorHandler);

async function start() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    conn.connection.on('disconnected', () => console.warn('⚠️ Mongo disconnected'));
    app.listen(PORT, () => console.log(`🚀 API on :${PORT}`));
  } catch (e) {
    console.error('❌ Failed to start server:', e.message);
    process.exit(1);
  }
}
start();
