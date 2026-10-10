import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill, messages } from "@/lib/i18n/messages";

import { GoogleTranslateBadge } from "../../../components/translation-credit/GoogleTranslateBadge";
import type { Repo } from "../../helpers/types";

const t = messages.modonty.ai;
const N = new Intl.NumberFormat(SITE_LOCALE);

/** New open-source LLM projects the community is starring — the rail's live card. */
export function ReposCard({ repos }: { repos: Repo[] | null }) {
  return (
    <section aria-labelledby="ai-repos" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="ai-repos" className="text-lg font-bold">
        {t.reposTitle}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.reposNote}</p>
      {!repos?.length ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {repos.map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="block py-2.5 hover:text-link">
                <bdi dir="ltr" className="block truncate text-sm font-bold">
                  {r.name}
                </bdi>
                {/* Arabic first; the owner's own words only when no translation came back. */}
                {r.brief ? (
                  <span lang={`ar-x-mtfrom-${r.brief.from}`} className="mt-0.5 line-clamp-2 block text-sm leading-relaxed text-foreground/80">{r.brief.text}</span>
                ) : (
                  r.description && (
                    <bdi dir="ltr" className="line-clamp-2 block text-start text-xs leading-relaxed text-muted-foreground">
                      {r.description}
                    </bdi>
                  )
                )}
                <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">{fill(t.stars, { n: N.format(r.stars) })}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {repos?.some((x) => x.brief) && <GoogleTranslateBadge />}
    </section>
  );
}
