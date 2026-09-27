import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";

import type { TableRow } from "../../helpers/types";
import { TeamMark } from "../team-mark/TeamMark";

const t = messages.modonty.football;
const n = (v: number) => v.toLocaleString(SITE_LOCALE);
/** «+١٨» · «−٩» · «٠» — the sign is data, not decoration. */
const signed = (v: number) => (v > 0 ? `+${n(v)}` : v < 0 ? `−${n(-v)}` : n(0));

/** The full table, all eighteen clubs. Asia and relegation zones come from the source's own column. */
export function StandingsCard({ rows, crests }: { rows: TableRow[] | null; crests: Record<string, string> }) {
  return (
    <section aria-labelledby="football-table" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="football-table" className="text-lg font-bold">
        {t.tableTitle}
      </h2>
      {!rows?.length ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.tableEmpty}</p>
      ) : (
        <>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th scope="col" className="w-8 py-2 font-medium">{t.tableCols.pos}</th>
                <th scope="col" className="py-2 text-start font-medium">{t.tableCols.team}</th>
                <th scope="col" className="py-2 font-medium">{t.tableCols.played}</th>
                <th scope="col" className="py-2 font-medium">{t.tableCols.won}</th>
                <th scope="col" className="py-2 font-medium">{t.tableCols.drawn}</th>
                <th scope="col" className="py-2 font-medium">{t.tableCols.lost}</th>
                <th scope="col" className="py-2 font-medium">{t.tableCols.gd}</th>
                <th scope="col" className="py-2 font-medium">{t.tableCols.pts}</th>
              </tr>
            </thead>
            <tbody className="text-center tabular-nums">
              {rows.map((r) => (
                <tr key={r.position} className="border-b border-border/60 last:border-0">
                  <td
                    className={cn(
                      "relative py-2 font-bold",
                      r.zone && "before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full",
                      r.zone === "asia" && "before:bg-primary",
                      r.zone === "drop" && "before:bg-red-600",
                    )}
                  >
                    {n(r.position)}
                  </td>
                  <th scope="row" className="py-2 text-start font-medium">
                    <span className="flex items-center gap-2">
                      <TeamMark name={r.team} crest={crests[r.team]} />
                      {r.team}
                    </span>
                  </th>
                  <td className="py-2">{n(r.played)}</td>
                  <td className="py-2">{n(r.won)}</td>
                  <td className="py-2">{n(r.drawn)}</td>
                  <td className="py-2">{n(r.lost)}</td>
                  <td className="py-2" dir="ltr">{signed(r.goalDifference)}</td>
                  <td className="py-2 font-bold">{n(r.points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-primary" /> {t.zoneAsia}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-red-600" /> {t.zoneDrop}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
