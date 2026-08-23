import { Input } from "@/components/ui/input";
import { IconSearch } from "@/lib/icons";

interface ArchiveSearchFormProps {
  placeholder?: string;
}

/**
 * The archive search box for a page that is NOT the archive — the homepage's phone feed
 * (Khalid, 23 Aug: «in home page need search and filter»).
 *
 * A plain GET form, on purpose: it ships ZERO client JavaScript. `EntitySearchForm` (the
 * live box on `/articles`) needs `useRouter` + `useTransition`; here a live search would
 * swap the page to `/articles` on the first keystroke and drop the keyboard mid-word, so
 * the box submits on «بحث» and lands on `/articles?search=…` where the live one takes over.
 * Same look (height, radius, magnifier at the start) so the two read as one control.
 */
export function ArchiveSearchForm({ placeholder = "ابحث في المقالات…" }: ArchiveSearchFormProps) {
  return (
    <form action="/articles" method="get" role="search" className="relative">
      <IconSearch
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        name="search"
        enterKeyHint="search"
        autoComplete="off"
        aria-label={placeholder}
        placeholder={placeholder}
        // `type="search"` keeps the browser's own clear «×» — the one clear control that
        // costs no JavaScript.
        className="h-12 rounded-xl ps-10 pe-4"
      />
    </form>
  );
}
