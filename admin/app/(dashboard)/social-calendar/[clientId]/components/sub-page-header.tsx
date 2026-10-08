import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * رأس الصفحات الفرعية للمنشور (جديد · تعديل · إنتاج · نشر · تفصيل) — نفس رأس القديم:
 * «← الشهر / شارة الصفحة + العنوان» ثم «سير العمل» واسم العميل.
 */
export function SubPageHeader({
  backHref,
  backLabel,
  badge,
  title,
  clientName,
  maxWidth = "max-w-6xl",
}: {
  backHref: string;
  backLabel: string;
  badge?: ReactNode;
  title: ReactNode;
  clientName: string;
  maxWidth?: string;
}) {
  return (
    <header className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-border bg-card px-4 py-3 shadow-sm sm:-mx-6 sm:-mt-6">
      <div className={`mx-auto flex items-center gap-3 ${maxWidth}`}>
        <Link
          href={backHref}
          className="-mx-2 flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          {backLabel}
        </Link>
        <span className="text-muted-foreground">/</span>
        <div className="flex min-w-0 items-center gap-2">
          {badge}
          <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
        </div>
        <Link
          href="/social-calendar/flow"
          className="ms-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Sparkles className="h-3 w-3" />
          سير العمل
        </Link>
        <span className="shrink-0 text-xs text-muted-foreground opacity-60">{clientName}</span>
      </div>
    </header>
  );
}
