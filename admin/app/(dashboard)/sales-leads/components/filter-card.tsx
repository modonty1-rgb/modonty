"use client";

import { cn } from "@/lib/utils";

/**
 * بطاقة مجموعة ترشيح — واحدة تخدم المرحلة والسوق والمصدر.
 *
 * ── لماذا صفوفٌ لا حبّات `CountTab` ──
 *
 * المعيار #١ يفرض الحبّة لشريط الترشيح، وسياقه **شريطٌ أفقيّ فوق جدول**. وهذه أعمدةٌ عرضها
 * ٢٦٠ بكسلاً: الحبّات فيها تتكسّر بأطوالٍ مختلفة فتُقرأ ككومةٍ مبعثرة (مقيس على ١٤ مصدراً —
 * سبعة أسطر رواغة)، وأعدادها تسبح كلٌّ في مكان فلا تُقارَن.
 *
 * والصفّ يحلّ الثلاثة: الاسم عند الحافّة والعدد عند الأخرى **فتصطفّ الأعداد عمودياً** وتُقرأ
 * مقارنةً بنظرة — وهو الغرض الذي طلبه خالد من عرض كل المصادر ولو بصفر. وهدف الضغط يصير
 * بعرض البطاقة لا بعرض الكلمة.
 *
 * ── ولماذا «الكل» في الرأس ──
 *
 * «المفتوح» و«السوقان» و«كل المصادر» فعلٌ واحد بثلاثة أسماء: **امسح هذا البُعد**. وكانت
 * حبّةً بين الحبّات، فتُقرأ خياراً خامساً من جنس الأربعة وهي ليست منها (خالد ٥ سبتمبر).
 * ومكانها الرأس: موضعٌ ثابت في البطاقات الثلاث، ويحمل الإجمالي الذي تُنسب إليه الأعداد.
 */
export function FilterCard({
  title,
  /** نصّ زرّ المسح — «المفتوح» · «السوقان» · «كل المصادر». */
  allLabel,
  allCount,
  /** لا شيء مُرشَّح في هذه المجموعة الآن. */
  isAll,
  onAll,
  children,
}: {
  title: string;
  allLabel: string;
  allCount: React.ReactNode;
  isAll: boolean;
  onAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card" aria-label={title}>
      <header className="flex items-center justify-between gap-2 border-b bg-muted/30 px-2 py-1.5">
        <h3 className="text-[11px] font-medium text-muted-foreground">{title}</h3>
        <button
          type="button"
          onClick={onAll}
          aria-pressed={isAll}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] transition-colors",
            "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isAll
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground",
          )}
        >
          {allLabel}
          <span className="tabular-nums opacity-60">{allCount}</span>
        </button>
      </header>
      <ul className="p-1">{children}</ul>
    </section>
  );
}

/**
 * صفٌّ واحد — الاسم والعدد على حافّتين، فتصطفّ الأعداد.
 *
 * والصفر يبقى ظاهراً ولا يُضغط: هو جوابٌ («هذه القناة لم تجب أحداً») لا فراغ، والضغط عليه
 * يعطي قائمةً فارغة — طريقٌ مسدود.
 */
export function FilterRow({
  label,
  count,
  active,
  onClick,
  disabled = false,
  dot,
}: {
  label: React.ReactNode;
  count: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** نقطة لون المرحلة — تسبق الاسم حيث تكون للبُعد ألوانٌ متّفق عليها. */
  dot?: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={active}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-start text-xs transition-colors",
          "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          active
            ? "bg-primary text-primary-foreground"
            : disabled
              ? "cursor-default text-muted-foreground/50"
              : "text-foreground hover:bg-muted",
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {dot && (
            <span
              className={cn("size-1.5 shrink-0 rounded-full", dot, active && "opacity-70")}
              aria-hidden
            />
          )}
          <span className="truncate">{label}</span>
        </span>
        <span className={cn("shrink-0 tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
          {count}
        </span>
      </button>
    </li>
  );
}
