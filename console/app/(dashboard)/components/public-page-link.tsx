"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { BRAND_ICON_URL } from "@modonty/database/lib/brand-assets";
import { cn } from "@/lib/utils";

/**
 * The client's live page on modonty.com — the one link they paste into WhatsApp and
 * their Instagram bio. It used to live only on the profile page, so it vanished the
 * moment they navigated anywhere else (Khalid 2026-08-04). One component, two shapes,
 * so the two placements can never drift apart.
 *
 * Interaction, decided deliberately:
 *  - The whole row opens the page. Copy is the only explicit button, because copying
 *    is the action nobody discovers by guessing, and it is the one they actually need.
 *  - The row shows the Arabic slug, not the full URL: a full URL wraps, breaks
 *    direction, and reads as noise. The full URL is what gets copied and what the
 *    tooltip shows.
 */

interface PublicPageLinkProps {
  url: string | null;
  /** `bar` = wide, inside the profile header. `sidebar` = compact, inside the nav rail. */
  variant?: "bar" | "sidebar";
  /** Sidebar only: collapse to the icon alone. */
  isCollapsed?: boolean;
  className?: string;
}

/** Last path segment, decoded — `.../clients/مختبرات-الأطباء` → `مختبرات-الأطباء`. */
function readableSlug(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/$/, "");
    return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? url);
  } catch {
    return url;
  }
}

export function PublicPageLink({
  url,
  variant = "bar",
  isCollapsed = false,
  className,
}: PublicPageLinkProps) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const slug = readableSlug(url);

  async function handleCopy(e: React.MouseEvent) {
    // The row itself is a link; copying must not also open the page.
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (insecure origin / denied) — the row still opens the page */
    }
  }

  // Collapsed rail: the icon alone, still a real link, tooltip carries the URL.
  if (variant === "sidebar" && isCollapsed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={url}
        aria-label={`صفحتك على مُدَوَّنَتِي — ${slug}`}
        className={cn(
          "mx-auto flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg",
          "border border-border/60 transition-opacity hover:opacity-80",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BRAND_ICON_URL}
          alt="مُدَوَّنَتِي"
          className="h-full w-full scale-[1.85] object-contain"
        />
      </a>
    );
  }

  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-lg border bg-card transition-colors hover:border-primary/40 hover:bg-primary/5",
        // 44px on the sidebar/mobile row — the touch-target floor.
        isSidebar ? "min-h-11 px-2.5 py-1.5" : "px-3 py-2",
        className
      )}
    >
      {/* The brand mark, not a generic globe — it says "this is your page on Modonty"
          without spending a word on it. */}
      {/* The brand mark, not a generic globe — it says "this is your page on Modonty"
          without spending a word on it.
          The source SVG draws its artwork across only ~54% of its 100×100 viewBox and
          carries its own white tile, so it renders tiny inside a padded, tinted box.
          Scaling by 1/0.54 makes the tile fill the frame; the frame clips the rest. */}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60",
          isSidebar ? "h-9 w-9" : "h-10 w-10"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BRAND_ICON_URL}
          alt="مُدَوَّنَتِي"
          className="h-full w-full scale-[1.85] object-contain"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] leading-tight text-muted-foreground">
          صفحتك على مُدَوَّنَتِي
        </span>
        {/* Stretched link: the anchor covers the whole row without nesting the button. */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={url}
          className={cn(
            "block truncate font-semibold text-foreground after:absolute after:inset-0 group-hover:text-primary",
            isSidebar ? "text-xs" : "text-sm"
          )}
        >
          {slug}
        </a>
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "تم نسخ الرابط" : "نسخ الرابط"}
        title={copied ? "تم النسخ" : "نسخ الرابط"}
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center rounded-md border bg-background",
          "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          isSidebar ? "h-8 w-8" : "h-8 w-8"
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
