"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Marks which of the six tabs is the current section — the ONLY client code in the strip.
 *
 * Performance is the point of this shape (Khalid, 22 Aug: «make it client component but
 * performance very important»). The six links, their six brand SVGs and every Tailwind
 * class stay in `QuickLinks`, a Server Component, and arrive here as `children` — already
 * rendered, in the RSC payload. React never re-renders them on the client and none of that
 * code enters the bundle. What ships is this file: one `usePathname` and a wrapper.
 *
 * `display: contents` (`className="contents"`) means the wrapper generates no box, so the
 * row's flex layout is exactly what it was without it.
 *
 * Why this and not CSS alone: a server-rendered `data-route` marker inside `<main>` was
 * tried first and MEASURED to fail — on soft navigation the old markers are not removed,
 * so after visiting three sections three tabs were marked active at once. The pathname is
 * the only signal that is true exactly once.
 */
export function ActiveTabMarker({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // "/audio" → "audio" · "/clients/jbrseo" → "clients" (a partner page still marks الشركاء)
  const section = pathname?.split("/")[1] ?? "";

  return (
    <div data-active-tab={section} className="contents">
      {children}
    </div>
  );
}
