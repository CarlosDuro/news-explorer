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
import articleRoutes from './routes/articles.js';

const app = express();

/* Guardas y diagnostico previo */
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Define it in environment variables.');
  process.exit(1);
}
console.log('🔧 NODE_ENV=', NODE_ENV);
console.log('🔧 PORT=', PORT);
console.log('🔧 CORS_ORIGIN=', CORS_ORIGIN.join(','));
console.log('🔧 Mongo host preview=', MONGODB_URI.replace(/\/\/.*?:.*?@/, '//<user>:<pass>@'));

app.use(helmet());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (CORS_ORIGIN.length === 0 || CORS_ORIGIN.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
  })
);

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/healthz', function (_req, res) {
  res.json({ ok: true });
});

app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);

app.use(celebrateErrors());
app.use(errorHandler);

/* Conexión robusta a Mongo + logs */
mongoose.connection.on('connected', () => console.log('✅ Mongo connected'));
mongoose.connection.on('error', (err) => console.error('❌ Mongo error:', err?.message || err));
mongoose.connection.on('disconnected', () => console.warn('⚠️ Mongo disconnected'));

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    app.listen(PORT, function () {
      console.log('🚀 API on :' + PORT);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err?.message || err);
    process.exit(1);
  }
}
start();
