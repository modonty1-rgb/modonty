# MODONTY Preflight Checklist

> Run this checklist **BEFORE** and **AFTER** every code task. If ANY item fails → STOP and fix before proceeding.

---

## 1. Gatekeeper Rules (BEFORE writing code)

### RULE 1: ZERO GUESSING

- [ ] Verified API/function/prop against **official docs** (not memory)
- [ ] Confirmed syntax matches the **installed version** in `package.json`
- [ ] Did NOT invent any function, parameter, or prop

### RULE 2: EXPERT BEHAVIOR

- [ ] Decided and executed (no unnecessary "A or B?" questions)
- [ ] If a better approach exists → implemented it with brief explanation
- [ ] Comments: 1-2 lines max, only on complex logic

### RULE 3: OFFICIAL DOCS ONLY

- [ ] **Step 1**: Read official docs of the package
- [ ] **Step 2**: Verified API matches installed version in `package.json`
- [ ] **Step 3**: Checked integration guide with current Next.js 16.x
- [ ] **Step 4**: Checked breaking changes / migration guide if version changed

**Trusted sources (in order):**

1. Package official docs
2. nextjs.org/docs
3. Vercel react-best-practices
4. GitHub release notes
5. TypeScript handbook

**Banned:** Memory, unverified Stack Overflow, random repos, Medium/Dev.to, "it used to work before"

### RULE 4: PHASE LARGE TASKS

- [ ] Task is small (single-line fix, text change, rename) → skip phasing
- [ ] Task is large/sensitive → split into phases:

```
📋 Phase N/total: [description]
→ Files: [affected files]
→ Verify: [how to confirm it works]
```

- [ ] Plan presented BEFORE starting, approval received
- [ ] `pnpm tsc --noEmit` after each phase
- [ ] `pnpm build` only in final phase
- [ ] Never touched code from a previous phase unless fixing a bug

---

## 2. Delivery Checklist (AFTER writing code)

### TypeScript & Lint

- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] ESLint → zero warnings
- [ ] Zero `any` / `unknown` types
- [ ] Import order correct (React → External → Internal → Types → Relative)
- [ ] Direct imports only (no barrel imports from large libs)

### App Router

- [ ] `loading.tsx` exists for every new route (shadcn Skeleton)
- [ ] `error.tsx` exists for important routes
- [ ] Visitor page: Server Components + `dynamic()` for client parts
- [ ] Admin page: Server when possible, client as needed
- [ ] `'use client'` only where needed (useState, useEffect, handlers, browser APIs)

### Data & Mutations

- [ ] Zod schema for every input
- [ ] `auth()` or `protectedProcedure` for every authenticated operation
- [ ] Prisma: `select` specific fields (never `include` full relations)
- [ ] Prisma: `take` always set (never fetch all records)
- [ ] `revalidatePath()` or `revalidateTag()` after every mutation
- [ ] No sequential awaits for independent data → `Promise.all()`

### Security

- [ ] Security headers in `next.config`
- [ ] No secrets in `NEXT_PUBLIC_*` env vars
- [ ] Server Actions have `auth()` check first
- [ ] Server-side Zod validation (client-side is UX only)

### UI / RTL

- [ ] Responsive on mobile (mobile-first Tailwind)
- [ ] RTL classes: `ps-` `pe-` `ms-` `me-` `start` `end` `gap-`
- [ ] Never: `pl-` `pr-` `ml-` `mr-` `left` `right` `text-left`
- [ ] Directional icons: `className="rtl:rotate-180"`

### Code Quality

- [ ] Short comments on complex parts only
- [ ] Zero dead code / unused imports
- [ ] Zero `console.log` in production
- [ ] Every line has a purpose

---

## 3. Anti-Patterns (NEVER do these)

| # | Bad | Good |
|---|-----|------|
| 1 | `useEffect` + `fetch` in Client Component | Server Component or tRPC |
| 2 | Deep prop drilling | Context or Server Component direct fetch |
| 3 | API route calling another API route | Call function directly |
| 4 | `'use client'` on entire page | Server page + small Client children |
| 5 | Sequential awaits for independent data | `Promise.all()` |
| 6 | Barrel imports from large libs | Direct imports |
| 7 | `any` / `unknown` types | Define proper interfaces |
| 8 | `console.log` in production | Remove or dev-only logger |
| 9 | Mutation without revalidate | Always `revalidatePath/Tag` |
| 10 | Secrets in `NEXT_PUBLIC_*` | Server-only env vars |
| 11 | Prisma `include` (full relations) | `select` specific fields |
| 12 | CSS `pl-` / `pr-` / `left` / `right` | `ps-` / `pe-` / `start` / `end` |
| 13 | Server Action without auth | Always `auth()` first |
| 14 | Missing `loading.tsx` | Mandatory Skeleton per route |

---

## 4. Absolute Rules

- Never invent APIs, functions, or props not in official docs
- Never use technologies outside the declared stack without approval
- Never add dead code, "just in case" code, or unused imports
- Never modify working code that wasn't requested
- Never delete existing code unless explicitly requested
- Simplest working solution = best solution (KISS + SOLID)
- DRY — reuse existing logic, never duplicate
- Every line of code must have a purpose

---

## 5. Stack Reference

```
Next.js 16.x (App Router) | React 19 | TypeScript (strict: true)
Prisma + MongoDB | shadcn/ui | Tailwind CSS
Zod | React Hook Form | next-intl (ar/en)
pnpm | Vercel | Turbopack
Fonts: Montserrat (Latin) + Tajawal (Arabic) | Direction: RTL-first
```

> NEVER suggest or use technologies outside this stack without explicit approval.
