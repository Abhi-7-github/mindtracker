export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];
  res.status(status).json({ success: false, message, errors });
}
