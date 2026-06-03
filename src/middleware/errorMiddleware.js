function notFound(req, res, next) {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: error.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}

module.exports = {
  notFound,
  errorHandler
};
