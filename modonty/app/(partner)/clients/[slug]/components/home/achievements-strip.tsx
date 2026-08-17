import type { PartnerSite } from "../../helpers/get-partner-site";

interface AchievementsStripProps {
  achievements: PartnerSite["achievements"];
}

/** Pulls a leading figure out of a free-text value («أكثر من 4000 حاله …» → «+٤٠٠٠» / «حاله …»). */
function splitValue(value: string): { figure: string | null; rest: string } {
  const m = value.match(/^\s*(?:(?:أكثر من|اكثر من|\+|over)\s*)?([\d٠-٩,.]+)\s*(%|٪)?\s*(.*)$/u);
  if (!m) return { figure: null, rest: value };
  const hasMore = /^\s*(أكثر من|اكثر من|\+|over)/u.test(value);
  const figure = `${hasMore ? "+" : ""}${m[1]}${m[2] ?? ""}`;
  return { figure, rest: m[3]?.trim() ?? "" };
}

/**
 * The partner's numbers in one band. Values arrive as free text from the console, so each
 * card tries to lift the figure out and show it big; if it can't, the sentence stands as is.
 */
export function AchievementsStrip({ achievements }: AchievementsStripProps) {
  const items = achievements.filter((a) => a.value?.trim()).slice(0, 4);
  if (items.length === 0) return null;
  const cols = items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <section className="border-y border-border bg-card">
      <div className={`mx-auto grid max-w-[1216px] gap-4 px-4 py-10 ${cols}`}>
        {items.map((a, i) => {
          const { figure, rest } = splitValue(a.value);
          return (
            <div key={`${a.label}-${i}`} className="rounded-2xl bg-primary/10 p-6">
              {figure ? <p className="text-3xl font-extrabold text-primary" dir="ltr">{figure}</p> : null}
              <p className={`mt-1 font-medium text-foreground ${figure ? "" : "text-lg"}`}>{figure ? rest || a.label : a.value}</p>
              {figure && rest ? <p className="mt-1 text-xs text-muted-foreground">{a.label}</p> : null}
              {a.description?.trim() ? <p className="mt-1 text-xs text-muted-foreground">{a.description}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
