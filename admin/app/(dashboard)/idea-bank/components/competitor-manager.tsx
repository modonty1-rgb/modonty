"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { addCompetitor } from "../actions/add-competitor";
import { setCompetitorActive } from "../actions/set-competitor-active";

export type CompetitorRow = { domain: string; name: string; active: boolean };

/**
 * قائمة المنافسين في تبويبهم — الفريق يضيف نطاقاً أو يوقفه، والرادار يرصد المفعَّل منهم الأحد والأربعاء.
 * المصدر أخبار قوقل (`site:`)، فموقعٌ لا تفهرسه أخبار قوقل يُرصد صفراً — يُقال ذلك تحت النموذج.
 */
export function CompetitorManager({ competitors }: { competitors: CompetitorRow[] }) {
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, after?: () => void) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (!r.success) setError(r.error ?? "تعذّر الحفظ");
      else after?.();
      router.refresh();
    });

  return (
    <details className="rounded-lg border bg-muted/30 p-3" open={competitors.length === 0}>
      <summary className="cursor-pointer text-sm font-semibold">
        قائمة المنافسين <span className="tabular-nums text-muted-foreground">({competitors.filter((c) => c.active).length} مفعَّل)</span>
      </summary>
      <div className="mt-3 space-y-3">
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addCompetitor({ domain, name }), () => { setDomain(""); setName(""); });
          }}
        >
          <Input dir="ltr" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="arageek.com" className="h-9 w-48" aria-label="نطاق المنافس" />
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم — أراجيك" className="h-9 w-40" aria-label="اسم المنافس" />
          <Button type="submit" size="sm" disabled={pending || !domain || !name}>أضف منافساً</Button>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </form>
        <p className="text-xs text-muted-foreground">
          نرصد جديد كل منافس في الأسبوع من أخبار قوقل — موقعٌ لا تفهرسه أخبار قوقل (كموسوعات المحتوى) قد يُرصد صفراً.
        </p>
        {competitors.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {competitors.map((c) => (
              <li key={c.domain} className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-sm", !c.active && "opacity-50")}>
                <span>{c.name}</span>
                <span dir="ltr" className="text-xs text-muted-foreground">{c.domain}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => setCompetitorActive({ domain: c.domain, active: !c.active }))}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {c.active ? "إيقاف" : "تفعيل"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
