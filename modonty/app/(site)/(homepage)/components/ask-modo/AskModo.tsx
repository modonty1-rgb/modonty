import Link from "next/link";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";
import { IconArrowRight } from "@/lib/icons";

// Top of the feed, LinkedIn "Start a post" style: the character plus a pill drawn like
// a text field. It is a LINK, not an input — the whole row opens /modo-chat, where the
// typing happens — so this stays a server component with zero client JavaScript.
export function AskModo() {
  return (
    <Link
      href="/modo-chat"
      aria-label="اسأل مودو — افتح المحادثة"
      className="group flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-border transition-shadow sm:gap-4 sm:px-4 sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="relative flex size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/15 sm:size-12">
        <ModoCharacter sizes="(min-width:640px) 48px, 44px" decorative />
      </span>
      {/* The "field": muted placeholder text, brand ring on hover — reads as "type here",
          without being one. */}
      <span className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-full bg-muted/50 px-4 text-sm text-muted-foreground ring-1 ring-inset ring-border transition-colors sm:group-hover:bg-muted sm:group-hover:text-foreground">
        <span className="truncate">
          <span className="font-bold text-foreground">اسأل مودو</span>
          <span className="mx-1.5" aria-hidden>·</span>
          اكتب احتياجك وسأرشدك للمحتوى أو الشريك المناسب…
        </span>
        <IconArrowRight className="h-4 w-4 shrink-0 text-link rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  );
}
