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
      enum: ["emailVerification", "passwordReset",],
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

/*
 * Automatically remove expired tokens.
 * MongoDB periodically removes documents whose
 * expiresAt value has passed.
 */
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/*
 * Makes deleting/replacing a user's token
 * for a specific token type efficient.
 */
authTokenSchema.index({ user: 1, type: 1, });

const AuthToken = mongoose.models.AuthToken || mongoose.model("AuthToken", authTokenSchema);

module.exports = AuthToken;