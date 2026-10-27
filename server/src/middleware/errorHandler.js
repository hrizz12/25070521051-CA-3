// Centralized error handling. Any error passed to next(err) ends up here.

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Mongoose validation failed (e.g. a required field was missing)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors[0], errors });
  }

  // Bad id format
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id or value format' });
  }

  // Duplicate key (unique index), e.g. email already registered
  if (err.code === 11000) {
    return res.status(409).json({ message: 'That value is already in use' });
  }

  // Broken JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  console.error(err); // full details only in the server terminal
  res.status(500).json({ message: 'Something went wrong on the server' });
}

module.exports = { notFound, errorHandler };
