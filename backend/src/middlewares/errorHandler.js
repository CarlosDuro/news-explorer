export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const payload = { status, message: err.message || 'Server error' };
  if (process.env.NODE_ENV !== 'production' && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
}
