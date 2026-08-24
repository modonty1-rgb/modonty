import Link from "next/link";

import { reelsBarItems } from "../helpers/reels-nav-destinations";

/**
 * The phone's way off this page — TikTok's bottom bar, in our destinations.
 *
 * `/reels` renders without site chrome (it lives under `(fullscreen)`), which is right for the
 * reel itself but left the phone with a single «خروج» button as its only exit. Five icons at
 * the bottom give the thumb the rest of the site without taking a pixel from the clip: the bar
 * is 56px of translucent black over footage that already runs edge to edge behind it.
 *
 * Same source as the desktop rail — see `reels-nav-destinations.ts`.
 * Hidden from `md` up, where the rail carries the same links in a column.
 */
export function ReelsBottomBar() {
  return (
    <nav
      aria-label="أقسام الموقع"
      // `pb-[env(safe-area-inset-bottom)]`: on a gesture-bar iPhone the last 34px belong to the
      // system, and a tap target sitting in them is a tap the OS eats. The bar grows instead.
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-white/10 bg-black/70 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {reelsBarItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          // 56 tall, and the whole cell is the target — five cells across 390px give 78px each,
          // comfortably past the 44 floor in both directions.
          className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
            item.tone === "accent" ? "text-accent" : "text-white/80"
          }`}
        >
          <item.icon className="size-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
