const imagekit = require('../config/imagekit')


const uploadImage = async(file) => {
  if(!file) return null;

  const response = await imagekit.upload({
    file: file.buffer,
    fileName: `${Date.now()}-${file.originalname}`,
    folder: '/orbit/profile-images'
  })

  return response.url;
}

module.exports = {uploadImage}