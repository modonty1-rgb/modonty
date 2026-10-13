<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Golden rule — local servers

Start this app only from its own interactive terminal with `pnpm dev -p 3001`.
Never substitute the raw `next` binary, detached `Start-Process`, or a hidden
background server. Never stop or restart a user-run server unless the user explicitly asks.

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

## Golden rule — never push without explicit approval

Never `git push` to `main` (or any remote branch), merge, or alter production
data without the user's fresh, explicit instruction in that exact moment
("ادفع" / "push" / "ارفع"). Approval for one task is not approval for the
next. Commit locally as you go — that's fine — but the push itself always
waits for the user's word. A live ad campaign may be depending on `main`
staying exactly as it is until told otherwise.
