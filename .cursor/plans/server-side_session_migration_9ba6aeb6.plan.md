---
name: Server-Side Session Migration
overview: Migrate from next-auth SessionProvider + useSession (client-side) to server-side auth() with a custom session context. Remove SessionProvider from layout to fix the Date.now() prerender error. Explicitly delete all replaced/unused code—no dead code left behind.
todos: []
isProject: false
---

# Server-Side Session Migration Plan

## Goal

Replace next-auth's `SessionProvider` with a server-fed session approach. Remove all dead code: delete `SessionProvider.tsx`, `SessionWrapper.tsx`, and any orphaned imports.

## Dead Code Removal (Explicit)


| Action     | File                                                                                         | Reason                                                                    |
| ---------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **DELETE** | [components/providers/SessionProvider.tsx](modonty/components/providers/SessionProvider.tsx) | Replaced by custom SessionContext provider                                |
| **DELETE** | [components/providers/SessionWrapper.tsx](modonty/components/providers/SessionWrapper.tsx)   | Never used; layout uses SessionProvider directly; logic inlined in layout |


**Pre-delete verification:** Only `layout.tsx` and `SessionWrapper.tsx` import SessionProvider. SessionWrapper is unused. After migration, no file will reference these.

## Implementation Steps

### Step 1: Create custom session context

**New file:** `modonty/components/providers/SessionContext.tsx`

- `SessionContext` (React.createContext)
- `SessionProvider` component (receives `session` prop, provides via context)
- `useSession` hook returning `{ data, status }`
- `"use client"` directive

### Step 2: Update layout

**File:** [app/layout.tsx](modonty/app/layout.tsx)

- Make layout `async`
- `const session = await auth()`
- Replace `SessionProvider` import: `from "@/components/providers/SessionContext"`
- Remove `from "@/components/providers/SessionProvider"`

### Step 3: Migrate all useSession consumers

Change import in **18 files** from:

```ts
import { useSession } from "next-auth/react";
```

to:

```ts
import { useSession } from "@/components/providers/SessionContext";
```

Files: TopNav, UserMenu, ChatSheet, article-interaction-buttons, client-follow-button, profile page, profile/settings (page + 7 components), profile/following, favorites, disliked, liked, comments, register page.

Keep `signIn` and `signOut` from `next-auth/react` where used (LoginButton, ChatSheet, logout, login, register-form).

### Step 4: Delete dead code

1. **Delete** `modonty/components/providers/SessionProvider.tsx`
2. **Delete** `modonty/components/providers/SessionWrapper.tsx`

### Step 5: Verification

- `npx next build` passes
- Grep for `SessionProvider` and `SessionWrapper` → zero matches
- Grep for `from "next-auth/react"` → only `signIn`, `signOut` imports remain (no useSession)

