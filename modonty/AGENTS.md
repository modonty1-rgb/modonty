# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in
`node_modules/next/dist/docs/` before writing code, and heed deprecation notices.

# Shared working protocol — Codex + Claude

This repository is a local UI/UX refactor workspace. It is deliberately separate
from the original production project. Never modify, push to, or deploy the
original project from this workspace.

## Always-on rules

- `do` / `نفّذ`: implement the agreed recommendation.
- `confirm`: update project documentation only, unless the user explicitly asks
  for code changes too.
- Verify before claiming. For externally changeable facts and package APIs, use
  official documentation; do not guess.
- For a strategic or multi-file design decision: discuss and obtain `do` before
  editing. For a narrow approved UI change: implement directly.
- Use the existing stack only: Next.js, TypeScript, Tailwind, shadcn/ui, Prisma.
- Keep components small, explicit, and reusable. KISS/SOLID, no dead code and no
  unnecessary client-side JavaScript.
- Never push, commit, delete material files, or connect to production data without
  fresh explicit user approval.
- **Golden rule — local servers:** Start an app only from its own interactive terminal
  with `pnpm dev -p <port>` (for example, `pnpm dev -p 3000` in `modonty`). Never
  substitute the raw `next` binary, detached `Start-Process`, or a hidden background
  server. Never stop or restart a user-run server unless the user explicitly asks.
- Run type checks, builds, or browser automation only when the user says
  `تحقق`, `check`, `pl>`, or otherwise asks for verification.

## Shared shortcuts

- `hh>`: resume only. Read `documents/context/SESSION-LOG.md`, then
  `documents/tasks/PENDING-IDEAS-TODO.md`, then reconcile with `git status` and
  `git log -1`. Report the current state and stop; do not begin implementation.
- `us>`: freeze the current session. Prepend a complete handoff block to
  `documents/context/SESSION-LOG.md`: where work stopped, completed work,
  decisions, pending items, files touched, verification state, and git state.
- `reminder <text>`: append the text to `documents/tasks/PENDING-IDEAS-TODO.md`
  and confirm in one line.
- `مهام معلقة`: list the open items from `documents/tasks/PENDING-IDEAS-TODO.md`.
- `pl>`: inspect the currently focused local application in a browser and show a
  fresh snapshot; do not edit code unless separately asked.
- `ss>`: answer in 1–3 short sentences.
- `tr>`: rewrite the previous Arabic response in clear human Arabic, avoiding
  unnecessary English within Arabic prose.

## Continuity files

- `documents/context/SESSION-LOG.md` is the single source of truth across
  restarts. Newest session comes first; do not overwrite older entries.
- `documents/tasks/PENDING-IDEAS-TODO.md` contains open decisions only. Move
  completed work to the session log, not to this file.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Golden rule — before deleting, renaming, or changing the export of any file

A broken build (`cta-tracked-link.tsx` still importing a deleted
`IntentLink.tsx`) was caused by skipping this. Never again:

1. Before deleting a file, renaming an exported symbol, or moving a file's
   export, search the **whole monorepo** for every import of it — not just
   this app:
   ```
   grep -rln "<ExportName>" admin console modonty payment shared --include="*.tsx" --include="*.ts"
   ```
2. Fix or update every match the search returns. "I changed the 3 files I
   was looking at" is not done if a 4th file still imports the old name.
3. After the change, actually load the affected route(s) in the browser (or
   run a build) and confirm there is no "Module not found" / type error
   before calling the task finished. A clean diff is not proof; a clean
   build/page load is.
4. Same rule for deleting a route folder, an API handler, or a Prisma field —
   grep the whole repo, not just the folder you are editing.

## Golden rule — sync before you start, every session

A checkout drifted 58 commits behind `origin/main` while being worked on
locally (never pulled, never pushed). The result: a whole landing page
(`/start`, `/start2`) silently didn't exist here, so a third one (`/start3`)
got built from scratch, duplicating already-shipped work, and a shared file
(`next.config.ts`) got edited on two diverging histories at once.

1. **At the start of every session, before editing anything:**
   `git fetch origin && git log --oneline HEAD..origin/main | wc -l`
   If that number is not `0`, STOP and tell the user before writing any code —
   do not build on a stale checkout.
2. If there are uncommitted local changes blocking a clean pull, do not discard
   them and do not force anything. Commit them to a dated side branch first
   (`git checkout -b local-wip-<date>`, `git add -A`, `git commit`), THEN
   switch back and pull `main` clean. Nothing is ever lost; it is just not
   mixed into a stale base.
3. Never assume a route, component, or config change exists or doesn't exist
   from memory — check it in the current, freshly-pulled tree.
