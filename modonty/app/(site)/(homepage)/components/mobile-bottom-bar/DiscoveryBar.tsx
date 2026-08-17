import Link from "next/link";
import { IconClients, IconCompass, IconSearch } from "@/lib/icons";

const triggerClass =
  "relative grid size-11 place-items-center rounded-full text-muted-foreground transition-colors active:bg-primary/10 active:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

// Three links, so this renders on the server. The two sheets it replaced re-listed
// content that /categories and /clients already own; sending the visitor to those pages
// drops five client files and four homepage queries.
export function DiscoveryBar() {
  return (
    <nav aria-label="تصفّح سريع" className="pointer-events-none fixed inset-x-0 top-0 z-[60] md:hidden">
      <div className="pointer-events-auto mx-auto flex h-14 w-fit items-center justify-center gap-0.5">
        <Link href="/search" aria-label="بحث" className={triggerClass}>
          <IconSearch className="h-5 w-5" />
        </Link>
        <Link href="/categories" aria-label="اكتشف" className={triggerClass}>
          <IconCompass className="h-5 w-5" />
        </Link>
        <Link href="/clients" aria-label="الشركاء" className={triggerClass}>
          <IconClients className="h-5 w-5" />
        </Link>
      </div>
    </nav>
  );
}
