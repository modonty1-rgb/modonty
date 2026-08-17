import { messages } from "@/lib/i18n/messages";

const text = messages.about.editorial;

interface EditorialContentProps {
  title: string;
  /** Admin-authored HTML from `/modonty/pages/about` — content ownership stays with the team. */
  html: string;
}

/**
 * The team's own long-form «About» writing — vision, mission, values, the full case for
 * modonty — given real typographic care instead of the default `.prose` grey block. The
 * content itself is never touched here (it is free-form admin HTML, edited from the CMS);
 * only the container around it changes: brand-coloured section headings, a card frame
 * matching the rest of the page, and line lengths tuned for Arabic reading.
 */
export function EditorialContent({ title, html }: EditorialContentProps) {
  return (
    <section aria-labelledby="editorial-heading" className="rounded-lg border border-border bg-card p-6 sm:p-8">
      <p className="text-xs font-medium text-muted-foreground">{text.sectionTitle}</p>
      <h2 id="editorial-heading" className="sr-only">
        {title}
      </h2>
      <div
        className="prose prose-sm mt-3 max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:text-lg prose-h2:text-link prose-h3:mt-6 prose-h3:text-base prose-h3:text-link-accent prose-p:leading-7 prose-p:text-muted-foreground prose-strong:text-foreground prose-li:leading-6 prose-li:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
