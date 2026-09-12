import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * ترويسة مستند واحدة يستعملها دليل الفريق والـPlaybook معًا.
 * رُقّيت من `guidelines/components/guideline-layout` لمّا انتقلت صفحات إلى الـPlaybook
 * واحتاجت الشكل نفسه — فصارت لها مستهلكان في مسارين، وهذا شرط الترقية.
 */
export function DocLayout({
  title,
  description,
  parentHref = "/playbook",
  parentLabel = "دليل الفريق",
  children,
}: {
  title: string;
  description: string;
  parentHref?: string;
  parentLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-5 px-6 py-6" dir="rtl">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link href={parentHref} className="flex items-center gap-1 transition-colors hover:text-foreground">
          <ChevronRight className="h-3.5 w-3.5" />
          {parentLabel}
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="font-medium text-foreground">{title}</span>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
      </div>

      {children}
    </div>
  );
}
