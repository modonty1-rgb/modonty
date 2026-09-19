"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileStack, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { runDocumentsMigration } from "../actions/run-documents-migration";
import type { DocumentsPlan } from "../helpers/plan-documents";

/**
 * **لوحةُ ترحيل الوثائق — تُري ما ستفعله قبل أن تفعله.**
 *
 * نفسُ عقد لوحة الطلبات: الجردُ يصل مرسوماً من الخادم، والزرُّ لا يُضغط على المجهول.
 * والفرقُ أنّ هذه **تضيف ولا تمسح**، فلا تحذيرَ أحمرَ ولا تأكيدَ مضاعف — ورسالةُ
 * «لا شيءَ يُرحَّل» حالةٌ صحيحةٌ تُقال بوضوح بدل زرٍّ يُضغط فلا يحدث شيء.
 */
export function DocumentsMigrationPanel({ plan }: { plan: DocumentsPlan }) {
  const router = useRouter();
  const { toast } = useToast();
  const [running, start] = useTransition();
  const [done, setDone] = useState<{ created: number; skipped: number } | null>(null);

  const total = plan.candidates.length;

  function run() {
    start(async () => {
      const res = await runDocumentsMigration();
      if (!res.ok) {
        toast({ variant: "destructive", title: "لم يتمّ", description: res.error });
        return;
      }
      setDone({ created: res.created, skipped: res.skipped });
      toast({ title: "تمّ الترحيل", description: `${res.created} وثيقة` });
      router.refresh();
    });
  }

  return (
    <section dir="rtl" className="rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <FileStack className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold">ترحيل وثائق العملاء</h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            تُجمع الروابطُ المبعثرة — صورةُ التوثيق عندنا ورخصةُ YMYL في ملفّ العميل — في
            جدولٍ واحدٍ له اسمٌ وتاريخٌ ومصدر. الملفّاتُ تبقى مكانَها على Bunny.
          </p>
        </div>
      </div>

      {done ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] p-3 text-[12px] text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          رُحِّلت <b className="tabular-nums">{done.created}</b> وثيقة
          {done.skipped ? ` · وتُخطّيت ${done.skipped} مرحَّلةٌ سابقاً` : ""}.
        </p>
      ) : total === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed p-3 text-[12px] text-muted-foreground">
          لا شيءَ يُرحَّل
          {plan.alreadyMigrated ? ` — ${plan.alreadyMigrated} وثيقةٌ مرحَّلةٌ من قبل.` : "."}
        </p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="من صورة التوثيق" value={plan.fromVerification} />
            <Stat label="من رخص YMYL" value={plan.fromYmyl} />
            <Stat label="روابط خارجيّة" value={plan.external} tone={plan.external ? "warn" : undefined} />
            <Stat label="مرحَّلةٌ سابقاً" value={plan.alreadyMigrated} />
          </dl>

          {plan.external > 0 && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] p-3 text-[11.5px] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {plan.external} رابطاً خارجَ مخزننا — تُرحَّل موسومةً في الملاحظة، فقد تختفي
              من مصدرها في أيّ وقت.
            </p>
          )}

          {/* عيّنةٌ تُرى قبل الضغط: الجردُ رقمٌ، والعيّنةُ تجعله ملموساً. */}
          <ul className="mt-3 max-h-44 space-y-1 overflow-y-auto rounded-lg border p-2">
            {plan.candidates.slice(0, 12).map((c, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                <span className="truncate">
                  {c.clientName} — <span className="text-muted-foreground">{c.label}</span>
                </span>
                <span className={`shrink-0 text-[10px] ${c.external ? "text-amber-600" : "text-muted-foreground"}`}>
                  {c.source === "CLIENT" ? "العميل" : "الفريق"}
                  {c.external ? " · خارجيّ" : ""}
                </span>
              </li>
            ))}
            {total > 12 ? (
              <li className="pt-1 text-center text-[11px] text-muted-foreground">…و{total - 12} غيرها</li>
            ) : null}
          </ul>

          <Button onClick={run} disabled={running} className="mt-3 gap-2">
            {running ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FileStack className="size-4" aria-hidden />}
            {running ? "جارٍ الترحيل…" : `رحّل ${total} وثيقة`}
          </Button>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-2.5 py-2">
      <dd className={`text-base font-bold tabular-nums ${tone === "warn" ? "text-amber-600 dark:text-amber-400" : ""}`}>
        {value}
      </dd>
      <dt className="text-[10.5px] text-muted-foreground">{label}</dt>
    </div>
  );
}
