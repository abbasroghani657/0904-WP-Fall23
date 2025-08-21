import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.sqlite');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS selfies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  retention_days INTEGER NOT NULL DEFAULT 30
);

INSERT OR IGNORE INTO settings (id, retention_days) VALUES (1, 30);
`);

export type User = {
  id: number;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: string;
};

export function findUserByEmail(email: string): User | undefined {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  return row as User | undefined;
}

export function findUserById(id: number): User | undefined {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row as User | undefined;
}

export function createUser(email: string, password_hash: string, role: 'user' | 'admin' = 'user'): User {
  const info = db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(email, password_hash, role);
  return findUserById(Number(info.lastInsertRowid)) as User;
}

export function upsertOtp(user_id: number, code: string, ttlSeconds: number): void {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  db.prepare('DELETE FROM otps WHERE user_id = ?').run(user_id);
  db.prepare('INSERT INTO otps (user_id, code, expires_at) VALUES (?, ?, ?)').run(user_id, code, expiresAt);
}

export function verifyOtp(user_id: number, code: string): boolean {
  const row = db.prepare('SELECT code, expires_at FROM otps WHERE user_id = ?').get(user_id) as { code: string; expires_at: string } | undefined;
  if (!row) return false;
  const notExpired = new Date(row.expires_at).getTime() > Date.now();
  const ok = notExpired && row.code === code;
  if (ok) db.prepare('DELETE FROM otps WHERE user_id = ?').run(user_id);
  return ok;
}

export function insertSelfie(user_id: number, file_path: string): void {
  db.prepare('INSERT INTO selfies (user_id, file_path) VALUES (?, ?)').run(user_id, file_path);
}

export function listSelfies() {
  return db.prepare(`
    SELECT s.id, s.file_path, s.created_at, u.email as user_email
    FROM selfies s JOIN users u ON u.id = s.user_id
    ORDER BY s.id DESC
  `).all();
}

export function getRetentionDays(): number {
  const row = db.prepare('SELECT retention_days as d FROM settings WHERE id = 1').get() as { d: number } | undefined;
  return row?.d ?? 30;
}

export function setRetentionDays(days: number): void {
  db.prepare('UPDATE settings SET retention_days = ? WHERE id = 1').run(days);
}

export function cleanupOldSelfies(now: Date = new Date()): void {
  const days = getRetentionDays();
  const cutoffMs = now.getTime() - days * 24 * 60 * 60 * 1000;
  const rows = db.prepare('SELECT id, file_path, created_at FROM selfies').all() as { id:number; file_path:string; created_at:string }[];
  for (const r of rows) {
    const createdMs = new Date(r.created_at).getTime();
    if (createdMs < cutoffMs) {
      try {
        const full = path.join(process.cwd(), r.file_path);
        if (fs.existsSync(full)) fs.unlinkSync(full);
      } catch {}
      db.prepare('DELETE FROM selfies WHERE id = ?').run(r.id);
    }
  }
}

