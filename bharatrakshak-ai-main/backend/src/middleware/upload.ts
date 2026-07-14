import multer from 'multer';
import { UPLOAD } from '../constants';
import { ApiError } from '../utils/ApiError';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedTypes: string[] = [...UPLOAD.ALLOWED_IMAGE_TYPES, ...UPLOAD.ALLOWED_VIDEO_TYPES];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed. Allowed: ${allowedTypes.join(', ')}`));
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE, files: UPLOAD.MAX_FILES },
});

export const uploadSingleImage = multer({
  storage,
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if ((UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
