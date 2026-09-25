const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, statusCode: 400, message: err.message, });
  }

  if (err.message === "Only images allowed") {
    return res.status(415).json({ success: false, statusCode: 415, message: err.message, });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: statusCode >= 500 ? "Internal Server Error" : err.message,
    ...(err.code && { code: err.code, }),
  });
};

module.exports = errorHandler;