const AUTH_CONSTANTS = require('../constants/auth.constants')


const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

module.exports = { accessCookieOptions, refreshCookieOptions }