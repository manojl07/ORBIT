const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/auth.service')
const ApiResponse = require('../utils/ApiResponse')
const crypto = require("crypto");
const { accessCookieOptions, refreshCookieOptions } = require('../config/cookie.config');


const registerController = asyncHandler(async (req, res) => {
  const result = await authService.register({
    ...req.body,
    profileImg: req.file,
    deviceId: crypto.randomUUID(),
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  })

  res.cookie("accessToken", result.accessToken, accessCookieOptions)

  res.cookie("refreshToken", result.refreshToken.refreshCookieOption)

  res.cookie("deviceId", result.deviceId,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
  )

  return res.status(201).json(new ApiResponse(201, "User Registered Successfully", result));
})

const loginController = asyncHandler(async (req, res) => {
  const result = await authService.login({
    identifier: req.body.identifier,
    password: req.body.password,
    deviceId: crypto.randomUUID(),
    userAgent: req.get("user-agent"),
    ipAddress: req.ip
  });

  res.cookie("accessToken", result.accessToken, accessCookieOptions)

  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions)

  res.cookie("deviceId", result.deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return res.status(200).json(new ApiResponse(200, "Login successful",
    {
      user: result.user,
      sessionId: result.sessionId,
    }
  ))
})

const refreshController = asyncHandler(async (req, res) => {
  const result = await authService.refresh({
    refreshToken: req.cookies.refreshToken,
    deviceId: req.cookies.deviceId,
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  })

  return res.status(200).json(new ApiResponse(200, "Token refreshed", result))
})

module.exports = { registerController, loginController, refreshController }