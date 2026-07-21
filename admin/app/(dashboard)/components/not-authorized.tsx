"use client";

import { signOut } from "next-auth/react";

/**
 * Full-screen block for a signed-in user who is NOT an admin. Rendered by the
 * dashboard layout instead of redirecting (a redirect to /login would loop —
 * /login bounces any existing session back to "/"). Gives them a clean exit.
 */
export function NotAuthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-bold text-foreground">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn&apos;t have permission to open the admin panel.
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
