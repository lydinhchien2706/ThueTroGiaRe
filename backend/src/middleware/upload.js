const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const reviewMediaDir = path.join(uploadsDir, 'review-media');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(reviewMediaDir)) {
  fs.mkdirSync(reviewMediaDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reviewMediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `review-${uniqueSuffix}${ext}`);
  }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF) hoặc video (MP4, WebM, MOV)'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Maximum 10 files
  }
});

// Base upload middleware for review media
const uploadReviewMediaBase = upload.array('media', 10);

// Wrapper middleware to handle multer errors with proper error messages
const uploadReviewMedia = (req, res, next) => {
  uploadReviewMediaBase(req, res, (err) => {
    if (err) {
      // Handle multer-specific errors
      if (err instanceof multer.MulterError) {
        let message = 'Lỗi khi tải file lên';
        
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            message = 'File quá lớn. Tối đa 100MB cho mỗi file';
            break;
          case 'LIMIT_FILE_COUNT':
            message = 'Quá nhiều file. Tối đa 10 file';
            break;
          case 'LIMIT_UNEXPECTED_FILE':
            message = 'Tên trường file không đúng. Sử dụng "media" để upload';
            break;
          case 'LIMIT_PART_COUNT':
            message = 'Quá nhiều phần trong form data';
            break;
          case 'LIMIT_FIELD_KEY':
            message = 'Tên trường quá dài';
            break;
          case 'LIMIT_FIELD_VALUE':
            message = 'Giá trị trường quá dài';
            break;
          case 'LIMIT_FIELD_COUNT':
            message = 'Quá nhiều trường trong form';
            break;
          default:
            message = `Lỗi tải file: ${err.code}`;
        }
        
        return res.status(400).json({
          success: false,
          message: message
        });
      }
      
      // Handle file filter errors (wrong file type)
      if (err.message && err.message.includes('Chỉ chấp nhận file')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Handle other errors
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tải file lên. Vui lòng thử lại.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    next();
  });
};

module.exports = {
  uploadReviewMedia,
  upload
};
