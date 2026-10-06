import { Star } from "lucide-react";

const FMT = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 });

/**
 * Five stars that a screen reader actually reads. The label sat on a bare <span> — no role,
 * so it was never announced — and printed the raw average «٤٫٦٦٦٦ من ٥» (4 Oct 2026).
 * `role="img"` makes it one announced image; the number is rounded to one decimal.
 */
export function Stars({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return (
    <span role="img" className="flex items-center gap-0.5" aria-label={`التقييم ${FMT.format(n)} من ٥`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < Math.round(n) ? `${size} fill-amber-400 text-amber-400` : `${size} text-muted-foreground/40`} aria-hidden />
      ))}
    </span>
  );
}
