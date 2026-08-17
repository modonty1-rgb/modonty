import { IconArrowRight, IconSearch } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";

const text = messages.clients.searchBar;

interface PartnersBarProps {
  query: PartnersQuery;
}

/**
 * Top of the partners column, drawn like the homepage Modo bar: one pill field. Plain
 * HTML — a GET form — so searching costs the page zero JavaScript, lands in the URL, and
 * works with the keyboard and with scripting off. No sort control (Khalid, 2026-08-16):
 * the order is fixed — featured first, then who publishes most.
 */
export function PartnersBar({ query }: PartnersBarProps) {
  return (
    <section aria-label={text.sectionAriaLabel} className="rounded-lg bg-card p-3 ring-1 ring-border">
      <form action="/clients" method="get" role="search" className="flex items-center">
        {/* The industry travels with the search, so typing a name does not silently clear
            the industry the visitor already picked. */}
        {query.industry && <input type="hidden" name="industry" value={query.industry} />}
        <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-muted/50 px-4 ring-1 ring-inset ring-border transition-colors focus-within:ring-primary">
          <IconSearch className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder={text.inputPlaceholder}
            aria-label={text.inputAriaLabel}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button type="submit" aria-label={text.submitButtonAriaLabel} className="grid size-8 shrink-0 place-items-center rounded-full text-link transition-colors sm:hover:bg-muted">
            <IconArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </form>
    </section>
  );
}
