# AI Coding Agent Instructions (Project: LAN Shared JSON Form - Next.js)

Purpose: Next.js + MUI + Formik/Yup app that appends submissions to a shared LAN `db.json`, always writing locally first; if online also POSTs to a stub API.

## Current Architecture Snapshot
-- App Router: `app/layout.tsx` (theme) -> `app/page.tsx` (client component with form & logic).
-- API route: `app/api/submit/route.ts` (stub echo/console logging).
-- File system utilities in `lib/fsAccess.ts` (browser-only; marker only, no silent restore).
- No global state manager; local React `useState` sufficient.
- TypeScript strict mode enabled via `tsconfig.json`.

## Key Patterns & Conventions
- Always append locally (`writeDb`) then attempt POST if online.
- Validation & state: Formik + Yup; new field requires update to `validationSchema`, `initialValues`, and MUI field list in `page.tsx`.
- Status kept as simple string; extend only once multi-phase sync is added.
- Connectivity events for future background sync reuse.

## File System Access Considerations
- No silent rehydrate; marker prompts re-pick.
- Identical path selection required across users.
- Full rewrite per append; large file strategy not yet implemented.

## Adding Features
- New field: extend schema + form component list.
- Real backend: implement logic inside `app/api/submit/route.ts` (validate, persist).
- Sync-on-online queue: maintain pending list, replay on `online` event.

## Quality & Style
- Keep components under ~200 LOC; extract hooks when logic grows (e.g., `useConnectivity`, `useSharedFile` if expanded).
- Explicit function return types for exported utilities in `fsAccess.ts`.
- JSON writes are always pretty-printed (`JSON.stringify(data, null, 2)`) to keep manual inspection easy; preserve this unless size becomes an issue.

## Structure
```
app/
  layout.tsx
  page.tsx
  api/submit/route.ts
lib/
  fsAccess.ts
```

## Testing (Not Implemented Yet)
- Jest / Vitest + RTL: mock FS handles (`getFile`, `createWritable`).
- Cases: offline append, online append + POST, validation error display.

## Common Pitfalls
- Using FS API during SSR (keep in client components only).
- Concurrent submissions (serialize writes with await).
- Large JSON performance (consider log + compaction later).

## Incremental Enhancements
1. Service worker for offline shell.
2. Merge / conflict detection with hash baseline.
3. Pending queue + retry.
4. File size threshold + archive rotation.

## Agent Task Flow
1. Determine concern: form / FS / sync / API.
2. Modify focused module (`app/page.tsx`, `lib/fsAccess.ts`, or API route).
3. Keep FS logic isolated; avoid server usage of browser-only APIs.
4. Update README + this file on user-facing workflow changes.

---
Revise this file as architecture evolves (e.g., after adding API layer or hooks extraction).
