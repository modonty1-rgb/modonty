import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { ar } from "@/lib/ar";

interface AttentionStripProps {
  pendingArticles: number;
  pendingComments: number;
  newSupport: number;
}

/**
 * «يحتاج انتباهك» as one thin line, and only what actually waits for him. It used to be three
 * big cards that said «تمت الموافقة على الكل» most days — a sticky block of nothing. Sticky on
 * desktop (Khalid, 30 Sep 2026) when there is something; a quiet «nothing waiting» otherwise.
 */
export function AttentionStrip({ pendingArticles, pendingComments, newSupport }: AttentionStripProps) {
  const d = ar.dashboard;
  const items = [
    { n: pendingArticles, label: d.attentionArticles, href: "/dashboard/articles" },
    { n: pendingComments, label: d.attentionComments, href: "/dashboard/comments" },
    { n: newSupport, label: d.attentionSupport, href: "/dashboard/support" },
  ].filter((i) => i.n > 0);

  if (items.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
        {d.attentionClear}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-500/30 dark:bg-amber-500/10 lg:sticky lg:top-2 lg:z-20 lg:shadow-sm">
      <span className="flex items-center gap-1.5 text-sm font-bold text-amber-800 dark:text-amber-300">
        <AlertCircle className="h-4 w-4" aria-hidden />
        {d.actionItemsTitle}
      </span>
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="inline-flex min-h-9 items-center rounded-full bg-white px-3 text-sm font-medium text-foreground ring-1 ring-amber-200 hover:ring-amber-400 dark:bg-background max-md:min-h-11"
        >
          {i.label.replace("{n}", String(i.n))}
        </Link>
      ))}
    </div>
  );
}
