import Link from "next/link";
import { ChevronRight, ImageOff } from "lucide-react";

import { db } from "@/lib/db";
import { MEDIA_UNUSED_WHERE } from "@/lib/media/usage-where";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@modonty/database/lib/utils";
import { UnusedMediaList } from "../components/unused-media-list";
import { FixBrokenMediaButton } from "../components/fix-broken-media-button";
import { getOptimizableImages } from "./helpers/optimizable";
import { OptimizeImagesSection } from "./components/optimize-images-section";

// Housekeeping tools moved off the library browse surface (2026-07-21): unused-files
// review + broken-image scan. Both are maintenance actions, not part of browsing.
export default async function MediaMaintenancePage() {
  const UNUSED_WHERE = { AND: [{ scope: { not: "PLATFORM" as const } }, MEDIA_UNUSED_WHERE] };

  const [unusedItems, unusedCount, unusedSize, optimizable] = await Promise.all([
    db.media.findMany({
      where: UNUSED_WHERE,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
        type: true,
        client: { select: { name: true } },
      },
    }),
    db.media.count({ where: UNUSED_WHERE }),
    db.media.aggregate({ where: UNUSED_WHERE, _sum: { fileSize: true } }),
    getOptimizableImages(),
  ]);

  const totalUnusedBytes = unusedSize._sum.fileSize ?? 0;

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Media Maintenance</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            أدوات صيانة مكتبة الوسائط — تبقى المكتبة نظيفة وكل صورة شغّالة.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
          <Link href="/media">
            <ChevronRight className="h-3.5 w-3.5" />
            Media Library
          </Link>
        </Button>
      </div>

      {/* Summary chips — the numbers this page answers */}
      <div className="flex flex-wrap gap-2.5">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2">
          <span className={`text-lg font-extrabold ${unusedCount > 0 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}>
            {unusedCount}
          </span>
          <span className="text-[11px] text-muted-foreground">ملف غير مستخدم</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2">
          <span className="text-lg font-extrabold text-muted-foreground">{formatBytes(totalUnusedBytes)}</span>
          <span className="text-[11px] text-muted-foreground">مساحة مهدورة</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2">
          <span className={`text-lg font-extrabold ${optimizable.length > 0 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}>
            {optimizable.length}
          </span>
          <span className="text-[11px] text-muted-foreground">تحتاج تحسين</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2">
          <span className="text-lg font-extrabold text-muted-foreground">—</span>
          <span className="text-[11px] text-muted-foreground">صور مكسورة (شغّل الفحص)</span>
        </div>
      </div>

      {/* Tool 1 — Image optimizer: non-WebP or oversized images, one-by-one → WebP */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Optimize images{optimizable.length > 0 ? ` (${optimizable.length})` : ""}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          صور غير WebP أو أثقل من الحد الموصى به (300KB) — من كل المكتبة بما فيها معارض العملاء.
          «حوّل لـ WebP» يعيد ضغط الصورة الواحدة بنفس أداة الكونسول ويحدّث كل مكان تُستخدم فيه.
        </p>
        <OptimizeImagesSection images={optimizable} />
      </section>

      {/* Tool 2 — Broken images scan (compact action, kept above the long list) */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Broken images</h2>
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ImageOff className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">فحص الصور المكسورة</p>
                <p className="mt-0.5 max-w-[52ch] text-xs text-muted-foreground">
                  يفحص كل ملف مقابل Cloudinary — أي صورة ملفها محذوف يُبدَّل رابطها لصورة المنصّة
                  الافتراضية بدل صورة مكسورة على الموقع. المصمّم يرفع البديل لاحقاً.
                </p>
              </div>
            </div>
            <FixBrokenMediaButton />
          </CardContent>
        </Card>
      </section>

      {/* Tool 2 — Unused files (full list inline, no dialog) */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Unused files{unusedCount > 0 ? ` (${unusedCount})` : ""}
          </h2>
          {unusedCount > 100 && (
            <span className="text-[11px] text-muted-foreground">يعرض أحدث 100 · احذف لتظهر البقية</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          ملفات مرفوعة غير مربوطة بأي مقال أو عميل — لكل ملف: افتحه لإعادة ربطه، أو احذفه (يُحذف من Cloudinary وقاعدة البيانات).
        </p>
        {unusedItems.length > 0 ? (
          <UnusedMediaList items={unusedItems} />
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/5 px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-400">
            ✓ لا توجد ملفات غير مستخدمة — المكتبة نظيفة.
          </div>
        )}
      </section>
    </div>
  );
}
