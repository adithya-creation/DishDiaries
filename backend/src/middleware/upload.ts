import multer from 'multer';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

// Use memory storage so we can stream directly to Cloudinary without writing to disk
const storage = multer.memoryStorage();

const imageFileFilter: multer.Options['fileFilter'] = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

export const uploadImageSingle = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFileFilter
}).single('image');


