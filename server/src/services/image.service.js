const imagekit = require('../config/imagekit')


const uploadImage = async (file, folder = "/orbit") => {
  if (!file) return null;

  const response = await imagekit.upload({
    file: file.buffer,
    fileName: `${Date.now()}-${file.originalname}`,
    folder,
  })

  return {
    imageUrl: response.url,
    imageFileId: response.fileId,
  }
}


const deleteImage = async (fileId) => {
  if (!fileId) {
    return true;
  }

  await imagekit.deleteFile(fileId);

  return true;
};

module.exports = { uploadImage, deleteImage }