/**
 * Error Handling Middleware
 */

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (req.accepts('json')) {
    return res.status(status).json({
      error: message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  res.status(status).render('error', {
    error: message,
    status,
  });
}

module.exports = { errorHandler };
