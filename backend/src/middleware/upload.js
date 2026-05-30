const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    document: ['.pdf', '.doc', '.docx', '.epub', '.txt'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
  };

  const ext = path.extname(file.originalname).toLowerCase();
  const allAllowed = [...allowedTypes.document, ...allowedTypes.audio];

  if (allAllowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});

module.exports = upload;
