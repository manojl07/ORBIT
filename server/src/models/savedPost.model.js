const mongoose = require("mongoose");

const savedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user may save a particular post only once.
savedPostSchema.index(
  { user: 1, post: 1 },
  { unique: true }
);

// Efficiently paginate one user's saved collection.
savedPostSchema.index({
  user: 1,
  createdAt: -1,
});

const SavedPost =
  mongoose.models.SavedPost ||
  mongoose.model("SavedPost", savedPostSchema);

module.exports = SavedPost;