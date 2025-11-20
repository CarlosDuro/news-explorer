import 'dotenv/config';

export const NODE_ENV = process.env.NODE_ENV || 'production';
export const PORT = Number(process.env.PORT || 8080);

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
export const NEWS_API_LANG = process.env.NEWS_API_LANG || 'es';

/** Lista de orígenes permitidos para CORS (coma-separados) */
export const CORS_ORIGIN = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
