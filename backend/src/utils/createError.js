function createError(statusCode = 500, message = 'Internal Server Error', errors) {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (errors) {
    error.errors = errors;
  }

  return error;
}

module.exports = createError;
