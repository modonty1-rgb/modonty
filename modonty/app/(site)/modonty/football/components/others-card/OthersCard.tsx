import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { messages } from "@/lib/i18n/messages";

import type { FootballPage } from "../../data/get-football-page";
import { MatchRow } from "../fixtures-card/FixturesCard";

const t = messages.modonty.football;

const dayFmt = new Intl.DateTimeFormat(SITE_LOCALE, { timeZone: "Asia/Riyadh", weekday: "long", day: "numeric", month: "long" });

/**
 * أنديتنا والمنتخب خارج دوري روشن (خالد ١٥ أكتوبر ٢٠٢٦: «ما بيغطي كل الأحداث الكروية اللي في السعودية»)
 * — آسيا · الخليج · كأس الملك · السوبر · المنتخب، بطولةً بطولة. من 365Scores وحده، فالسطر الأخير يقول ذلك.
 * لا تظهر البطاقة إن لم يكن فيها شيء.
 */
export function OthersCard({ groups, crests }: { groups: FootballPage["others"]; crests: Record<string, string> }) {
  if (groups.length === 0) return null;
  return (
    <section aria-labelledby="football-others" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="football-others" className="text-lg font-bold">
        {t.othersTitle}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.othersLead}</p>
      {groups.map((g) => (
        <div key={g.competition} className="mt-4">
          <h3 className="text-sm font-bold text-muted-foreground">{g.competition}</h3>
          <ul className="divide-y divide-border">
            {g.matches.map((m) => (
              <MatchRow key={m.id} match={m} crests={crests} dateLabel={dayFmt.format(new Date(m.kickoff))} />
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-4 text-xs text-muted-foreground">{t.othersSource}</p>
    </section>
  );
}
