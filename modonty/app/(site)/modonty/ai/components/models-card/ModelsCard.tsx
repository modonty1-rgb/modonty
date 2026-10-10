import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill, messages } from "@/lib/i18n/messages";

import { taskLabel } from "../../helpers/task-label";
import { GoogleTranslateBadge } from "../../../components/translation-credit/GoogleTranslateBadge";
import type { AiModel } from "../../helpers/types";

const t = messages.modonty.ai;
const N = new Intl.NumberFormat(SITE_LOCALE);

/**
 * Five Hub models, ranked. The name stays as its author published it (Latin, left-to-right, in its
 * own isolate so it never flips the Arabic line); what the model does is said in Arabic — its task, and
 * a line translated from its own card when the card has one.
 */
export function ModelsCard({ id, title, note, models }: { id: string; title: string; note: string; models: AiModel[] | null }) {
  return (
    <section aria-labelledby={id} className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
      {!models?.length ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ol className="mt-3 divide-y divide-border">
          {models.map((m, i) => (
            <li key={m.id}>
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 py-2.5 hover:text-link">
                <span className="mt-0.5 w-5 shrink-0 text-center text-sm font-bold text-muted-foreground tabular-nums">{N.format(i + 1)}</span>
                <span className="min-w-0 flex-1">
                  <bdi dir="ltr" className="block truncate text-sm font-bold">
                    {m.name}
                  </bdi>
                  {m.author && (
                    <bdi dir="ltr" className="block truncate text-xs text-muted-foreground">
                      {m.author}
                    </bdi>
                  )}
                  {m.brief && <span lang={`ar-x-mtfrom-${m.brief.from}`} className="mt-1 line-clamp-2 block text-sm leading-relaxed text-foreground/80">{m.brief.text}</span>}
                </span>
                <span className="mt-0.5 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{taskLabel(m.task)}</span>
                <span className="mt-1 hidden w-20 shrink-0 text-end text-xs text-muted-foreground tabular-nums sm:block">
                  {fill(t.likes, { n: N.format(m.likes) })}
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
      {models?.some((x) => x.brief) && <GoogleTranslateBadge />}
    </section>
  );
}
