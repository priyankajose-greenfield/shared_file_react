# LAN Shared JSON Form (Next.js Migration)

Migrated from Vite SPA to **Next.js (App Router)** with **MUI**, **Formik**, **Yup**.

## Features
- Pick a shared `db.json` (File System Access API)
- Offline writes append records directly to that file
- Online submissions currently just log to console (stub for real backend)
- Simple status + connectivity awareness

## Requirements / Constraints
- Modern Chromium-based browser (File System Access API).
- Shared network folder accessible via OS file picker (e.g. `\\192.168.1.10\shared\db.json`).
- Initial file contents must be `[]`.

## Getting Started
```powershell
npm install
npm run dev   # Next.js dev server on http://localhost:3000
```

## Setup Steps
1. On a LAN-accessible machine create folder: `\\192.168.1.10\shared`.
2. Inside create file: `db.json` with content:
   ```json
   []
   ```
3. Ensure read/write access for other LAN users.
4. Each user opens the app and clicks **Pick Shared JSON File** and selects that network file.
5. Submissions while offline append to the shared file; while online they are only logged.

## Limitations
- Browsers cannot silently restore file handle; user must re-pick if permission lost.
- If different users pick different copies, data diverges.
- Not a conflict-free system: simultaneous writes could race (small risk in casual use).

## Future Enhancements (Optional)
- Real API endpoint for online mode.
- Synchronization / merge logic.
- Service Worker for installable offline app.
- Handle write contention (locking or retry).

## Tech Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- MUI (Material UI) + Emotion
- Formik + Yup

## Scripts
- `dev` – start Next.js dev server
- `build` – production build
- `start` – run production build
- `typecheck` – run TypeScript without emit
- `dev:vite-legacy` – legacy original dev (will be removed later)

## File System Access Notes
Permission persists while tab/session remains active. If handle becomes invalid (moved/renamed), user must re-select.

---
MIT License
