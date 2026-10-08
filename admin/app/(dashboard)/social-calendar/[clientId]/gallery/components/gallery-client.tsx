"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { SocialAssetKind, SocialPostStatus } from "@prisma/client";
import { ChevronLeft, ChevronRight, Film, ImageIcon, Play, Trash2, Upload } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { justifyRows, shouldContainTile } from "@modonty/shared/lib/justify-rows";
import { formatBytes } from "@modonty/shared/lib/upload-with-progress";

import { removeSocialAsset } from "../../../actions";
import { AssetMedia } from "../../../components/asset-media";
import { StatusBadge } from "../../../components/status-badge";
import { MONTH_LABELS, monthParamOfDate } from "../../../helpers/dates";
import { ASSETS_LOCKED_STATUSES } from "../../../helpers/post-transitions";
import type { GalleryAsset, GalleryPost } from "../../../helpers/queries";
import { STATUS_LABEL, STATUS_ORDER } from "../../../helpers/social-labels";
import { DownloadButton } from "../../components/download-button";

interface Card {
  post: GalleryPost;
  asset: GalleryAsset;
  width: number | null;
  height: number | null;
}

/** عرض التعبئة الافتراضي — يحدّد كم بطاقة في الصفّ فقط؛ الصفّ يملأ عرضه الحقيقي دائماً. */
const PACK_WIDTH = 1100;

function cardDate(post: GalleryPost): string {
  return `${MONTH_LABELS[post.scheduledFor.getUTCMonth()]} ${post.scheduledFor.getUTCDate()}`;
}

/**
 * معرض الإبداع (القديم `GalleryClient.tsx`): فلاتر شهر/نوع/حالة، شبكة، معاينة بسابق/تالي وتحميل،
 * وحذف الأصل من Bunny في «قيد الإنتاج/جاهز للمراجعة» فقط (الخادم يرفضه بعدهما).
 *
 * الفرق المفروض: الفلاتر في الرابط، والشبكة صفوف مضبوطة (`gallery-justified-rows` — معيار كل
 * شبكات الصور في المستودع) بدل المربّعات المقصوصة، والحذف لمن يملك الإنتاج فقط.
 */
export function GalleryClient({
  posts,
  clientId,
  canDelete,
  currentMonth,
}: {
  posts: GalleryPost[];
  clientId: string;
  canDelete: boolean;
  currentMonth: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [preview, setPreview] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDeleting] = useTransition();

  const monthFilter = searchParams.get("month") ?? "all";
  const typeParam = searchParams.get("type");
  const typeFilter: SocialAssetKind | "all" = typeParam === "IMAGE" || typeParam === "VIDEO" ? typeParam : "all";
  const statusParam = searchParams.get("status");
  const statusFilter: SocialPostStatus | "all" =
    statusParam && (STATUS_ORDER as readonly string[]).includes(statusParam) ? (statusParam as SocialPostStatus) : "all";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const months = useMemo(() => [...new Set(posts.map((p) => monthParamOfDate(p.scheduledFor)))].sort(), [posts]);

  const allCards = useMemo<Card[]>(
    () => posts.flatMap((post) => post.assets.map((asset) => ({ post, asset, width: asset.width, height: asset.height }))),
    [posts],
  );

  const filtered = useMemo(
    () =>
      allCards.filter(({ post, asset }) => {
        if (monthFilter !== "all" && monthParamOfDate(post.scheduledFor) !== monthFilter) return false;
        if (typeFilter !== "all" && asset.kind !== typeFilter) return false;
        if (statusFilter !== "all" && post.status !== statusFilter) return false;
        return true;
      }),
    [allCards, monthFilter, typeFilter, statusFilter],
  );

  const rows = useMemo(() => justifyRows(filtered, PACK_WIDTH, 190, 12), [filtered]);
  const active = preview !== null ? filtered[preview] : null;
  const canDeleteActive = !!active && canDelete && !ASSETS_LOCKED_STATUSES.includes(active.post.status);

  function doDelete() {
    if (!active) return;
    const assetId = active.asset.id;
    startDeleting(async () => {
      const res = await removeSocialAsset(assetId);
      if (res.success) {
        toast({ title: "تم حذف الإبداع", variant: "success" });
        setConfirmDelete(false);
        setPreview(null);
        router.refresh();
      } else {
        toast({ title: res.error, variant: "destructive" });
      }
    });
  }

  const selectCls =
    "h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card px-5 py-2.5">
        <select aria-label="الشهر" value={monthFilter} onChange={(e) => setParam("month", e.target.value)} className={selectCls}>
          <option value="all">كل الشهور</option>
          {months.map((m) => {
            const [y, mo] = m.split("-").map(Number);
            return (
              <option key={m} value={m}>
                {MONTH_LABELS[mo - 1]} {y}
              </option>
            );
          })}
        </select>

        <div className="flex overflow-hidden rounded-lg border border-border bg-background text-sm">
          {(["all", "IMAGE", "VIDEO"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setParam("type", t)}
              aria-pressed={typeFilter === t}
              className={cn(
                "h-8 px-3 transition-colors",
                typeFilter === t ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t === "all" ? "الكل" : t === "IMAGE" ? "صور" : "فيديو"}
            </button>
          ))}
        </div>

        <select aria-label="الحالة" value={statusFilter} onChange={(e) => setParam("status", e.target.value)} className={selectCls}>
          <option value="all">كل الحالات</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <span className="ms-auto text-xs text-muted-foreground">{filtered.length} ملف</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {allCards.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground/40">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">لا يوجد إبداع مرفوع بعد</p>
              <p className="mt-1 text-xs text-muted-foreground">ارفع ملفات من صفحة الإنتاج لكل منشور</p>
            </div>
            {/* القديم كان يشير لـ /calendar/apr ثابتاً (باگ) — هنا الشهر الحالي. */}
            <Link
              href={`/social-calendar/${clientId}/${currentMonth}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload className="h-3.5 w-3.5" />
              اذهب للكالندر
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-30" />
            <p className="text-sm">لا توجد ملفات مطابقة للفلاتر</p>
            <button
              type="button"
              onClick={() => window.history.replaceState(null, "", window.location.pathname)}
              className="text-xs text-primary hover:underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row, ri) => (
              <div key={ri} className="flex gap-3">
                {row.items.map(({ tile, grow }) => {
                  const idx = filtered.indexOf(tile);
                  return (
                    <div
                      key={tile.asset.id}
                      className="flex min-w-0 flex-col gap-1.5"
                      style={row.isLast ? { flex: `0 0 ${(row.height * grow).toFixed(1)}px` } : { flex: `${grow} 1 0` }}
                    >
                      <button
                        type="button"
                        onClick={() => setPreview(idx)}
                        className="group relative w-full overflow-hidden rounded-xl border border-border bg-muted/40 transition-all hover:border-primary/50 hover:shadow-md"
                        style={{ aspectRatio: String(grow) }}
                      >
                        {tile.asset.kind === "IMAGE" ? (
                          // eslint-disable-next-line @next/next/no-img-element -- مصغّر من CDN بنسبته الحقيقية.
                          <img
                            src={tile.asset.url}
                            alt={tile.asset.label ?? ""}
                            loading="lazy"
                            className={cn("h-full w-full", shouldContainTile(tile) ? "object-contain" : "object-cover")}
                          />
                        ) : (
                          <video src={tile.asset.url} muted preload="metadata" className="h-full w-full bg-black object-contain" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <span
                          className={cn(
                            "absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 transition-opacity",
                            tile.asset.kind === "VIDEO" ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {tile.asset.kind === "VIDEO" ? <Play className="h-3 w-3 text-white" /> : <ImageIcon className="h-3 w-3 text-white" />}
                        </span>
                      </button>
                      <div className="px-0.5">
                        <p className="truncate text-xs font-medium leading-tight text-foreground">
                          {tile.post.idea || `يوم ${tile.post.scheduledFor.getUTCDate()}`}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            {tile.asset.kind === "IMAGE" ? <ImageIcon className="h-2.5 w-2.5" /> : <Film className="h-2.5 w-2.5" />}
                            {cardDate(tile.post)}
                          </span>
                          {tile.asset.bytes ? (
                            <span className="text-[10px] text-muted-foreground/70">{formatBytes(tile.asset.bytes)}</span>
                          ) : null}
                        </div>
                        <div className="mt-0.5">
                          <StatusBadge status={tile.post.status} dot={false} className="px-1.5 py-px" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent dir="rtl" className="gap-0 overflow-hidden bg-background p-0 sm:max-w-3xl">
          {active && preview !== null && (
            <>
              <DialogHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 border-b border-border px-4 py-3 pe-12">
                <DialogTitle className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {active.post.idea || `يوم ${active.post.scheduledFor.getUTCDate()}`}
                </DialogTitle>
                <span className="shrink-0 text-[11px] text-muted-foreground">{cardDate(active.post)}</span>
                <StatusBadge status={active.post.status} dot={false} className="px-2 py-px" />
                <DownloadButton url={active.asset.url} filename={active.asset.label || active.post.idea || "ملف"} className="h-7" />
                {canDeleteActive && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex h-7 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </button>
                )}
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {preview + 1} / {filtered.length}
                </span>
                <button
                  type="button"
                  aria-label="السابق"
                  onClick={() => setPreview(Math.max(0, preview - 1))}
                  disabled={preview <= 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="التالي"
                  onClick={() => setPreview(Math.min(filtered.length - 1, preview + 1))}
                  disabled={preview >= filtered.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </DialogHeader>
              <div className="flex max-h-[75vh] min-h-[50vh] items-center justify-center overflow-hidden bg-black/5 p-3 dark:bg-black/30">
                <AssetMedia asset={active.asset} className="max-h-[70vh] max-w-full rounded-lg shadow-lg" />
              </div>
              {(active.asset.width || active.asset.bytes) && (
                <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
                  {active.asset.width && active.asset.height ? (
                    <span className="tabular-nums">
                      {active.asset.width} × {active.asset.height} px
                    </span>
                  ) : null}
                  {active.asset.bytes ? <span>{formatBytes(active.asset.bytes)}</span> : null}
                </div>
              )}
              {/* ملفات المنشور نفسه (القديم `GalleryClient.tsx:416-433`) — النقر ينقل المعاينة إليها. */}
              {active.post.assets.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3">
                  {active.post.assets.map((a) => {
                    const idx = filtered.findIndex((c) => c.asset.id === a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        disabled={idx < 0}
                        onClick={() => setPreview(idx)}
                        aria-label={a.label || "ملف"}
                        className={cn(
                          "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all disabled:opacity-40",
                          a.id === active.asset.id ? "border-primary" : "border-transparent hover:border-border",
                        )}
                      >
                        {a.kind === "IMAGE" ? (
                          // eslint-disable-next-line @next/next/no-img-element -- مصغّر 48px من CDN.
                          <img src={a.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <video src={a.url} muted preload="metadata" className="h-full w-full object-cover" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإبداع؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا الملف نهائياً من المعرض ومن بَني. لا يمكن التراجع.
              {active?.asset.label && <span className="mt-2 block font-semibold text-foreground">{active.asset.label}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                doDelete();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "جاري الحذف..." : "نعم، احذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
