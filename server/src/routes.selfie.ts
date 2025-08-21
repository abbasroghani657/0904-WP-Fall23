import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { insertSelfie } from './db';
import { requireAuth } from './auth';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

const router = Router();

router.post('/consented', requireAuth as any, upload.single('selfie'), (req, res) => {
  const userId = (req as any).user.userId as number;
  const filePath = path.relative(process.cwd(), (req.file as Express.Multer.File).path);
  insertSelfie(userId, filePath);
  res.json({ ok: true, filePath });
});

export default router;

