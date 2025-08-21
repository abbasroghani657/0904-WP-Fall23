import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

import authRoutes from './routes.auth';
import selfieRoutes from './routes.selfie';
import adminRoutes from './routes.admin';

app.use('/api/auth', authRoutes);
app.use('/api/selfie', selfieRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
