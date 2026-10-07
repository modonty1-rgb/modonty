import { tone } from "./tone";

export function ScorePill({ score }: { score: number }) {
  const t = tone(score);
  if (t === "good") {
    return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">{score}% · سليم</span>;
  }
  const cls = t === "warn"
    ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400"
    : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400";
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>{score}%</span>;
}
