const { generateAccessToken, generateRefreshToken } = require('../utils/jwt')

const createTokens = (user) => {
  const payload = { id: user._id }

  const accessToken = generateAccessToken(payload);

  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken }
}

module.exports = { createTokens }

