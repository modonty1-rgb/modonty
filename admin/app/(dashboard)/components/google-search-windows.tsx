"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { GoogleTotals, GoogleWindow } from "../helpers/get-modonty-google-summary";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * The 7 / 28 / 90-day / all-time switch for the Google card. Every window arrives from the server
 * in one cached fetch; this only picks which one shows. 28 days first — Search Console's default.
 */
export function GoogleSearchWindows({ windows }: { windows: GoogleWindow[] }) {
  const [days, setDays] = useState<GoogleWindow["days"]>(28);
  const w = windows.find((x) => x.days === days) ?? windows[0];
  if (!w) return null;
  const { current: cur, previous: prev } = w;

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="الفترة" className="inline-flex rounded-lg border bg-muted/40 p-0.5">
          {windows.map((x) => (
            <button
              key={x.days}
              type="button"
              role="tab"
              aria-selected={x.days === days}
              onClick={() => setDays(x.days)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                x.days === days ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {x.days ? `${x.days} يوم` : "كل المدة"}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          <span dir="ltr">{w.start} → {w.end}</span>
          {w.days ? ` · مقارنة بالـ${w.days} يوم اللي قبلها` : " · من أول يوم عند جوجل"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
        <Metric label="الظهور" value={n(cur.impressions)} change={prev ? change(cur.impressions, prev.impressions) : false} />
        <Metric label="النقرات" value={n(cur.clicks)} change={prev ? change(cur.clicks, prev.clicks) : false} />
        <Metric label="نسبة النقر (CTR)" value={`${cur.ctr.toFixed(2)}%`} change={prev ? points(cur, prev) : false} />
        <Metric
          label="متوسط الترتيب"
          value={cur.position === null ? "—" : cur.position.toFixed(1)}
          change={prev ? rank(cur.position, prev.position) : false}
        />
      </div>

      {w.topPage && (
        <p className="text-xs text-muted-foreground">
          أعلى صفحة:{" "}
          <a
            href={`https://www.modonty.com${encodeURI(w.topPage.path)}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            {pageLabel(w.topPage.path)}
          </a>{" "}
          — {n(w.topPage.clicks)} نقرة،{" "}
          <b className={cn(w.topPage.share >= 40 && "text-amber-700 dark:text-amber-400")}>{Math.round(w.topPage.share)}٪ من النقرات</b>
        </p>
      )}
    </div>
  );
}

/**
 * A page as a reader would name it: the slug's words, not a URL. A mixed Latin/Arabic path
 * («/articles/اليوم-الوطني…») renders scrambled in a right-to-left line.
 */
function pageLabel(path: string) {
  if (path === "/") return "الصفحة الرئيسية";
  return path.replace(/^\/(articles|clients|categories|tags|industries)\//, "").replace(/^\//, "").replace(/-/g, " ");
}

/** `value` is the signed number (shown left-to-right so the minus stays in front); `word` reads after it. */
type Change = { value: string; word?: string; wordAfter?: boolean; good: boolean | null } | null;

/** Percent change; null when there is nothing before to compare with. */
function change(cur: number, prev: number): Change {
  if (!prev) return null;
  const pct = Math.round(((cur - prev) / prev) * 100);
  return { value: `${pct > 0 ? "+" : ""}${n(pct)}%`, good: pct === 0 ? null : pct > 0 };
}

/** CTR moves in percentage points — a percent of a percent misleads. */
function points(cur: GoogleTotals, prev: GoogleTotals): Change {
  if (!prev.impressions) return null;
  const d = cur.ctr - prev.ctr;
  return { value: `${d > 0 ? "+" : ""}${d.toFixed(2)}`, word: "نقطة", wordAfter: true, good: Math.abs(d) < 0.005 ? null : d > 0 };
}

/** Position: lower is better, so a fall is the good direction. */
function rank(cur: number | null, prev: number | null): Change {
  if (cur === null || prev === null) return null;
  const d = cur - prev;
  if (Math.abs(d) < 0.05) return { value: "", word: "بدون تغيير", good: null };
  return { value: Math.abs(d).toFixed(1), word: d < 0 ? "تحسّن" : "تراجع", good: d < 0 };
}

function Metric({ label, value, change }: { label: string; value: string; change: Change | false }) {
  const tone = change ? change.good : null;
  return (
    <div className="bg-card px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold tabular-nums" dir="ltr" style={{ textAlign: "right" }}>
        {value}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xs font-semibold",
          tone === true && "text-emerald-600 dark:text-emerald-400",
          tone === false && "text-red-600 dark:text-red-400",
          tone === null && "text-muted-foreground",
        )}
      >
        {change ? (
          <>
            {!change.wordAfter && change.word && <>{change.word} </>}
            {change.value && <bdi dir="ltr">{change.value}</bdi>}
            {change.wordAfter && <> {change.word}</>}
          </>
        ) : change === false ? (
          // «All time» has no period before it — an empty line keeps the four cells level.
          " "
        ) : (
          "لا فترة قبلها"
        )}
      </p>
    </div>
  );
}
