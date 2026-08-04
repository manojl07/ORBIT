const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  caption: { type: String, trim: true, maxLength: 2200, default: "" },
  imageUrl: { type: String, required: true },
  imageFileId: {type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true},
  likesCount: {type: Number, default: 0},
  commentsCount: {type: Number, default: 0},
  isEdited: {type: Boolean, default: false},
}, {
  timestamps: true,
})

postSchema.index({
  user: 1,
  createdAt: -1,
})

module.exports = mongoose.model("Post", postSchema)