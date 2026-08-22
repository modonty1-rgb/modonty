import { Suspense } from "react";
import { messages } from "@/lib/i18n/messages";
import { TopNavDesktop } from "./TopNavDesktop";
import { LogoNav } from "@/app/layout/components/nav/LogoNav";
import { MobileMenuClient } from "./MobileMenuClient";
import {
  MobileNavDestinations,
  MobileNavDestinationList,
} from "@/app/layout/components/nav/MobileNavDestinations";
import { UserMenu } from "@/app/layout/components/user-menu/UserMenu";
import { MobileNotificationBadge } from "@/app/layout/components/notifications/MobileNotificationBadge";

const destinationLabels = {
  search: messages.chrome.searchArticles,
  reels: messages.chrome.menuItems.reels,
  audio: messages.chrome.menuItems.audio,
};

// Static header: everything here is in the cached shell. The only request-time reads
// (unread count · notifications bell) stream into their own small boundaries, so the
// logo and links never wait for them. Measured 2026-08-15: the header used to be the
// LAST thing to arrive (3.3s after the shell in dev) because it sat behind two counters.
// Material, phones only — the desktop header keeps its existing shell untouched.
// A floating bar that content scrolls under is a translucent MATERIAL, and the biggest such
// surface on the site was carrying the lightest blur (4px) while the article's own outline
// bar carried 24px + saturation. Bigger surface, thicker material.
// `backdrop-blur-sm` STAYS: measured 22 Aug, it computes `blur(4px)` — the earlier reading of
// `none` was `prefers-reduced-transparency: reduce` matching on the reviewer's machine, not a
// broken Tailwind chain. Removing it silently dropped the blur on desktop, which is exactly the
// thing that must never happen. The `.site-header-material` rule below outranks it on phones
// (element+class beats class), so the thicker material still wins there.
// `max-md:border-b-0` + the gradient below it: a hard 1px rule is a divider between two
// regions; where floating chrome overlaps content, the edge is a short fade instead.
// `prefers-reduced-transparency` turns the whole thing solid — a reader who asked the system
// for less see-through gets an opaque bar, not a dimmer one.
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-accent/20 bg-slate-100/95 dark:bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-100/90 dark:supports-[backdrop-filter]:bg-card/90 shadow-sm max-md:border-b-0 max-md:shadow-none site-header-material max-md:after:pointer-events-none max-md:after:absolute max-md:after:inset-x-0 max-md:after:top-full max-md:after:h-3 max-md:after:bg-gradient-to-b max-md:after:from-foreground/[0.06] max-md:after:to-transparent">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm font-medium"
      >
        {messages.chrome.skipToContent}
      </a>
      <div className="container mx-auto max-w-[1128px]">
        {/* Three columns, and the middle one is the wide one: brand · destinations · menu
            (Khalid, 22 Aug). The two edge columns are sized by their content, so the icons
            take every pixel left over and sit centred in it — with `justify-between` they
            were pinned against the menu with 110px of dead air on the other side.
            DOM order is the RTL visual order: logo → search → reels → audio → account → menu.
            Six 44px targets on a 360px phone: 264px of content in 344px of row, so the
            middle column keeps real slack even on the narrowest phone still shipping. */}
        <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-1 px-2 md:hidden">
          <LogoNav variant="mark" />
          {/* One gap for the whole row. `gap-0.5` next to a 96px button read as a ragged
              rhythm — even spacing only reads as even when every item in the row is the
              same width (Khalid, 22 Aug: «the space between the icons is not perfect»).
              Active mark reads the pathname → own boundary on dynamic routes; the fallback
              is the same three links, unmarked, so the shell keeps them. */}
          <Suspense fallback={<MobileNavDestinationList pathname={null} labels={destinationLabels} />}>
            <MobileNavDestinations labels={destinationLabels} />
          </Suspense>
          {/* The account sits with the menu, not with the destinations (Khalid, 22 Aug).
              The middle column is where the reader GOES; this column is what they DO with
              their own account — grouping by that split is why the three icons now read as
              one set instead of four things that happen to be adjacent. */}
          <div className="flex items-center gap-1">
            <div className="relative">
              {/* Session read → own boundary (see DesktopUserAreaClient); 44px slot held. */}
              <Suspense fallback={<span className="inline-block h-11 w-11" aria-hidden />}>
                <UserMenu />
              </Suspense>
              <Suspense fallback={null}>
                <MobileNotificationBadge />
              </Suspense>
            </div>
            <MobileMenuClient
              labels={{
                openMenu: messages.chrome.openMenu,
                closeMenu: messages.chrome.closeMenu,
                menu: messages.chrome.menu,
                menuDescription: messages.chrome.menuDescription,
                yourAccount: messages.chrome.yourAccount,
                signUpFree: messages.chrome.signUpFree,
                signIn: messages.chrome.signIn,
              }}
              themeLabels={messages.chrome.theme}
              sections={messages.chrome.menuSections}
              items={messages.chrome.menuItems}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <TopNavDesktop />
      </div>
    </header>
  );
}
