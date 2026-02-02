"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

/**
 * SessionProvider wrapper component for NextAuth v5
 *
 * Provides session context to all client components in the application.
 * For JWT sessions with default 30-day expiry, no custom refetchInterval is needed.
 * Session will automatically refetch on window focus (default behavior).
 *
 * @see https://authjs.dev/reference/nextjs/react
 * @see https://authjs.dev/getting-started/session-management/get-session
 */
interface SessionProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
