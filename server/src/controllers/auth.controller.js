const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/auth.service')
const ApiResponse = require('../utils/ApiResponse')
const crypto = require("crypto");


const registerController = asyncHandler(async (req, res) => {
  const result = await authService.register({
    ...req.body,
    deviceId: crypto.randomUUID(),
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  })

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

  return res.status(200).json(new ApiResponse(200, "Login successful", result))
})

module.exports = { registerController, loginController }