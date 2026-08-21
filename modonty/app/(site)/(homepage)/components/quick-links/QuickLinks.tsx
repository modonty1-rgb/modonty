import Link from "next/link";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyArticlesMark } from "@/components/icons/modonty-articles-mark";
import type { ComponentType, SVGProps } from "react";

interface QuickLink {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Action-token pair — the same colored-tab language as the article's engagement tabs. */
  tone: string;
}

/**
 * The sections a phone visitor reaches from the homepage itself (Khalid, 21 Aug).
 * «المقالات» joined as the fifth: measured the same day — the archive had ZERO links in
 * the whole mobile UI (not in these tabs, not in the footer, not in the 12-item menu),
 * so `/articles` was reachable only by typing the URL.
 */
const QUICK_LINKS: QuickLink[] = [
  // «مدونتي» leads (Khalid, 21 Aug) — the brand's own door opens the row.
  { href: "/modonty", label: "مدونتي", icon: ModontyMark, tone: "bg-action-like text-action-like-foreground" },
  { href: "/articles", label: "المقالات", icon: ModontyArticlesMark, tone: "bg-action-listen text-action-listen-foreground [--modonty-articles-accent:white]" },
  // The approved industries mark (shared/assets/brand), not a generic factory icon.
  { href: "/industries", label: "المجالات", icon: ModontyIndustriesMark, tone: "bg-action-save text-action-save-foreground" },
  // The approved reels mark (Khalid, 21 Aug), not a bare play triangle. Its diamond
  // goes WHITE here — cyan-on-cyan vanished into this tile's teal (Khalid: «the
  // background is the same color of the dot»).
  { href: "/reels", label: "الطلّات", icon: ModontyReelsMark, tone: "bg-action-comment text-action-comment-foreground [--modonty-reels-accent:white]" },
  // The approved partner mark (Khalid, 21 Aug), not a generic building icon.
  { href: "/clients", label: "الشركاء", icon: ModontyPartnerMark, tone: "bg-action-share text-action-share-foreground" },
];

/**
 * Mobile homepage doorways as tabs hanging from the NAVBAR — the article page's
 * pattern verbatim (Khalid, 21 Aug: «نفس فكرة اللسان» ثم «تجي نازلة من تحت الناف
 * بار»): each tab is square where it meets the bar (`-mt-px` closes the hairline),
 * rounded at the loose bottom edge, and grows DOWN on press — the direction it
 * already points. The CALLER must place this flush under the navbar (first element,
 * container top padding cancelled). Colors are the action tokens, so dark mode and
 * legible text come for free. Hidden ≥1024px where the rails carry these doorways.
 */
export function QuickLinks() {
  return (
    // The industries mark's diamond takes the brand accent per its integration contract
    // (shared/assets/brand/README.md); the gateways keep following the tab's text color.
    <nav
      aria-label="أقسام الموقع"
      className="flex justify-between gap-2 [--modonty-industries-accent:hsl(var(--accent))] [--modonty-partner-accent:hsl(var(--accent))] [--modonty-reels-accent:hsl(var(--accent))]"
    >
      {QUICK_LINKS.map(({ href, label, icon: Icon, tone }) => (
        <Link
          key={href}
          href={href}
          className={`-mt-px flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-b-xl shadow-md transition-transform active:translate-y-0.5 sm:hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${tone}`}
        >
          <Icon className="size-5" aria-hidden />
          {/* Five tabs on a 390px row: the label may need to shrink a hair rather than wrap. */}
          <span className="text-[10px] font-semibold leading-none sm:text-[11px]">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
