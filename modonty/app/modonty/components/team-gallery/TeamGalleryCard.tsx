import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconChevronRight } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { TEAM_MEMBERS } from "@/lib/team/team-members";

const TEAM = messages.modonty.story.team;

/** The strip shows real photographs only — a drawn avatar next to faces reads as filler. */
const STRIP_SIZE = 4;
const STRIP = TEAM_MEMBERS.filter((m) => !m.isAvatar).slice(0, STRIP_SIZE);

/**
 * `LinkCard`'s row, but the faces ARE the icon (Khalid, 2026-08-17: «شيل الأيقونة وخلّيها
 * تبدأ بالصور»): facepile · one word · chevron. No count anywhere — «المزيد», not «+N»,
 * because the team size is not for the visitor to read (Khalid: «ما أبغى أكشف كم موظف
 * عندي»). The card links to `/team`, where every face has a name, a role and a mailbox.
 */
export function TeamGalleryCard() {
  return (
    <Link
      href="/team"
      className="group flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-primary/10 transition-[box-shadow,transform] sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.98]"
    >
      <Facepile />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{TEAM.buttonLabel}</span>
      <IconChevronRight className="h-4 w-4 shrink-0 text-primary rtl:rotate-180" aria-hidden />
    </Link>
  );
}

/** Four overlapping circles + a «المزيد» pill — the same crop, the same ring, one visual weight. */
function Facepile() {
  return (
    <span className="flex shrink-0 items-center" aria-hidden>
      {STRIP.map((member) => (
        <span
          key={member.slug}
          className="relative -ms-2 size-9 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-card first:ms-0"
        >
          <OptimizedImage
            media={asMedia(member.imageUrl)}
            alt=""
            fill
            loading="lazy"
            sizes="36px"
            className="object-cover object-top"
          />
        </span>
      ))}
      <span className="-ms-2 grid h-9 shrink-0 place-items-center rounded-full bg-primary/10 px-2.5 text-xs font-medium text-primary ring-2 ring-card">
        {TEAM.moreLabel}
      </span>
    </span>
  );
}
