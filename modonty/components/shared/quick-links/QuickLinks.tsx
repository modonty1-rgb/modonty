import Link from "next/link";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { ModontyReelsMark } from "@/components/icons/modonty-reels-mark";
import { ModontyArticlesMark } from "@/components/icons/modonty-articles-mark";
import { ModontyAudioMark } from "@/components/icons/modonty-audio-mark";
import type { ComponentType, SVGProps } from "react";

interface QuickLink {
  href: string;
  /** `null` = التسمية هي اسم الموقع نفسه، يُقرأ من الإعدادات وقت الرسم. */
  label: string | null;
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
  // التسمية هنا **هي** اسم الموقع، فتُقرأ من الإعدادات لا تُكتب بيدٍ.
  { href: "/modonty", label: null, icon: ModontyMark, tone: "bg-action-like text-action-like-foreground" },
  { href: "/articles", label: "المقالات", icon: ModontyArticlesMark, tone: "bg-action-listen text-action-listen-foreground" },
  // The approved `categories` mark — the master reference names it «Categories / Industries»,
  // so one drawing serves both and the hand-made `industries` one was retired 22 Aug.
  { href: "/industries", label: "المجالات", icon: ModontyIndustriesMark, tone: "bg-action-save text-action-save-foreground" },
  // The approved reels mark (Khalid, 21 Aug), not a bare play triangle. Its diamond
  // goes WHITE here — cyan-on-cyan vanished into this tile's teal (Khalid: «the
  // background is the same color of the dot»).
  { href: "/reels", label: "الطلّات", icon: ModontyReelsMark, tone: "bg-action-reels text-action-reels-foreground" },
  // The approved `professionals` mark — «M + Diamond», the reference's own decision for the
  // partners directory; the hand-made `partner` one was retired 22 Aug.
  { href: "/clients", label: "الشركاء", icon: ModontyPartnerMark, tone: "bg-action-share text-action-share-foreground" },
  // «اسمع» joined as the sixth (Khalid, 22 Aug evening: «the speaker top with top tabs, not
  // at bottom»). It left the navbar row in the same pass, so this strip is now its only
  // doorway besides the sheet menu.
  { href: "/audio", label: "اسمع", icon: ModontyAudioMark, tone: "bg-action-audio text-action-audio-foreground" },
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
export async function QuickLinks() {
  const { siteName } = await getPageSeoDefaults();

  return (
    // No tab declares a diamond colour any more. Every mark defaults to the brand accent,
    // and the two tiles that used to swallow it — «الطلّات» on the accent token itself,
    // «المقالات» on a green a hair from it — moved to darker tokens of their own hue
    // (`--tab-reels` · `--tab-articles` in globals.css) instead of the diamond bending.
    <nav
      aria-label="أقسام الموقع"
      /* `items-start` welds every tab to the navbar's edge, so the active one's extra height
         goes DOWN and the five siblings stay at `h-14` instead of stretching with the row.
         The row reserves that overhang itself (`pb-3` = 12px ≥ the 12px the active tab
         gains), so the page below is never covered — the strip's own box grows, not the
         content's. */
      className="flex items-start justify-between gap-2 pb-3"
    >
      {QUICK_LINKS.map(({ href, label, icon: Icon, tone }) => (
        <Link
          key={href}
          href={href}
          /* Read by the «اللسان الفعّال» rule in globals.css: `ActiveTabMarker` puts the
             current section on `data-active-tab` and CSS makes the tab whose `data-tab`
             matches reach further down. The marker is the only client code involved —
             these six links and their marks stay on the server. */
          data-tab={href.slice(1)}
          /* The tab REACHES DOWN, it does not scale (Khalid, 22 Aug: «تخلي اللسان أطول
             لتحت عشان يبان إنه هو المميّز» + «شوف البيست»). A folder tab marks itself by
             touching the page it owns, and height leaves the type at its designed size —
             `scale` would enlarge the 10px label and the 20px mark along with the surface,
             and would spill sideways over the two neighbours. Height only ever grows into
             the row's own reserved bottom padding, so nothing shifts and nothing is covered.
             `h-14` is the resting height; the active tab's `h` is raised by the
             «اللسان الفعّال» rule in globals.css. Press stays a 2px nudge — a different
             language from «this is your page», so the two never read as the same state. */
          className={`relative -mt-px flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-b-xl shadow-md transition-[height,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:translate-y-0.5 ${tone}`}
        >
          <Icon className="size-5" aria-hidden />
          {/* Five tabs on a 390px row: the label may need to shrink a hair rather than wrap. */}
          <span className="text-[10px] font-semibold leading-none sm:text-[11px]">{label ?? siteName}</span>
        </Link>
      ))}
    </nav>
  );
}
