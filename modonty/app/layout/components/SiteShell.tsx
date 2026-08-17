import type { ReactNode } from "react";
import { TopNav } from "@/app/layout/components/nav/TopNav";
import { Footer } from "@/app/layout/components/Footer";

/**
 * Modonty's own chrome: header · page · footer. It used to live inline in the root
 * layout, which forced it onto every route; since 2026-08-17 the root layout is
 * html/body + providers only, and this shell is mounted by `app/(site)/layout.tsx`
 * (all modonty pages) and by the root `not-found.tsx` (unmatched URLs). Partner sites
 * under `app/(partner)/` mount their own chrome instead.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
