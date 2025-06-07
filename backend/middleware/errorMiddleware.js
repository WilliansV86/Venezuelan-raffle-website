// Middleware for handling 'Not Found' errors (404)
const notFound = (req, res, next) => {
  const error = new Error(`No Encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General error handling middleware
// This will catch any errors passed via next(error)
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come with a status code, otherwise default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Optionally, include stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
