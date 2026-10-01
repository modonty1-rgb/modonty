import Link from "next/link";
import { AlertTriangle, Database, Image as ImageIcon } from "lucide-react";

import { mediaCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, Ghost, TierCard, ZChip } from "../dashboard-ui";
import { PanelHead } from "../panel-head";

/**
 * Media. Two questions only:
 * is it used, and can search read it. SEO gaps are amber — this week's work — and
 * unused files are plain: they cost storage, not clients (the tier system's whole point).
 */

export async function MediaLibrary() {
  const { total, used, unused, noAlt, failingSeo, noDimensions } = await mediaCounts();

  return (
    <>
      <PanelHead
        title="الوسائط"
        hint="الاستخدام والبحث"
        right={
          <Link href="/media" className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline">
            <span
              className={`text-base font-bold tabular-nums ${
                failingSeo > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {failingSeo}
            </span>
            تفشل في السيو
            <span className="text-muted-foreground/40">·</span>
            {used.toLocaleString("en-US")} من {total.toLocaleString("en-US")} مستخدمة
            <span className="text-primary">←</span>
          </Link>
        }
      />
      <div className={CARD_GRID}>
        <TierCard
          href="/media/segment/failing-seo"
          tier={failingSeo > 0 ? "warm" : "ok"}
          icon={AlertTriangle}
          value={failingSeo}
          label="تفشل في السيو"
          note="تحت 60 — النص البديل هو الحل، 40 من 100 نقطة"
        />
        <TierCard
          href="/media/segment/no-alt"
          tier={noAlt > 0 ? "warm" : "ok"}
          icon={ImageIcon}
          value={noAlt}
          label="بلا نص بديل (alt)"
          note="ما تظهر في صور جوجل"
        />
        <TierCard
          href="/media/segment/unused"
          tier="plain"
          icon={Database}
          value={unused}
          label="غير مستخدمة"
          note="تنظيف — تخزين بس، ما يكسر شي"
        />
        {noDimensions === 0 ? (
          <Ghost title="سليم">
            <ZChip good>
              <b className="font-bold">0</b> بلا أبعاد — سليم
            </ZChip>
          </Ghost>
        ) : (
          <TierCard
            href="/media/segment/no-dimensions"
            tier="warm"
            icon={ImageIcon}
            value={noDimensions}
            label="بلا أبعاد"
            note="ما تصلح صورة مشاركة — الصفحة تقفز وهي تتحمّل"
          />
        )}
      </div>
    </>
  );
}
