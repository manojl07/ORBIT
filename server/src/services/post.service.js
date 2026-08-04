const Post = require("../models/post.model")
const ApiError = require("../utils/ApiError")
const {uploadImage} = require("../services/image.service")


const createPost = async({caption, image, userId}) => {
  if(!image){
    throw new ApiError(400, "Image is required")
  }

  const uploadedImage = await uploadImage(image, "/orbit/post-images");

  console.log(uploadedImage);

  const post = await Post.create({
    caption,
    imageUrl: uploadedImage.imageUrl,
    imageFileId: uploadedImage.imageFileId,
    user: userId,
  })

  return post;
}

module.exports = {createPost}