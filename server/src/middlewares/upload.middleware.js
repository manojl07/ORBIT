const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".jfif",
  ".bmp",
  ".svg",
  ".avif",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const isImageMime = file.mimetype.startsWith("image/");
    const isGenericMime = file.mimetype === "application/octet-stream";

    if (
      isImageMime ||
      (isGenericMime && allowedExtensions.includes(ext))
    ) {
      return cb(null, true);
    }

    cb(new Error("Only images are allowed"));
  },
});

module.exports = upload;