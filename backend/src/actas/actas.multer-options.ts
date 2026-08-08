import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

export function actasUploadDir(): string {
  const dir = path.join(
    process.cwd(),
    process.env.UPLOADS_DIR || 'uploads',
    'actas',
  );
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function actasMulterOptions(): MulterOptions {
  const maxSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;

  return {
    storage: diskStorage({
      destination: actasUploadDir(),
      filename: (_req, file, callback) => {
        const ext = path.extname(file.originalname).toLowerCase();
        callback(null, `${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
        callback(
          new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP'),
          false,
        );
        return;
      }
      callback(null, true);
    },
  };
}
