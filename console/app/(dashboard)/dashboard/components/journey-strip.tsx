import { ChevronLeft, Eye, MessageSquareHeart, MousePointerClick, Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface Step {
  value: number;
  previous: number | null;
}

interface JourneyStripProps {
  impressions: Step | null;
  clicks: Step | null;
  views: Step;
  contacts: Step;
}

/**
 * The period read as a journey, not four separate boxes (Khalid, 30 Sep 2026 — «فكّر كدكتور نفسي»):
 * Google showed you → people came in → they read → they reached out.
 *
 * Why this shape: a lone bold «0 تواصل» reads as a verdict — «أنا أدفع على إيش؟» — and a loss
 * weighs about twice a gain, so it drowned the 5,136 impressions beside it. So the contacts
 * step appears only once there is one, and the biggest win opens the row in the brand colour.
 * Growth is said as people say it («٦ أضعاف») — a «+653%» from a small base means little.
 */
export function JourneyStrip({ impressions, clicks, views, contacts }: JourneyStripProps) {
  const steps = [
    { key: "impressions", icon: Search, label: "ظهرت في جوجل", unit: "مرة", step: impressions, lead: true },
    { key: "clicks", icon: MousePointerClick, label: "دخلوا من جوجل", unit: "زائر", step: clicks },
    { key: "views", icon: Eye, label: "قرأوا على مدونتي", unit: "مشاهدة", step: views },
    // No contact yet → no card at all (Khalid, 30 Sep 2026: «الكرت هذا… تشيله أحسن»). It
    // appears with the first booking or message; a zero step is not shown as a step.
    ...(contacts.value > 0
      ? [{ key: "contacts", icon: MessageSquareHeart, label: "تواصلوا معك", unit: "تواصل", step: contacts }]
      : []),
  ];

  return (
    <ol className={cn("grid grid-cols-2 gap-3", steps.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <li
            key={s.key}
            className={cn(
              "relative flex flex-col gap-1.5 rounded-xl border p-4 shadow-sm",
              s.lead ? "border-primary/30 bg-primary/5" : "border-border bg-card",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className={cn("h-4 w-4", s.lead ? "text-primary" : "text-muted-foreground")} aria-hidden />
              {s.label}
            </span>

            {s.step === null ? (
              <span className="text-sm text-muted-foreground">بيانات جوجل غير متاحة الآن</span>
            ) : (
              <>
                <span className={cn("text-3xl font-bold tabular-nums leading-none", s.lead ? "text-primary" : "text-foreground")}>
                  {s.step.value.toLocaleString()}
                  <span className="ms-1.5 text-sm font-medium text-muted-foreground">{s.unit}</span>
                </span>
                <Growth current={s.step.value} previous={s.step.previous} />
              </>
            )}

            {/* The arrow points to the next step (RTL: leftwards), desktop only where the row is one line. */}
            {i < steps.length - 1 && (
              <ChevronLeft className="absolute -left-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-background text-muted-foreground xl:block" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Growth in words people use; a dip is said plainly and quietly — never a red alarm on a small base. */
function Growth({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) return null;
  if (previous === 0) {
    return current > 0 ? <span className="text-xs font-medium text-emerald-700">جديد هالفترة</span> : null;
  }
  const ratio = current / previous;
  if (ratio >= 2) {
    // Arabic counting: ضعف · ٣–١٠ أضعاف · ١١+ ضعفاً.
    const n = Math.round(ratio);
    const times = n === 2 ? "ضعف" : n <= 10 ? `${n} أضعاف` : `${n} ضعفاً`;
    return <span className="text-xs font-medium text-emerald-700">{times} الفترة السابقة</span>;
  }
  const pct = Math.round((ratio - 1) * 100);
  if (pct > 0) return <span className="text-xs font-medium text-emerald-700">أكثر من الفترة السابقة بـ{pct}٪</span>;
  if (pct === 0) return <span className="text-xs text-muted-foreground">مثل الفترة السابقة</span>;
  return <span className="text-xs text-muted-foreground">أقل من الفترة السابقة بـ{Math.abs(pct)}٪</span>;
}
