# MODONTY project rules

## Stack
Next.js App Router, React, TypeScript strict, tRPC, Prisma + MongoDB, shadcn/ui, Tailwind, Zod, React Hook Form, next-intl, pnpm, Vercel. Arabic-first, RTL-first. Do not introduce another stack without approval.

## Implementation
- Default to Server Components. Keep client boundaries small; never expose secrets or database access to client code.
- Validate all server inputs with Zod. Select only needed Prisma fields and limit reads.
- Revalidate relevant paths/tags after mutations.
- Use shared data-layer code for shared behavior; do not duplicate business logic.
- For customer-facing UI, use Tajawal for Arabic, support RTL, provide loading/error/empty states, and use shadcn components already in the shared project.

## Evidence gates
- Before changing code, inspect the relevant implementation and data path.
- Before package/API work, verify current official docs with Context7 or the official source.
- Verify runtime behavior for user-facing changes; do not rely only on compilation.
- Never fabricate external analytics, campaign, SEO, or Meta data. Report only retrieved source data and label gaps.

## Delivery and Git
- Do not push, merge, deploy, migrate, seed, or alter production data without a direct request.
- When asked to verify, use the smallest affected sample first; do not run browser automation repeatedly without a new reason.
- Keep TODO files for open work only; move verified completed work out of active lists.

Detailed technical rules and examples are archived at `documents/context/claude-memory-archive/2026-09-06/` and should be opened only for a task that needs them.
