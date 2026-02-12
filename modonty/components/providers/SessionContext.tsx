"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Session } from "next-auth";

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  );
}

export function useSession(): {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const session = useContext(SessionContext);
  return {
    data: session,
    status: session ? "authenticated" : "unauthenticated",
  };
}
