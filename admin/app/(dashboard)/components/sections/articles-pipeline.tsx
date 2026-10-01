import Link from "next/link";
import { FileCheck, FileText, FileX, type LucideIcon } from "lucide-react";
import { ArticleStatus } from "@prisma/client";

import { articleSeoQuality, articleStatusCounts, ymylUncitedCount } from "@/lib/dashboard/cached";
import { GoogleIcon } from "@/components/admin/icons/google-icon";
import type { Tier } from "../dashboard-ui";
import { PanelHead } from "../panel-head";
import { SeoHealthCard } from "../seo-health-card";
import { BudgetRow, NUM, RAIL } from "../pipeline-row";

/**
 * The article pipeline.
 * Rendered as ranked-strip ROWS — same visual language as "Today — start here"
 * (Khalid 2026-07-23: «بدل كروت، نفس فكرة Start Today») — so the whole page reads
 * as one system. Live stages get a row; empty stages compress into one chip line
 * at the bottom — a zero is good news, it earns a chip not a row.
 */

const STAGES: Array<{
  status: ArticleStatus;
  key: string;
  label: string;
  tier: Tier;
  icon: LucideIcon;
}> = [
  { status: ArticleStatus.AWAITING_APPROVAL, key: "awaiting-approval", label: "بانتظار الموافقة", tier: "warm", icon: FileCheck },
  { status: ArticleStatus.NEEDS_REVISION, key: "needs-revision", label: "تحتاج تعديل", tier: "warm", icon: FileX },
  // Client approved, no date yet — the team owes it a date (27 Sep 2026).
  { status: ArticleStatus.APPROVED, key: "approved", label: "معتمد بلا تاريخ", tier: "warm", icon: FileCheck },
  { status: ArticleStatus.DRAFT, key: "draft", label: "مسودة", tier: "plain", icon: FileText },
  { status: ArticleStatus.WRITING, key: "writing", label: "يُكتب", tier: "plain", icon: FileText },
  { status: ArticleStatus.SCHEDULED, key: "scheduled", label: "مجدول", tier: "plain", icon: FileText },
  { status: ArticleStatus.PUBLISHED, key: "published", label: "منشور على مدونتي", tier: "ok", icon: FileCheck },
  // Live on the client's own site — was missing from the stages, so the pipeline read «289»
  // while the SEO number counted 313 (30 Sep 2026).
  { status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE, key: "published-on-client-site", label: "منشور على موقع العميل", tier: "ok", icon: FileCheck },
  { status: ArticleStatus.ARCHIVED, key: "archived", label: "مؤرشف", tier: "plain", icon: FileX },
];

export async function ArticlesPipeline() {
  const [counts, ymylUncited, seoQuality] = await Promise.all([
    articleStatusCounts(),
    ymylUncitedCount(),
    articleSeoQuality(),
  ]);
  const total = STAGES.reduce((sum, s) => sum + counts[s.status], 0);
  const needDecision = counts[ArticleStatus.AWAITING_APPROVAL] + counts[ArticleStatus.NEEDS_REVISION];

  // The "from outside" indicators (Khalid 2026-07-23): one glance says healthy or not.
  // Denominator = every scored article, the exact population the two SEO rows split.
  const totalScored = seoQuality.perfect + seoQuality.below;
  const ymylRiskPct = totalScored > 0 ? Math.round((ymylUncited / totalScored) * 100) : 0;
  const ymylTier: Tier = ymylRiskPct === 0 ? "ok" : ymylRiskPct >= 30 ? "hot" : "warm";

  const empty = STAGES.filter((s) => counts[s.status] === 0);

  return (
    <>
      <PanelHead
        title="المقالات"
        hint="كل مراحل المقال"
        right={
          <Link href="/articles" className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline">
            <span
              className={`text-base font-bold tabular-nums ${
                needDecision > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {needDecision}
            </span>
            تحتاج قرار
            <span className="text-muted-foreground/40">·</span>
            {/* /articles lists every stage except the client-site ones, which have their own
                page — so the link says the number it opens, and the 313 stays on the bar below. */}
            {(total - counts[ArticleStatus.PUBLISHED_ON_CLIENT_SITE]).toLocaleString("en-US")} في صفحة المقالات
            <span className="text-primary">←</span>
          </Link>
        }
      />
      <SeoHealthCard
        score={seoQuality.avgScore}
        perfect={seoQuality.perfect}
        below={seoQuality.below}
        checks={seoQuality.checks}
        secondary={{
          label: "خطر YMYL",
          pct: ymylRiskPct,
          tier: ymylTier,
          caption: `${ymylUncited.toLocaleString("en-US")} بلا مصادر`,
        }}
      />
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Whole pipeline in ONE row: total headline + a segmented budget bar (stages are a
            true partition — each article in exactly one) + per-stage drill-ins. */}
        {total > 0 && (
          <BudgetRow
            total={total}
            label="مقال"
            icon={FileText}
            reviewHref="/articles"
            segments={STAGES.map((s) => ({
              key: s.status,
              href: `/articles/segment/${s.key}`,
              label: s.label,
              value: counts[s.status],
              tier: s.tier,
            }))}
          />
        )}
        {/* Quality/risk row (not a pipeline stage): YMYL articles missing citations. */}
        {ymylUncited > 0 && (
          <Link
            href="/articles/segment/ymyl-uncited"
            className="relative grid grid-cols-[2.25rem_4.5rem_1fr] items-center gap-3 border-b px-4 py-2.5 transition hover:bg-muted/40 md:grid-cols-[2.25rem_4.5rem_1fr_auto]"
          >
            <span className={`absolute inset-y-0 start-0 w-0.5 ${RAIL.warm}`} />
            <span className="justify-self-center rounded bg-amber-500/15 px-1.5 py-1 text-xs font-extrabold leading-none tracking-tight text-amber-600 dark:text-amber-400">
              YMYL
            </span>
            <span className={`text-xl font-extrabold leading-none tabular-nums ${NUM.warm}`}>
              {ymylUncited.toLocaleString("en-US")}
            </span>
            <span className="text-[13px] leading-snug">
              مقالات YMYL بلا مصادر
              <span className="mt-0.5 block text-xs text-muted-foreground">
                خطر E-E-A-T — أضف مصادر موثوقة
              </span>
            </span>
            <span className="hidden text-xs font-bold text-primary md:block">أضف مصادر ←</span>
          </Link>
        )}
        {/* SEO health of EVERY article (computed score, any status): below 100 = fixable.
            Red row = a Google/SEO problem; the Google mark on white makes the meaning literal. */}
        {seoQuality.below > 0 && (
          <Link
            href="/articles/segment/seo-imperfect"
            className="relative grid grid-cols-[2.25rem_4.5rem_1fr] items-center gap-3 border-b bg-red-500/10 px-4 py-2.5 transition hover:bg-red-500/15 md:grid-cols-[2.25rem_4.5rem_1fr_auto]"
          >
            <span className={`absolute inset-y-0 start-0 w-0.5 ${RAIL.hot}`} />
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white ring-1 ring-black/5">
              <GoogleIcon className="h-4 w-4" />
            </span>
            <span className={`text-xl font-extrabold leading-none tabular-nums ${NUM.hot}`}>
              {seoQuality.below.toLocaleString("en-US")}
            </span>
            <span className="text-[13px] leading-snug">
              مقالات فيها نقص سيو
              <span className="mt-0.5 block text-xs text-muted-foreground">
                أي حالة — فحوص ميتا أو JSON-LD ناقصة
              </span>
            </span>
            <span className="hidden text-xs font-bold text-primary md:block">أصلح ←</span>
          </Link>
        )}
        {/* Green row = perfect on the shared rubric; same Google mark, opposite signal. */}
        {seoQuality.perfect > 0 && (
          <Link
            href="/articles/segment/seo-perfect"
            className="relative grid grid-cols-[2.25rem_4.5rem_1fr] items-center gap-3 border-b bg-emerald-500/10 px-4 py-2.5 transition hover:bg-emerald-500/15 md:grid-cols-[2.25rem_4.5rem_1fr_auto]"
          >
            <span className={`absolute inset-y-0 start-0 w-0.5 ${RAIL.ok}`} />
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white ring-1 ring-black/5">
              <GoogleIcon className="h-4 w-4" />
            </span>
            <span className={`text-xl font-extrabold leading-none tabular-nums ${NUM.ok}`}>
              {seoQuality.perfect.toLocaleString("en-US")}
            </span>
            <span className="text-[13px] leading-snug">
              مقالات سيوها كامل
              <span className="mt-0.5 block text-xs text-muted-foreground">
                أي حالة — ما فيها شي يحتاج إصلاح
              </span>
            </span>
            <span className="hidden text-xs font-bold text-primary md:block">اعرض ←</span>
          </Link>
        )}
        {empty.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
              مراحل فاضية
            </span>
            {empty.map((s) => (
              <span
                key={s.status}
                className="rounded-full border bg-card px-2.5 py-0.5 text-xs tabular-nums text-muted-foreground"
              >
                <b className="font-bold text-foreground">0</b> {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
