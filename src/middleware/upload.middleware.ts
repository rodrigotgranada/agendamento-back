import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.id;
    const uploadPath = path.join(__dirname, '..', 'uploads', userId);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, 'profile.jpg');
  },
});

const upload = multer({ storage });

@Injectable()
export class UploadMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload.single('photo')(req, res, function (err) {
      if (err) {
        return res.status(400).send({ message: err.message });
      }
      next();
    });
  }
}
