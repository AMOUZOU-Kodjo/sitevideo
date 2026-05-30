const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.toLowerCase().match(/\.(\w+)$/)?.[1];

  if (file.fieldname === 'thumbnail') {
    const imageTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (imageTypes.includes(ext)) return cb(null, true);
    return cb(new Error('Thumbnail must be an image (jpg, png, webp, gif).'), false);
  }

  const allowed = ['pdf', 'doc', 'docx', 'epub', 'txt', 'mp3', 'wav', 'ogg', 'm4a', 'aac'];
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error(`File type .${ext} is not allowed.`), false);
};

const getFolder = (fieldname, mimetype) => {
  if (fieldname === 'thumbnail') return 'sitevideo/thumbnails';
  if (mimetype?.startsWith('audio')) return 'sitevideo/audio';
  return 'sitevideo/documents';
};

const getResourceType = (fieldname, mimetype) => {
  if (fieldname === 'thumbnail') return 'image';
  if (mimetype?.startsWith('audio')) return 'video';
  return 'raw';
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const base = file.originalname.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '_').substring(0, 40);
    return {
      folder: getFolder(file.fieldname, file.mimetype),
      resource_type: getResourceType(file.fieldname, file.mimetype),
      public_id: `${Date.now()}_${base}`
    };
  }
});

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = upload;
