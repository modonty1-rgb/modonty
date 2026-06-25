import { cn } from "@/lib/utils";

const arNum = new Intl.NumberFormat("ar-SA");

interface HeroGoogleStatProps {
  /** Digital-impact total from GA4 (pageViews + sessions + activeUsers + events). */
  value: number;
  /** "md" = desktop hero bar · "sm" = compact, matches the mobile stats strip height. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Standalone «موثّق من Google» box for the END of the client hero bar — the live
 * digital-impact number under a big Google mark. Same trust language as the footer
 * (dark gradient + indigo glow) so it reads as verified Google data on any theme.
 * Server Component (zero client JS); the caller hides it when value is 0.
 */
export function HeroGoogleStat({ value, size = "md", className }: HeroGoogleStatProps) {
  const sm = size === "sm";
  return (
    <div
      className={cn(
        "flex flex-shrink-0 flex-col items-center justify-center rounded-xl border border-indigo-500/35 bg-gradient-to-br from-[#0d1424] to-[#111827] shadow-[0_0_18px_rgba(99,102,241,0.22)]",
        sm ? "gap-0.5 px-3 py-1.5" : "gap-1 px-4 py-2",
        className
      )}
      title="موثّق من Google Analytics — بيانات حيّة"
    >
      <svg viewBox="0 0 24 24" className={sm ? "h-[18px] w-[18px]" : "h-[26px] w-[26px]"} aria-label="Google">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      <b className={cn("font-black leading-none tabular-nums text-white", sm ? "text-[15px]" : "text-[20px]")}>
        {arNum.format(value)}
      </b>
      <span className={cn("flex items-center gap-1 font-medium text-white/60", sm ? "text-[9px]" : "text-[10px]")}>
        الأثر الرقمي
        <span className="font-extrabold text-emerald-400" aria-hidden="true">✓</span>
      </span>
    </div>
  );
}
