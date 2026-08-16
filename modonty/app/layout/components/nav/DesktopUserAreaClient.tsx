"use client";

import { Suspense } from "react";
import { UserMenu } from "@/app/layout/components/user-menu/UserMenu";

// UserMenu reads the session promise (`use()`), so it must sit under its own
// boundary — otherwise the static shell cannot prerender (build error, cacheComponents).
// The fallback holds the «دخول» button box (h-9, ~64px) so nothing slides on arrival.
export function DesktopUserAreaClient() {
  return (
    <div className="flex items-center justify-end">
      <Suspense fallback={<span className="inline-block h-9 w-16" aria-hidden />}>
        <UserMenu />
      </Suspense>
    </div>
  );
}
