import type { PaymentAttemptStage, Prisma } from "@prisma/client";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { FailureFilters, type FilterState } from "./components/failure-filters";
import { attemptOutcomeCopy } from "./helpers/attempt-outcome-copy";
import { ATTEMPT_STAGES, attemptStageCopy } from "./helpers/attempt-stage-copy";

/**
 * إخفاقات الدفع — كل محاولة ماتت، وأين ماتت، وماذا قال البنك (PAY-G16).
 *
 * لماذا شاشة وليست استعلاماً عند الحاجة: `PAY-G14`/`PAY-G15` صارا يجمعان بيانات ثمينة عن
 * كل عملية فاشلة، وبلا شاشة تنام في القاعدة ولا يقرؤها أحد — وهو عطل جبر سيو نفسه قبل أن
 * يبنيها. الصفحة قراءة فقط: لا إجراء هنا، القرار يُتَّخذ بعد القراءة لا فيها.
 *
 * خصوصية: تعرض `cardBin` (ستّة أرقام: بنك وبلد الإصدار) ولا تعرض بريد المشتري كاملاً —
 * السؤال هنا «لماذا تفشل الدفعات؟» لا «من هذا الشخص؟».
 */

export const dynamic = "force-dynamic";

const TAKE = 100;
const DEFAULT_DAYS = 30;
const ALLOWED_DAYS = [7, 30, 90];
const MARKETS = ["SA", "EG"];

const dateTime = new Intl.DateTimeFormat("ar-SA", {
  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh",
});

export default async function PaymentFailuresPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; market?: string; days?: string }>;
}) {
  const params = await searchParams;

  // كل بارامتر يمرّ بقائمة مغلقة قبل أن يلمس الاستعلام — العنوان مدخل من الخارج.
  const stage = ATTEMPT_STAGES.find((s) => s === params.stage);
  const market = MARKETS.find((m) => m === params.market);
  const days = ALLOWED_DAYS.includes(Number(params.days)) ? Number(params.days) : DEFAULT_DAYS;
  const state: FilterState = { stage, market, days };

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const windowWhere: Prisma.PaymentAttemptWhereInput = { createdAt: { gte: since } };
  const where: Prisma.PaymentAttemptWhereInput = { ...windowWhere, ...(stage ? { stage } : {}), ...(market ? { market } : {}) };

  const [rows, total, stageRows, reasonRows] = await Promise.all([
    db.paymentAttempt.findMany({
      where,
      select: {
        id: true, createdAt: true, stage: true, outcome: true, state: true, reasonCode: true,
        message: true, market: true, planSlug: true, paidMonths: true, cardScheme: true,
        cardBin: true, orderId: true, order: { select: { number: true } },
      },
      orderBy: { createdAt: "desc" },
      take: TAKE,
    }),
    db.paymentAttempt.count({ where: windowWhere }),
    db.paymentAttempt.groupBy({ by: ["stage"], where: windowWhere, _count: { _all: true } }),
    // أكثر الأسباب تكراراً — الرقم الذي يقول «أصلح هذا أوّلاً» بدل قراءة مئة صفّ.
    db.paymentAttempt.groupBy({ by: ["reasonCode"], where, _count: { _all: true }, orderBy: { _count: { reasonCode: "desc" } }, take: 6 }),
  ]);

  const stageCounts = Object.fromEntries(stageRows.map((r) => [r.stage, r._count._all])) as Partial<Record<PaymentAttemptStage, number>>;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 pb-8" dir="rtl">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">إدارة الدفع</p>
        <h1 className="text-2xl font-semibold">إخفاقات الدفع</h1>
        <p className="text-sm text-muted-foreground">
          كل محاولة دفع ماتت: في أي خطوة، وماذا قال البنك، ومن أي بلد صدرت البطاقة. قراءة فقط — لا يراها المشتري أبداً.
        </p>
      </header>

      <FailureFilters state={state} stageCounts={stageCounts} total={total} />

      {reasonRows.length > 0 ? (
        <section className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
          <span className="text-xs font-semibold text-muted-foreground">أكثر الأسباب</span>
          {reasonRows.map((r) => (
            <span key={r.reasonCode ?? "none"} className="rounded-lg border px-2.5 py-1 text-xs">
              <span className="font-mono" dir="ltr">{r.reasonCode ?? "—"}</span>
              <span className="ms-1.5 font-bold">{r._count._all}</span>
            </span>
          ))}
        </section>
      ) : null}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <ShieldAlert className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-semibold">لا إخفاق في هذه المدّة</p>
          <p className="text-sm text-muted-foreground">
            وسّع المدّة أو أزِل المرشّحات. وإن كان البيع لم يبدأ بعد، فهذا هو المتوقَّع.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوقت</TableHead>
                <TableHead>المرحلة</TableHead>
                <TableHead>النتيجة</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>البطاقة</TableHead>
                <TableHead>السوق والباقة</TableHead>
                <TableHead>الطلب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const stageCopy = attemptStageCopy(row.stage);
                const outcomeCopy = attemptOutcomeCopy(row.outcome);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{dateTime.format(row.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-semibold">{stageCopy.label}</span>
                      {/* الوسم الذي يجيب السؤال الأهم: هل مات قبل أن يصير طلباً؟ */}
                      {stageCopy.beforeOrder ? (
                        <span className="ms-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">قبل الطلب</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      <span className={outcomeCopy.tone === "declined" ? "font-semibold text-amber-600 dark:text-amber-400" : "font-semibold text-destructive"}>
                        {outcomeCopy.label}
                      </span>
                      {row.state ? <span className="ms-1.5 font-mono text-[11px] text-muted-foreground" dir="ltr">{row.state}</span> : null}
                    </TableCell>
                    <TableCell className="max-w-[18rem] text-xs">
                      {row.reasonCode ? <span className="font-mono" dir="ltr">{row.reasonCode}</span> : null}
                      {row.message ? <span className="block text-muted-foreground">{row.message}</span> : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {row.cardScheme ?? "—"}
                      {row.cardBin ? <span className="ms-1.5 font-mono text-muted-foreground" dir="ltr">{row.cardBin}••</span> : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {row.market ?? "—"}
                      {row.planSlug ? <span className="block text-muted-foreground">{row.planSlug}{row.paidMonths ? ` · ${row.paidMonths} أشهر` : ""}</span> : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {row.orderId && row.order ? (
                        <Link href={`/orders/${row.orderId}`} className="font-mono underline underline-offset-4" dir="ltr">{row.order.number}</Link>
                      ) : (
                        <span className="text-muted-foreground">بلا طلب</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {rows.length === TAKE ? (
        <p className="text-xs text-muted-foreground">يُعرض أحدث {TAKE} صفّاً فقط. ضيّق المدّة أو المرحلة لرؤية ما قبلها.</p>
      ) : null}
    </main>
  );
}
