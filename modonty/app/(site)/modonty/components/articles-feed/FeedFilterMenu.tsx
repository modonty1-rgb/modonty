"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@modonty/shared/components/ui/dropdown-menu";
import { ModontyFilterMark } from "@/components/icons/modonty-filter-mark";

import { FEED_VIEWS, VIEW_LABEL, type FeedView } from "./feed-views";

interface FeedFilterMenuProps {
  view: FeedView;
  /** Built on the server — a function cannot cross into a Client Component. */
  hrefs: Record<FeedView, string>;
}

/**
 * The feed's filter control — the shadcn dropdown, not a hand-rolled `<details>`
 * (Khalid, 22 Aug: «استخدم دائماً شادسي إن»). What the shared primitive brings that the
 * hand-rolled version did not: it closes on an outside click, traps focus, restores focus
 * to the trigger on close, and behaves like every other menu in the app.
 *
 * It floats over the feed rather than pushing it down — a menu that shoves the page loses
 * the card the reader was looking at (Khalid: «ما ابغى الشفت اللي بيحصل هذا»).
 *
 * Each option stays a real `<Link>` to a real URL, so the filtered views are still
 * shareable and crawlable; `canonical` is pinned to `/modonty` on every variant so they
 * consolidate instead of competing.
 */
export function FeedFilterMenu({ view, hrefs }: FeedFilterMenuProps) {
  return (
    <DropdownMenu>
      {/* The pill stays drawn at 36px (the reference's size); the invisible `before:` pad
          makes the tap box 44px, and the press answers on touch-down. */}
      <DropdownMenuTrigger className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-card px-3.5 text-xs font-bold text-muted-foreground ring-1 ring-border transition-colors before:absolute before:-inset-1 before:content-[''] motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground data-[state=open]:ring-primary">
        {/* Label first, mark after it — in RTL that puts the sliders on the LEFT of the
            word, the way Khalid's reference pill is drawn. */}
        {view === "latest" ? "تصفية" : VIEW_LABEL[view]}
        <ModontyFilterMark className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {FEED_VIEWS.map((option) => (
          <DropdownMenuItem key={option} asChild>
            <Link
              href={hrefs[option]}
              scroll={false}
              aria-current={option === view ? "true" : undefined}
              className={`cursor-pointer text-xs font-medium ${
                option === view ? "bg-secondary text-secondary-foreground focus:bg-secondary focus:text-primary-foreground" : ""
              }`}
            >
              {VIEW_LABEL[option]}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
