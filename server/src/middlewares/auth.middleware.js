const jwt = require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    })
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded;

  next();
})

module.exports = authMiddleware;