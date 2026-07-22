const jwt = require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;

  if(authHeader && authHeader.startsWith("Bearer ")){
    token = authHeader.split(" ")[1];
  }

  if(!token && req.cookies.accessToken){
    token = req.cookies.accessToken;
  }

  if(!token){
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    })
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

  req.user = decoded;

  next();
})

module.exports = authMiddleware;