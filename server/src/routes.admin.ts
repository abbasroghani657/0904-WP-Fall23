import { Router } from 'express';
import { listSelfies, getRetentionDays, setRetentionDays, cleanupOldSelfies } from './db';
import { requireAuth, requireAdmin } from './auth';
import { z } from 'zod';

const router = Router();

router.get('/selfies', requireAuth as any, requireAdmin as any, (_req, res) => {
  const rows = listSelfies();
  res.json({ rows });
});

router.get('/settings', requireAuth as any, requireAdmin as any, (_req, res) => {
  res.json({ retentionDays: getRetentionDays() });
});

const setSchema = z.object({ retentionDays: z.number().min(1).max(365) });
router.post('/settings', requireAuth as any, requireAdmin as any, (req, res) => {
  const parsed = setSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  setRetentionDays(parsed.data.retentionDays);
  cleanupOldSelfies();
  res.json({ ok: true });
});

export default router;

