const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({
  content: {type: String, required: true, trim: true, maxLength: 500,},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  post: {type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true},
}, {timestamps: true})

commentSchema.index({post: 1, createdAt: -1})

module.exports = mongoose.model("Comment", commentSchema);