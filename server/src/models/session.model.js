const mongoose = require('mongoose')


const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  tokenHash: {
    type: String,
    required: true,
  },

  deviceId: {
    type: String,
    required: true,
  },

  userAgent: {
    type: String,
    required: true,
  },

  ipAddress: {
    type: String,
    default: "",
  },

  lastUsedAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true,
  }
}, {timestamps: true})

module.exports = mongoose.model("Session", sessionSchema)