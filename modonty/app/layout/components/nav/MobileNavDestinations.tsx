"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ModontySearchMark } from "@/components/icons/modonty-search-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";
import { cn } from "@/lib/utils";

export interface MobileDestinationLabels {
  search: string;
  reels: string;
  audio: string;
}

/** The diamond in each mark takes the brand accent; the body follows the row's colour. */
const DESTINATIONS = [
  { href: "/search", key: "search", Icon: ModontySearchMark, accent: "[--modonty-search-accent:hsl(var(--accent))]" },
  { href: "/reels", key: "reels", Icon: ModontyReelsMark, accent: "[--modonty-reels-accent:hsl(var(--accent))]" },
  { href: "/audio", key: "audio", Icon: ModontyAudioMark, accent: "[--modonty-audio-accent:hsl(var(--accent))]" },
] as const;

/**
 * Presentational half — the same three links whether or not the pathname is known yet, so
 * the Suspense fallback below is this row minus the active mark and nothing moves.
 */
export function MobileNavDestinationList({
  pathname,
  labels,
}: {
  pathname: string | null;
  labels: MobileDestinationLabels;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      {DESTINATIONS.map(({ href, key, Icon, accent }) => {
        const active = pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Button
            key={href}
            asChild
            variant="navigation"
            size="mobileIcon"
            /* Feedback on the press, not the release — `active:` fires on pointer-down.
               Colour alone told the reader the tap registered; the scale tells the finger. */
            className={cn(
              "rounded-xl motion-safe:transition-transform motion-safe:active:scale-95",
              active && "bg-primary/10 text-link"
            )}
          >
            <Link
              href={href}
              prefetch={href === "/search" ? false : undefined}
              aria-label={labels[key]}
              /* The bar is where a reader checks where they are. Without this, someone
                 sitting on /reels sees the same bar as someone who has never opened it. */
              aria-current={active ? "page" : undefined}
              className={accent}
            >
              <Icon aria-hidden />
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

/**
 * `usePathname` on a route with a dynamic param needs a Suspense boundary under
 * cacheComponents (use-pathname.md, "Good to know") — the caller wraps this and uses
 * `<MobileNavDestinationList pathname={null} />` as the fallback.
 */
export function MobileNavDestinations({ labels }: { labels: MobileDestinationLabels }) {
  const pathname = usePathname();
  return <MobileNavDestinationList pathname={pathname} labels={labels} />;
}
