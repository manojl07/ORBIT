const rateLimit = require("express-rate-limit");

const createLimiter = ({
  windowMs,
  max,
}) =>
  rateLimit({
    windowMs,
    max,

    standardHeaders: true,

    legacyHeaders: false,

    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message:
          "Too many requests. Please try again later.",
      });
    },
  });

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

const sensitiveAuthLimiter =
  createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
  });

module.exports = {
  authLimiter,
  sensitiveAuthLimiter,
};