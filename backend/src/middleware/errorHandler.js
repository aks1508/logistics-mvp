function errorHandler(err, req, res, next) {
  console.error(err);

  const isMulter = err && err.code;
  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  const response = {
    message: err.message || "Server error",
  };

  if (isMulter) {
    response.code = err.code;
  }

  return res.status(status).json(response);
}

module.exports = errorHandler;
