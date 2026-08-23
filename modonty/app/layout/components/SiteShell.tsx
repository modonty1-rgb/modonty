import { Suspense, type ReactNode } from "react";
import { TopNav } from "@/app/layout/components/nav/TopNav";
import { QuickLinks } from "@/components/shared/quick-links/QuickLinks";
import { ActiveTabMarker } from "@/components/shared/quick-links/ActiveTabMarker";
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
    /* `data-site-shell` is the anchor for the «اللسان الفعّال» rule in globals.css: it
       scopes the `:has()` to this subtree so the lookup never walks the whole document. */
    <div data-site-shell className="min-h-screen flex flex-col">
      <TopNav />
      {/* The six doorway tabs, hanging from the navbar on EVERY modonty page (Khalid,
          22 Aug evening: «to all page»). They were the homepage's alone until now, which
          left «اسمع» and «الطلّات» reachable from one screen only once they left the
          navbar row. Mounted here, beside the header they hang from, so no page has to
          remember to render them and none can render them twice.
          Same container as the header's row, so tab edges line up with the logo above. */}
      {/* Sticky under the header, not scrolling away with the page (Khalid, 22 Aug: «مش
          اتفقنا انها تكون تحت النافبار ثابته مع السكرول»). `top-14` = the header's own 56px,
          and `z-30` keeps the strip under the header (`z-40`) so the tabs slide behind it,
          never over it. The band needs a surface because the tabs hang from a 12px gap —
          without one the feed shows through that gap as it scrolls past.
          That surface is the HEADER'S material, not `bg-background` (measured 23 Aug: header
          `card/90` + blur, band solid `background` — two tones on one 135px chrome block,
          with a visible seam where the tabs weld on). Same bg tokens + `site-header-material`
          (the 20px blur rule in globals.css), so header and band read as one sheet of glass
          and the feed blurs through both alike. The scroll-edge fade (`after:`) lives HERE,
          on the band's bottom — it is the band, not the header, that content meets. */}
      <div className="container site-header-material sticky top-14 z-30 mx-auto max-w-[1128px] bg-slate-100/95 dark:bg-card/95 supports-[backdrop-filter]:bg-slate-100/90 dark:supports-[backdrop-filter]:bg-card/90 px-3 lg:hidden after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-3 after:bg-gradient-to-b after:from-foreground/[0.06] after:to-transparent">
        {/* `QuickLinks` renders on the SERVER and is handed to the marker as children, so
            the six links and their SVGs never enter the client bundle — only the marker's
            `usePathname` does. The fallback is the same strip with no section marked, so
            the shell keeps the tabs and nothing moves when the pathname arrives
            (`usePathname` needs its own boundary under cacheComponents). */}
        <Suspense fallback={<QuickLinks />}>
          <ActiveTabMarker>
            <QuickLinks />
          </ActiveTabMarker>
        </Suspense>
      </div>
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
