function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    message = 'Invalid JSON payload';
  }

  if (statusCode >= 500) {
    const validationErrors = err.errors
      ? Object.entries(err.errors).map(([path, detail]) => ({
        path,
        kind: detail?.kind || detail?.name || 'validation',
      }))
      : [];

    console.error('Unhandled API error', {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      name: err.name || 'Error',
      message: err.name === 'ValidationError' ? 'Database validation failed' : message,
      validationErrors,
    });
  }

  const response = {
    success: false,
    message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (err.data) {
    response.data = err.data;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
