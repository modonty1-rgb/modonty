"use client";

import { AlertTriangle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One control in the site sub-bar. 48px tall, icon beside the label — a row of fifteen
 * stacked icon-over-label cards read as a wall; side by side they read as a toolbar.
 *
 * هنا لا داخل «موقعي»: الشريط نفسه صار على «محتوى الموقع» أيضاً (خالد ٣١ أغسطس)،
 * ونسخُ الزرّ في شاشتين يعني انحرافهما بعد أوّل تعديل.
 */
export function SiteToolButton({
  label,
  Icon,
  active,
  showing = false,
  badge,
  warn = 0,
  onClick,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  /** الصفحة المعروضة حالياً — ليست بالضرورة اللوحة المفتوحة. */
  showing?: boolean;
  badge?: string;
  /** عدد أقسام الصفحة الغائبة لنقص البيانات — يرفع مثلّث تنبيه على الأيقونة. */
  warn?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-haspopup="dialog"
      title={label}
      className={cn(
        "relative flex min-h-14 w-[84px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-1.5 text-[11px] font-medium leading-tight transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : showing
            ? "border-primary/40 bg-background text-foreground"
            : "border-transparent bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      {/* يلتفّ ولا يُبتَر: «الأسئلة الشائعة» و«الشريط العلوي» كانا يُقصّان عند ٧٦px،
          والتسمية المبتورة تسمية مكسورة — القارئ لا يعرف الزرّ الذي يضغطه. */}
      <span className="w-full text-balance text-center">{label}</span>
      {badge && (
        <span
          title={`${badge} قسماً مطفأً`}
          className={cn(
            "absolute -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold shadow-sm",
            "inset-inline-end-[-4px]",
            active ? "bg-primary-foreground text-primary" : "bg-muted-foreground/80 text-background",
          )}
          dir="ltr"
        >
          {badge}
        </span>
      )}
      {/* مثلّث التنبيه: صفحة فيها أقسام لن يراها الزائر. لونه كهرمانيّ لا أحمر —
          نقصٌ يُكمَّل، لا عطل. والضغط يفتح شرحاً لا إعداداً. */}
      {warn > 0 && (
        <span
          title={`${warn} أقسام ما تظهر للزائر — اضغط للتفصيل`}
          className="absolute -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-background shadow-sm inset-inline-end-[-4px]"
        >
          <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
        </span>
      )}
    </button>
  );
}
