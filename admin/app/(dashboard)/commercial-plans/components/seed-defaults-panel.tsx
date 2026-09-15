"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DatabaseZap, Loader2, PackageOpen, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { seedCommercialDefaults } from "../actions/seed-commercial-defaults";

/**
 * الحالة الفارغة لشاشة الباقات — وفيها زرّ تحميل الافتراضي.
 *
 * ── ليش هنا، ولا تظهر إلا والقاعدة فارغة ──
 * `/commercial-plans` أوّل شاشة في مجموعة «إدارة الدفع» وأشملها، وهي أوّل ما يُفتح على
 * قاعدةٍ جديدة فيوجد فارغاً. فالزرّ تحت العين لحظة الحاجة، لا في شاشةٍ يُبحَث عنها.
 *
 * ولا يُعرض حين توجد بيانات: زرٌّ دائمٌ يزرع ستّة جداول هو ضغطةٌ واحدة بين أسعارٍ معتمدة
 * وأسعارٍ من التطوير. والإخفاء طبقةٌ أولى فقط — الحارس الحقيقيّ في
 * `seed-commercial-defaults.ts` يعيد العدّ قبل أن يكتب.
 *
 * ── ويُقال ما سيُزرع قبل الضغط ──
 * الأرقام من البذرة نفسها لا مكتوبة هنا، فلا تتقادم حين تُصدَّر بذرةٌ جديدة.
 */
export function SeedDefaultsPanel({
  summary,
}: {
  summary: {
    version: number;
    exportedAt: string | null;
    features: number;
    plans: number;
    prices: number;
    assignments: number;
    terms: number;
    markets: string[];
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = [
    { label: "مزايا في المكتبة", value: summary.features },
    { label: "باقات", value: summary.plans },
    { label: "أسعار (سوق × باقة)", value: summary.prices },
    { label: "إسناد ميزة لباقة", value: summary.assignments },
    { label: "مدد اشتراك", value: summary.terms },
    { label: "نصوص أسواق", value: summary.markets.join(" · ") || "—" },
  ];

  async function run() {
    setBusy(true);
    setError(null);
    const res = await seedCommercialDefaults();
    setBusy(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  const loading = busy || pending;

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-6 sm:p-8" dir="rtl">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <PackageOpen className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-foreground">لا توجد باقات بعد</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            صفحة الدفع لا تُرسم بلا هذه الجداول كلّها. حمّل البيانات الافتراضية بضغطة، ثم
            عدّلها من هنا — أو أنشئ باقة يدوياً من الأسفل.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5">
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd className="font-bold tabular-nums text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border-2 border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={run} disabled={loading} size="lg" className="gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <DatabaseZap className="size-4" />}
              {loading ? "جارٍ التحميل…" : "حمّل البيانات الافتراضية"}
            </Button>
            <span className="text-xs text-muted-foreground">
              نسخة {summary.version}
              {summary.exportedAt ? ` · صُدّرت ${summary.exportedAt}` : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
