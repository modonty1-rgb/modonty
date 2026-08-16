import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconArrowRight } from "@/lib/icons";

import { CHARACTER_URL } from "@/constants";

// Top of the desktop feed — Modo's LinkedIn "Start a post"-style prompt.
// Booking and shopping live in the separate CommerceActions card below it.
export function HomeActions() {
  return (
    <section aria-label="اسأل مودو" className="flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-border">
      <Link
        href="/modo-chat"
        aria-label="اسأل مودو — افتح المحادثة"
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <span className="relative flex size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/15">
          <OptimizedImage media={asMedia(CHARACTER_URL)} alt="" fill className="object-cover" sizes="44px" />
        </span>
        {/* Drawn like a text field, but it is a link — typing happens on /modo-chat. */}
        <span className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-full bg-muted/50 px-4 text-sm text-muted-foreground ring-1 ring-inset ring-border transition-colors sm:group-hover:bg-muted sm:group-hover:text-foreground">
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
