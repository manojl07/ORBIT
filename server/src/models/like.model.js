const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
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

// Prevent duplicate likes by the same user on the same post.
likeSchema.index(
  {
    user: 1,
    post: 1,
  },
  {
    unique: true,
  }
);

// Optimize retrieving a user's likes by creation time.
likeSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Like", likeSchema);