"use client";

import { cn } from "@/lib/utils";

/**
 * Admin filter/status toggle — a pill split into two segments: label | count,
 * divided by a splitter. When active the count segment inverts colour so it never
 * blends into the fill. Entity-standard #1 — the single source of truth; reuse it,
 * never rebuild it.
 */
export function CountTab({
  label,
  count,
  active,
  onClick,
  disabled = false,
}: {
  label: React.ReactNode;
  /** `ReactNode` لا `number`: الشاشات العربية تمرّر العدد منسَّقاً بأرقام هندية. */
  count: React.ReactNode;
  active: boolean;
  onClick: () => void;
  /**
   * صفرٌ يُقرأ ولا يُضغط.
   *
   * الترشيح على صفر يعطي جدولاً فارغاً — طريقٌ مسدود يُدخَل ثم يُخرَج منه. والحبّة تبقى ظاهرة
   * لأن الصفر نفسه معلومة: «هذه القناة لم تجب أحداً».
   */
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center overflow-hidden whitespace-nowrap rounded-full border text-xs font-medium transition-colors",
        active ? "border-primary" : "border-border",
        disabled ? "cursor-default opacity-60" : !active && "hover:bg-accent",
      )}
    >
      <span className={cn("px-2.5 py-1", active ? "bg-primary text-primary-foreground" : "text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "border-s px-2 py-1 font-bold tabular-nums",
          active
            ? "border-primary-foreground/30 bg-primary-foreground text-primary"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}
