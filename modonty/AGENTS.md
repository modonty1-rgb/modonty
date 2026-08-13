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
