import Link from "next/link";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";
import { IconArrowRight } from "@/lib/icons";

// Top of the desktop feed — Modo's LinkedIn "Start a post"-style prompt.
// Booking and shopping live in the account rail (CommerceActions), not here.
export function HomeActions() {
  return (
    <section aria-label="اسأل مودو" className="flex items-center gap-2 rounded-lg bg-card p-2 ring-1 ring-border lg:gap-3 lg:p-3">
      <Link
        href="/modo-chat"
        aria-label="اسأل مودو — افتح المحادثة"
        className="group flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card lg:gap-3"
      >
        <span className="relative flex size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/15 lg:size-11">
          <ModoCharacter sizes="(min-width: 1024px) 44px, 40px" decorative />
        </span>
        {/* Drawn like a text field, but it is a link — typing happens on /modo-chat. */}
        <span className="flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-muted/50 px-3 text-sm text-muted-foreground ring-1 ring-inset ring-border transition-colors sm:group-hover:bg-muted sm:group-hover:text-foreground lg:h-11 lg:gap-3 lg:px-4">
          <span className="truncate">
            <span className="font-medium text-foreground">اسأل مودو</span>
            <span className="mx-1.5" aria-hidden>·</span>
            اكتب وش تحتاج…
          </span>
          <IconArrowRight className="h-4 w-4 shrink-0 text-link rtl:rotate-180" aria-hidden />
        </span>
      </Link>

    </section>
  );
}
