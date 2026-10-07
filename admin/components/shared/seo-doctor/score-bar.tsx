import { tone } from "./tone";

export function ScoreBar({ label, score }: { label: string; score: number }) {
  const t = tone(score);
  const color = t === "good" ? "bg-emerald-500" : t === "warn" ? "bg-amber-500" : "bg-red-500";
  const text = t === "good" ? "text-emerald-600 dark:text-emerald-400" : t === "warn" ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="rounded-xl border p-3.5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-bold">{label}</span>
        <span className={`text-lg font-extrabold ${text}`}>{score}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
