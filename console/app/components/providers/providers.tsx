"use client";

import { SessionProvider } from "./session-provider";
import { ToastProvider } from "./toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      {children}
    </SessionProvider>
  );
}
