"use client";

import { signOut } from "next-auth/react";
import { ShieldAlert, LogOut } from "lucide-react";

/**
 * Shown only when an admin opened this console AS the client (impersonation).
 * Makes the mode impossible to miss + gives a one-click exit back to login.
 */
export function ImpersonationBanner({ clientName }: { clientName: string }) {
  return (
    <div
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-[100] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 shadow-[0_-4px_14px_-4px_rgba(0,0,0,0.35)]"
    >
      <span className="inline-flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        دخول أدمن — أنت تتصفّح كـ «{clientName}»
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex items-center gap-1 rounded-md bg-amber-950/15 px-2.5 py-1 text-xs font-bold transition-colors hover:bg-amber-950/25"
      >
        <LogOut className="h-3.5 w-3.5" /> خروج
      </button>
    </div>
  );
}
