"use client";

import { createContext, use, type ReactNode } from "react";
import type { Session } from "next-auth";

// The context holds the *promise*, not the resolved session. That is what keeps the
// tree renderable before the request is read: nothing above a consumer suspends, so
// the page still lands in the static shell. Official pattern —
// docs/01-app/02-guides/authentication-with-cache-components.mdx
const SessionContext = createContext<Promise<Session | null> | null>(null);

export function SessionProvider({
  sessionPromise,
  children,
}: {
  sessionPromise: Promise<Session | null>;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={sessionPromise}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Same shape it always returned, so no consumer changed.
 * It suspends until the session resolves — every caller must sit under a
 * <Suspense> boundary, otherwise React throws.
 */
export function useSession(): {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const sessionPromise = use(SessionContext);
  // No provider above (a stray render outside the layout) — behave as signed out
  // instead of crashing the page.
  const session = sessionPromise ? use(sessionPromise) : null;
  return {
    data: session,
    status: session ? "authenticated" : "unauthenticated",
  };
}
