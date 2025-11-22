import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';
import { unauthorized } from '../utils/httpErrors.js';

export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(unauthorized('Auth token missing'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { _id: payload._id, email: payload.email, name: payload.name };
    next();
  } catch {
    next(unauthorized('Invalid token'));
  }
}
