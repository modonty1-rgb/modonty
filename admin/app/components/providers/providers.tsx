"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "./session-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider session={session}>{children}</SessionProvider>
    </ThemeProvider>
  );
}
