import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { messages } from "@/lib/i18n/messages";

import { GoogleTranslateBadge } from "../../../components/translation-credit/GoogleTranslateBadge";
import type { Paper } from "../../helpers/types";

const t = messages.modonty.ai;
const date = new Intl.DateTimeFormat(SITE_LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Riyadh" });

/** The newest papers on Arabic — title, the abstract's opening in Arabic, first author, date, and a link to arXiv. */
export function PapersCard({ papers }: { papers: Paper[] | null }) {
  return (
    <section aria-labelledby="ai-papers" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="ai-papers" className="text-lg font-bold">
        {t.papersTitle}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.papersNote}</p>
      {!papers?.length ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {papers.map((p) => (
            <li key={p.id}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="block py-2.5 hover:text-link">
                <bdi dir="ltr" className="line-clamp-2 block text-start text-sm font-bold leading-snug">
                  {p.title}
                </bdi>
                {p.brief && <span lang={`ar-x-mtfrom-${p.brief.from}`} className="mt-1 line-clamp-3 block text-sm leading-relaxed text-foreground/80">{p.brief.text}</span>}
                <span className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                  <time dateTime={p.published}>{date.format(new Date(p.published))}</time>
                  {p.authors[0] && (
                    <bdi dir="ltr">
                      {p.authors[0]}
                      {p.authors.length > 1 ? " et al." : ""}
                    </bdi>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {papers?.some((x) => x.brief) && <GoogleTranslateBadge />}
    </section>
  );
}
