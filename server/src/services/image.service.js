const imagekit = require('../config/imagekit')
const sharp = require("sharp");

const uploadImage = async (file, folder = "/orbit") => {
  if (!file) return null;

  const compressedBuffer = await sharp(file.buffer)
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      mozjpeg: true,
    })
    .toBuffer();

  const response = await imagekit.upload({
    file: compressedBuffer,
    fileName: `${Date.now()}-${file.originalname}`,
    folder,
  });

  return {
    imageUrl: response.url,
    imageFileId: response.fileId,
  };
};


const deleteImage = async (fileId) => {
  if (!fileId) {
    return true;
  }

  await imagekit.deleteFile(fileId);

  return true;
};

module.exports = { uploadImage, deleteImage }