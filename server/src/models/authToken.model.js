const mongoose = require("mongoose");

const authTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: [
        "emailVerification",
        "passwordReset",
        "googlePasswordSetup",
      ],
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB automatically removes expired token documents periodically.
authTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Efficiently find or replace a user's token for a specific purpose.
authTokenSchema.index({
  user: 1,
  type: 1,
});

const AuthToken =
  mongoose.models.AuthToken ||
  mongoose.model("AuthToken", authTokenSchema);

module.exports = AuthToken;