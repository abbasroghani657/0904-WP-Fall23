# Alahad Bank Demo (Consent-based KYC Selfie)

A compliant, educational banking demo that implements:
- Register/Login with OTP-based 2FA
- Explicit consent-based selfie capture using the browser camera
- Secure server-side storage of images tied to user session
- Admin dashboard for viewing consented selfies
- Data-retention setting and Privacy/Terms pages

## Stack
- Client: React (Vite + TypeScript), Tailwind CSS v4
- Server: Node.js, Express (TypeScript), SQLite (better-sqlite3), JWT cookies

## Prerequisites
- Node.js 18+ (recommended 20+)
- npm

## Quick Start
Open two terminals.

Terminal A (Server):
```bash
cd server
cp .env.example .env   # optional, but recommended
npm install
npm run dev
# API will start at http://localhost:4000
```

Terminal B (Client):
```bash
cd client
npm install
npm run dev
# App will start at http://localhost:5173
```

Open the app at http://localhost:5173

## Typical Flow
1. Register a user on the landing page (check "Register as admin" to create an admin for demo).
2. Login with your email/password. The demo returns an OTP in the UI (for education only; real systems send OTP via email/SMS).
3. Enter OTP to complete login. You can then go to the Selfie page.
4. On the Selfie page, you must explicitly consent. After consenting, the browser will prompt for camera access. Capture and upload a single selfie.
5. If you logged in as an admin, open Admin to see uploaded selfies and Admin Settings to configure retention.
6. See Privacy and Terms pages in the header.

## Server Configuration
Create `server/.env` (optional; defaults are okay for local dev):
```
JWT_SECRET=change-me
PORT=4000
```
- CORS is configured to allow `http://localhost:5173`. If you change the client port, update `server/src/index.ts` accordingly.
- Uploaded files are stored under `uploads/`. The SQLite database is under `data/app.sqlite`.

## API Overview
- Auth
  - POST `/api/auth/register` { email, password, admin? }
  - POST `/api/auth/login` { email, password } → { userId, otp }
  - POST `/api/auth/verify-otp` { userId, code } → sets httpOnly auth cookie
  - GET `/api/auth/me` → current user
  - POST `/api/auth/logout`
- Selfie (requires auth)
  - POST `/api/selfie/consented` multipart form field `selfie` → stores image
- Admin (requires admin)
  - GET `/api/admin/selfies` → list consented selfies
  - GET `/api/admin/settings` → { retentionDays }
  - POST `/api/admin/settings` { retentionDays } → also triggers cleanup

## Data Retention
- Admins can set the retention window (in days). A cleanup runs on save and removes expired files and DB rows.

## Security and Ethics
- This demo explicitly obtains consent before accessing the camera and clearly informs the user.
- Do not use hidden or deceptive capture. This project is for educational purposes only.
- Not production-ready: no rate limiting, email delivery, or hardened configs.

## Troubleshooting
- Port already in use: change client (`5173`) or server (`4000`) or stop running instances.
- Camera permission denied: the browser will block capture; re-allow via site settings.
- Node version errors: upgrade Node to 18+.

## Scripts
- Server: `npm run dev` (ts-node + nodemon), `npm run build`, `npm start`
- Client: `npm run dev`, `npm run build`, `npm run preview`