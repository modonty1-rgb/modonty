import { Suspense, type ReactNode } from "react";
import { TopNav } from "@/app/layout/components/nav/TopNav";
import { MobileNavCapsule } from "@/components/shared/quick-links/MobileNavCapsule";
import { Footer } from "@/app/layout/components/Footer";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

/**
 * Modonty's own chrome: header · page · footer. It used to live inline in the root
 * layout, which forced it onto every route; since 2026-08-17 the root layout is
 * html/body + providers only, and this shell is mounted by `app/(site)/layout.tsx`
 * (all modonty pages) and by the root `not-found.tsx` (unmatched URLs). Partner sites
 * under `app/(partner)/` mount their own chrome instead.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const { siteName } = await getPageSeoDefaults();

  return (
    /* `data-site-shell` is the anchor for the «اللسان الفعّال» rule in globals.css: it
       scopes the `:has()` to this subtree so the lookup never walks the whole document. */
    <div data-site-shell className="min-h-screen flex flex-col">
      <TopNav />
      {/* The section capsule is primary navigation, so on phones it floats in the thumb zone —
          no full-width bar behind it, the page shows around it (same as the app). Page-specific
          actions stay beneath the header through MobileCtaBar. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden">
        {/* Two constraints the bottom nav must satisfy, both measured on this branch 1 Sep 2026:
            1. `PageSeoDefaults.siteName` is `string | undefined` and the prop is required (TS2322).
            2. It calls `usePathname()`, and under `cacheComponents` a client hook whose value is
               only known at request time cannot sit in a prerendered shell — `next build` fails
               with `CLIENT_HOOK_DYNAMIC` on /users/[id]. Official fix, from the docs shipped with
               16.3.4 (`use-params.md:76`): «Wrap the component (or a parent) in a Suspense
               boundary… otherwise, the build fails».
            The previous `QuickLinks` + `ActiveTabMarker` pair solved (2) by rendering the links on
            the SERVER and giving only the marker a boundary — worth keeping in mind. */}
        <Suspense fallback={<div className="h-14" />}>
          <MobileNavCapsule siteName={siteName ?? "مدونتي"} />
        </Suspense>
      </div>
      <main id="main-content" className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
