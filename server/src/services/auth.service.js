const crypto = require('crypto')

const User = require('../models/user.model')
const Session = require('../models/session.model')
const ApiError = require('../utils/ApiError')
const { createTokens } = require('./token.service')


const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const findUser = async (identifier) => {

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase(), },
    ]
  }).select("+password")

  if (!user) {
    throw new ApiError(401, "Invalid credentials")
  }

  return user;
}

const createSession = async ({ user, refreshToken, deviceId, userAgent, ipAddress }) => {

  const tokenHash = hashToken(refreshToken);

  const session = await Session.create({ user: user._id, tokenHash, deviceId, userAgent, ipAddress, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })

  return session;
}

const register = async ({ username, email, password, bio, deviceId, userAgent, ipAddress }) => {

  const existing = await User.findOne({ $or: [{ email }, { username }] })

  if (existing) {
    throw new ApiError(409, "User already exists")
  }

  const user = await User.create({ username, email, password, bio })

  const { accessToken, refreshToken } = createTokens(user);

  const session = await createSession({ user, refreshToken, deviceId, userAgent, ipAddress })

  return {
    user, accessToken, refreshToken, sessionId: session._id
  }
}

const login = async ({ identifier, password, deviceId, userAgent, ipAddress }) => {

  const user = await findUser(identifier)

  const matched = await user.comparePassword(password)

  if (!matched) {
    throw new ApiError(401, "Invalid credentials")
  }

  const { accessToken, refreshToken } = createTokens(user);

  const session = await createSession({ user, refreshToken, deviceId, userAgent, ipAddress })

  return { user, accessToken, refreshToken, sessionId: session._id }
}

const logout = async (sessionId) => {
  await Session.findByIdAndDelete(sessionId)

  return true;
}

const logoutAll = async (userId) => {
  await Session.deleteMany({ user: userId })

  return true;
}



module.exports = { register, login, logout, logoutAll };


// right now ill copy paste all the code written for this project reading all files give the explation of all the files and their code in the flow how the data is flowing and these how they are woking from app.js, server.js to every controller, route, middleware, utils, validators, service, config, consonants etc,.