import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { JOB_STATUS_BADGE, JOB_STATUS_LABEL } from "../helpers/video-labels";
import { AssetCard } from "./components/asset-card";
import type { AssetCopy } from "./components/copy-editor";

export const metadata = { title: "فيديو مقالة" };

const N = new Intl.NumberFormat("ar-EG");
const when = new Intl.DateTimeFormat("ar-EG", { timeZone: "Asia/Riyadh", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const STEP_LABEL: Record<string, string> = { fetch: "الجلب", script: "السكربت", voice: "الصوت", render: "الصنع", qa: "الفحص", upload: "الرفع", publish: "النشر" };

/**
 * صفحة القرار لفيديو مقالة واحدة: كل ملف بتشغيله ومنصّاته الأربع ونصّه. التنبيه فوق لو خطوة فشلت مرتين.
 * العقد: documents/video-factory/03-contract.md.
 */
export default async function VideoJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  const job = await db.videoJob.findUnique({
    where: { id },
    select: {
      id: true, status: true, revision: true, updatedAt: true, articleUrl: true, long: true, shorts: true, copy: true,
      items: true, errors: true, qa: true,
      article: { select: { title: true } },
      client: { select: { name: true } },
    },
  });
  if (!job) notFound();

  const copy = (job.copy ?? {}) as Record<string, AssetCopy>;
  const assets = [
    ...(job.long ? [{ key: "long", url: job.long.url, seconds: job.long.seconds, series: null as string | null }] : []),
    ...job.shorts.map((s) => ({ key: s.key, url: s.url, seconds: s.seconds, series: s.series ?? null })),
  ];
  const openErrors = job.status === "NEEDS_ATTENTION" ? job.errors.slice(-3).reverse() : [];

  return (
    <div dir="rtl" className="space-y-4">
      <header className="space-y-1">
        <Link href="/videos" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowRight className="size-3" aria-hidden /> الفيديوهات
        </Link>
        <h1 className="text-lg font-semibold" dir="auto">{job.article.title}</h1>
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("rounded-full px-2 py-0.5 font-semibold", JOB_STATUS_BADGE[job.status])}>{JOB_STATUS_LABEL[job.status]}</span>
          <span dir="auto">{job.client.name}</span>
          <span>· النسخة {N.format(job.revision)}</span>
          <span>· آخر تحديث {when.format(job.updatedAt)}</span>
          <a href={job.articleUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">· المقالة ↗</a>
          {job.qa && !job.qa.passed ? <span className="text-rose-700 dark:text-rose-300">· الفحص الآلي فيه ملاحظات: {job.qa.failures.join("، ")}</span> : null}
        </p>
      </header>

      {openErrors.length ? (
        <section className="space-y-1 rounded-lg border border-rose-500/40 bg-rose-500/5 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
            <AlertTriangle className="size-4" aria-hidden /> خطوة فشلت مرتين على السيرفر
          </p>
          {openErrors.map((e, i) => (
            <p key={i} className="text-xs text-rose-900 dark:text-rose-200">
              <b>{STEP_LABEL[e.step] ?? e.step}</b> · {e.message} · {when.format(e.at)}
            </p>
          ))}
        </section>
      ) : null}

      {assets.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">لسه ما وصلت ملفات هذي المقالة من المصنع.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {assets.map((a) => (
            <AssetCard
              key={a.key}
              jobId={job.id}
              asset={a.key}
              file={a.url}
              seconds={a.seconds}
              series={a.series}
              copy={copy[a.key] ?? {}}
              items={job.items
                .filter((i) => i.asset === a.key)
                .map((i) => ({ platform: i.platform, status: i.status, approvedByName: i.approvedByName, note: i.note, url: i.url, error: i.error }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
