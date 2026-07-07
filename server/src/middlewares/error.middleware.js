const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: "Internal Server Error"
  })
}

module.exports = errorMiddleware;