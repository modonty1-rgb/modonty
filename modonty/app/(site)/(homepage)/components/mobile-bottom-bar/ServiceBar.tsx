import Link from "next/link";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";
import { buttonVariants } from "@/components/ui/button";
import { IconCalendar, IconShoppingBag } from "@/lib/icons";

import { cn } from "@/lib/utils";

// The mobile bottom bar: three links and nothing else, so it is a Server Component.
//
// The markup below is the previous design, unchanged. Only the mechanism moved: Modo is
// a link to its page instead of a dropdown, and the two services point at their own
// routes instead of a filtered query string.
export function ServiceBar() {
  return (
    <nav aria-label="احجز أو تسوّق" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <Link
        href="/modo-chat"
        aria-label="افتح مودو"
        className={buttonVariants({
          variant: "ghost",
          className:
            "absolute inset-x-0 bottom-[calc(1.875rem+env(safe-area-inset-bottom))] z-50 mx-auto h-12 w-14 flex-col gap-0.5 rounded-b-lg rounded-t-xl border-0 bg-background px-1 py-1 text-foreground shadow-none hover:bg-background hover:text-foreground focus-visible:ring-accent",
        })}
      >
        <span className="pointer-events-none absolute inset-0 rounded-t-xl border-x border-t border-accent/35 bg-background" aria-hidden="true" />
        <span className="relative z-10 flex shrink-0 items-center justify-center">
          <span className="relative block size-7 shrink-0 overflow-hidden rounded-full">
            <ModoCharacter sizes="28px" decorative />
          </span>
        </span>
        <span className="relative z-10 text-[8px] font-normal leading-none text-accent">مودو</span>
      </Link>

      <div className="flex items-center px-3 py-2">
        <Link
          href="/booking"
          className={buttonVariants({ variant: "ghost", className: cn("min-h-12 min-w-0 flex-1 gap-2 rounded-se-none px-3 ring-1 ring-accent/35 focus-visible:ring-accent", "bg-accent/20 text-primary-foreground") })}
        >
          <IconCalendar className="h-5 w-5 shrink-0" aria-hidden />
          احجز الآن
        </Link>

        <span className="w-14 shrink-0" aria-hidden="true" />

        <Link
          href="/shop"
          className={buttonVariants({ variant: "ghost", className: cn("min-h-12 min-w-0 flex-1 gap-2 rounded-ss-none px-3 ring-1 ring-accent/35 focus-visible:ring-accent", "bg-accent/10 text-accent") })}
        >
          <IconShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
          تسوّق الآن
        </Link>
      </div>
    </nav>
  );
}
