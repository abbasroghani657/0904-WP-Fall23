import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById, upsertOtp, verifyOtp } from './db';
import { setAuthCookie, signAuthToken, clearAuthCookie, requireAuth } from './auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  admin: z.boolean().optional(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, admin } = parsed.data;
  const existing = findUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const password_hash = await bcrypt.hash(password, 10);
  const user = createUser(email, password_hash, admin ? 'admin' : 'user');
  res.json({ id: user.id, email: user.email });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  upsertOtp(user.id, otp, 300);
  // Demo: return the OTP in response (in real systems, send via email/SMS)
  res.json({ userId: user.id, otp });
});

const otpSchema = z.object({ userId: z.number(), code: z.string().length(6) });
router.post('/verify-otp', (req, res) => {
  const parsed = otpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { userId, code } = parsed.data;
  const isOk = verifyOtp(userId, code);
  if (!isOk) return res.status(401).json({ error: 'Invalid or expired OTP' });
  const user = findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const role = user.role;
  const token = signAuthToken({ userId, role });
  setAuthCookie(res, token);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth as any, (req, res) => {
  const { userId } = (req as any).user as { userId: number };
  const user = findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, role: user.role });
});

export default router;

