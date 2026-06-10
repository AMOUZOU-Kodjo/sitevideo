const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac',
  'text/plain'
];

const MAX_SIZE = 100 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    const imgTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return imgTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Thumbnail must be an image (jpg, png, webp, gif).'), false);
  }
  ALLOWED_MIMES.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('File type not allowed.'), false);
};

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

const getFolder = (fieldname, mimetype) => {
  if (fieldname === 'thumbnail') return 'sitevideo/thumbnails';
  if (mimetype?.startsWith('audio')) return 'sitevideo/audio';
  return 'sitevideo/documents';
};

const uploadToCloudinary = (buffer, mimetype, fieldname) => {
  return new Promise((resolve, reject) => {
    const isPdf = mimetype === 'application/pdf';
    const isAudio = mimetype?.startsWith('audio');
    const isThumb = fieldname === 'thumbnail';

    let resourceType;
    let format;

    if (isThumb || isPdf) {
      resourceType = 'image';
      format = isPdf ? 'pdf' : undefined;
    } else if (isAudio) {
      resourceType = 'video';
      format = mimetype.split('/')[1];
    } else {
      resourceType = 'raw';
      format = undefined;
    }

    const ext = mimetype.split('/')[1]?.replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx').replace('msword', 'doc') || 'bin';
    const base = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const publicId = `${getFolder(fieldname, mimetype)}/${base}`;

    const uploadOptions = { resource_type: resourceType, public_id: publicId, folder: false };
    if (format) uploadOptions.format = format;

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

const getThumbnailUrl = (fileUrl, resourceType) => {
  if (!fileUrl || resourceType !== 'image') return null;
  try {
    return fileUrl.replace('/image/upload/', '/image/upload/w_400,h_550,c_fit,pg_1,f_jpg,q_70/');
  } catch { return null; }
};

const uploadFields = (fieldConfig) => async (req, res, next) => {
  upload.fields(fieldConfig)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({ error: 'File exceeds 100MB limit.' });
      return res.status(400).json({ error: 'Upload error: ' + err.message });
    }
    if (err) return res.status(400).json({ error: err.message });

    const fields = Object.keys(fieldConfig);
    for (const field of fields) {
      if (!req.files?.[field]) continue;
      const file = req.files[field][0];
      try {
        const result = await uploadToCloudinary(file.buffer, file.mimetype, field);
        req.files[field][0].cloudinaryUrl = result.secure_url;
        req.files[field][0].cloudinaryId = result.public_id;
        req.files[field][0].resourceType = result.resource_type;
        if (field === 'file' && result.resource_type === 'image') {
          req.files[field][0].thumbnailUrl = getThumbnailUrl(result.secure_url, result.resource_type);
        }
      } catch (uploadErr) {
        console.error(`Cloudinary upload FAILED for ${field}:`, uploadErr.message);
        return res.status(500).json({ error: 'Failed to store file. Please try again.' });
      }
    }
    next();
  });
};

module.exports = { uploadFields, cloudinary, getThumbnailUrl };
