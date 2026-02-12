---
name: Server-Side Session Migration
overview: Migrate from next-auth SessionProvider to server-fed session via auth(). Remove Date.now() prerender error. Delete all dead code. Plan verified against Auth.js and Next.js official docs.
todos:
  - id: create-context
    content: Create SessionContext.tsx with provider and useSession hook
  - id: update-layout
    content: Make layout async, fetch auth(), use custom SessionProvider
  - id: migrate-imports
    content: Update 18 files to import useSession from SessionContext
  - id: delete-dead
    content: Delete SessionProvider.tsx and SessionWrapper.tsx
  - id: verify-build
    content: Run npx next build and verify no dead code remains
isProject: false
---

# Server-Side Session Migration Plan (Verified)

## Official Doc Verification

### Auth.js (authjs.dev)

- **Get Session**: "Typically, you'll want to take full advantage of server-side rendering." Recommends `auth()` in server components.
- **signIn/signOut**: Work standalone from `next-auth/react`—no SessionProvider required. Docs show `signIn()` and `signOut()` as client-side standalone functions.
- **useSession**: Requires SessionProvider when using next-auth's hook. We avoid this by creating our own hook that reads from a simple context.

### Next.js (nextjs.org)

- **Layout**: Can be `async`. Docs show `export default async function Layout({ children })` with `await` for data fetching.
- **Layout data**: Can fetch and pass to child components (e.g. `getUser()` then `<UserName user={user.name} />`). Same pattern for session.

### Project State

- `auth()` from [lib/auth.ts](modonty/lib/auth.ts) returns `Session | null`—same shape as `useSession().data`.
- [auth.config.ts](modonty/auth.config.ts) enriches session with `user.id`, `hasPassword`, `role`, `createdAt`.
- No usage of `useSession().update()` in codebase.
- `signIn`/`signOut` used in: LoginButton, ChatSheet, lib/logout, login page, register-form—all keep `next-auth/react` import.

---

## Dead Code Removal (Explicit)

| Action | File | Reason |
|--------|------|--------|
| DELETE | [components/providers/SessionProvider.tsx](modonty/components/providers/SessionProvider.tsx) | Replaced by custom SessionContext provider |
| DELETE | [components/providers/SessionWrapper.tsx](modonty/components/providers/SessionWrapper.tsx) | Unused; layout uses SessionProvider directly |

Pre-delete check: Only layout.tsx and SessionWrapper.tsx import SessionProvider. SessionWrapper is never imported anywhere.

---

## Implementation Steps

### Step 1: Create SessionContext

**New file:** `modonty/components/providers/SessionContext.tsx`

```tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Session } from "next-auth";

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ session, children }: { session: Session | null; children: ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  return {
    data: session,
    status: session ? ("authenticated" as const) : ("unauthenticated" as const),
  };
}
```

- No `Date.now()`, no next-auth sync logic.
- Type `Session` from `next-auth` for compatibility.

### Step 2: Update layout

**File:** [app/layout.tsx](modonty/app/layout.tsx)

- Add `import { auth } from "@/lib/auth";`
- Add `import { SessionProvider } from "@/components/providers/SessionContext";`
- Remove `import { SessionProvider } from "@/components/providers/SessionProvider";`
- Make default export `async`
- Add `const session = await auth();` at top
- Replace `<SessionProvider session={null}>` with `<SessionProvider session={session}>`

### Step 3: Migrate useSession imports (20 files)

Change:
```ts
import { useSession } from "next-auth/react";
```
To:
```ts
import { useSession } from "@/components/providers/SessionContext";
```

**Files:**
- components/TopNav.tsx
- components/auth/UserMenu.tsx
- components/chatbot/ChatSheet.tsx (keep `signIn` from next-auth/react)
- app/articles/[slug]/components/article-interaction-buttons.tsx
- app/clients/[slug]/components/client-follow-button.tsx
- app/users/profile/page.tsx
- app/users/profile/settings/page.tsx
- app/users/profile/settings/components/create-password-prompt.tsx
- app/users/profile/settings/components/account-settings.tsx
- app/users/profile/settings/components/preferences-settings.tsx
- app/users/profile/settings/components/notifications-settings.tsx
- app/users/profile/settings/components/privacy-settings.tsx
- app/users/profile/settings/components/security-settings.tsx
- app/users/profile/settings/components/profile-settings.tsx
- app/users/profile/following/page.tsx
- app/users/profile/favorites/page.tsx
- app/users/profile/disliked/page.tsx
- app/users/profile/liked/page.tsx
- app/users/profile/comments/page.tsx
- app/users/register/page.tsx

**ChatSheet.tsx:** Update to `import { useSession } from "@/components/providers/SessionContext"` and `import { signIn } from "next-auth/react"` (separate import).

### Step 4: Delete dead code

1. Delete `modonty/components/providers/SessionProvider.tsx`
2. Delete `modonty/components/providers/SessionWrapper.tsx`

### Step 5: Verification

- `npx next build` passes (no Date.now() prerender error)
- `rg "SessionProvider|SessionWrapper" modonty` → 0 matches
- `rg "from \"next-auth/react\"" modonty` → only signIn, signOut (no useSession)

---

## Behavior Changes

| Aspect | Before | After |
|--------|--------|-------|
| Session refresh | next-auth refetches on focus/interval | Page refresh or router.refresh() |
| Tab sync | Automatic | Manual refresh |
| status "loading" | During client fetch | Not used; session from server on first paint |

Per Auth.js docs, server-side session is preferred; these trade-offs are acceptable.
