import Link from "next/link";

import { mainNavItems } from "@/app/layout/helpers/nav-config";

/**
 * The desktop navigation for a page that has no site chrome.
 *
 * `/reels` lives under `(fullscreen)`, so it renders without the header and footer — the
 * measurement that moved it out found 18 focusable links buried behind the clip. On a phone
 * that is right: the reel IS the screen, and «خروج» is the way back. On a mouse it is a dead
 * end, which is why TikTok keeps its own rail on desktop and goes chrome-less only on touch
 * (Khalid handed the reference, 24 Aug 2026).
 *
 * Items come from `mainNavItems` — the same list the top bar and the burger menu read, so a
 * renamed section changes here too. A second hand-written list would drift the first time
 * someone edits one of them.
 *
 * `md` shows icons only (64px); `lg` adds the labels (240px). Hidden below `md`, where the
 * page stays exactly as it was.
 */
export function ReelsNavRail() {
  return (
    <nav
      aria-label="أقسام الموقع"
      className="fixed inset-y-0 start-0 z-30 hidden w-16 flex-col gap-1 overflow-y-auto border-e border-white/10 bg-neutral-950/80 px-2 py-4 backdrop-blur md:flex lg:w-60 lg:px-3"
    >
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          // `hidden` below `lg` is `display:none`, which drops the text from the accessibility
          // tree too — so the row carries the name itself and the icon-only rail still speaks.
          aria-label={item.label}
          // 44 tall even on a mouse: the rail is also what a keyboard walks, and a short row
          // is a small focus ring. Icon-only rows centre; labelled rows read from the start.
          className={`flex min-h-11 items-center justify-center gap-3 rounded-xl px-2 text-sm font-bold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:justify-start ${
            item.tone === "accent" ? "text-accent" : "text-white/80 hover:text-white"
          }`}
        >
          <item.icon className="size-6 shrink-0" />
          <span className="hidden lg:inline">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
