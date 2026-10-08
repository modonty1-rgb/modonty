"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SocialAssetKind } from "@prisma/client";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Film,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { uploadWithProgress } from "@modonty/shared/lib/upload-with-progress";

import {
  addSocialVideoAsset,
  markSocialPostReady,
  removeSocialAsset,
  requestSocialVideoUpload,
  updateSocialAssetLabel,
} from "../../../../../actions";
import { AssetMedia } from "../../../../../components/asset-media";
import { FORMAT_ICON, FUNNEL_ICON } from "../../../../../components/brief-icons";
import { ChannelIcon } from "../../../../../components/channel-icon";
import { MONTH_LABELS, dayName } from "../../../../../helpers/dates";
import { ASSETS_LOCKED_STATUSES } from "../../../../../helpers/post-transitions";
import type { SocialAssetRow, SocialPostRow } from "../../../../../helpers/queries";
import { FORMAT_LABEL, FUNNEL_SHORT_LABEL, STATUS_LABEL } from "../../../../../helpers/social-labels";

const MB = 1024 * 1024;
const IMAGE_LIMIT = 4 * MB;
const VIDEO_LIMIT = 500 * MB;
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
/** تأخير إعادة المحاولة الموثّق عند Bunny — نفس قيم رفع الريلز في الكونسول. */
const RETRY_DELAYS = [0, 3000, 5000, 10000, 20000, 60000, 60000];

interface PendingRow {
  tempId: string;
  kind: SocialAssetKind;
  label: string;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-5 py-4">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function Missing() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-amber-600 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span className="text-xs font-medium">لم يُحدَّد بعد — تواصل مع كاتب المحتوى</span>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-muted-foreground/70">{label}</p>
      {!value ? (
        <Missing />
      ) : /^https?:\/\//i.test(value) ? (
        <a href={value} target="_blank" rel="noopener noreferrer" dir="ltr" className="inline-flex items-center gap-1.5 break-all text-sm text-primary underline">
          {value.length > 70 ? `${value.slice(0, 70)}…` : value}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : multiline ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{value}</p>
      ) : (
        <p className="text-sm text-foreground">{value}</p>
      )}
    </div>
  );
}

/** شريط تقدّم الرفع — بايتات حقيقية (XHR أو tus)، كالقديم. */
function Progress({ percent }: { percent: number }) {
  return (
    <div className="px-3 pb-1 pt-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-primary">{percent >= 100 ? "اكتمل الرفع" : "جاري الرفع..."}</span>
        <span className="text-[11px] font-bold tabular-nums text-primary">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** يقرأ أبعاد الفيديو من الملف نفسه في المتصفّح — لا شيء يُرفع لقراءتها. */
function probeVideo(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      resolve({ width: el.videoWidth, height: el.videoHeight });
      URL.revokeObjectURL(url);
    };
    el.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    el.src = url;
  });
}

/**
 * صفحة المصمم (القديم `ProductionForm.tsx`): البريف للقراءة — الناقص بتنبيه كهرماني —، لافتة سبب
 * الرفض، ثم قائمة الأصول: لكل صفّ نوع (صورة/فيديو) · تسمية · رفع بشريط تقدّم · نسخ الرابط · فتح · حذف.
 * «جاهز للمراجعة» يُفعَّل بأصل مرفوع واحد على الأقل، والقفل بعد الموافقة كالقديم.
 *
 * الفرق: كل رفع يُحفظ فوراً صفّاً في القاعدة (القديم كان يحفظ القائمة عند «جاهز للمراجعة» فقط،
 * فالرفع في مرحلة المراجعة كان يضيع)، والحذف يحذف الملف من Bunny أيضاً بعد تأكيد.
 * الصور عبر route بجانب الصفحة (٤MB)، والفيديو tus مباشرة إلى Bunny Stream.
 */
export function ProductionForm({
  post,
  canProduce,
  backHref,
}: {
  post: SocialPostRow;
  canProduce: boolean;
  backHref: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [assets, setAssets] = useState<SocialAssetRow[]>(post.assets);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialAssetRow | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = ASSETS_LOCKED_STATUSES.includes(post.status);
  const editable = canProduce && !locked;
  const isReview = post.status === "READY_FOR_REVIEW";
  const d = post.scheduledFor;
  const FormatIcon = post.format ? FORMAT_ICON[post.format] : ImageIcon;
  const dayLine = `${dayName(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())} ${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

  async function copyUrl(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.warn("[social-calendar] clipboard failed", error);
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  }

  function addRow() {
    setPending((p) => [...p, { tempId: crypto.randomUUID(), kind: "VIDEO", label: post.idea.slice(0, 200) }]);
  }

  function patchRow(tempId: string, patch: Partial<PendingRow>) {
    setPending((p) => p.map((r) => (r.tempId === tempId ? { ...r, ...patch } : r)));
  }

  function setPct(tempId: string, pct: number | null) {
    setProgress((p) => {
      const next = { ...p };
      if (pct === null) delete next[tempId];
      else next[tempId] = pct;
      return next;
    });
  }

  function onUploaded(tempId: string, asset: SocialAssetRow) {
    setAssets((a) => [...a, asset]);
    setPending((p) => p.filter((r) => r.tempId !== tempId));
    setPct(tempId, null);
    toast({ title: "تم رفع الملف", variant: "success" });
    router.refresh();
  }

  async function uploadImage(row: PendingRow, file: File) {
    setPct(row.tempId, 0);
    try {
      const res = await uploadWithProgress<{ asset?: SocialAssetRow; error?: string }>({
        endpoint: `${pathname}/upload`,
        file,
        fields: { label: row.label },
        onProgress: (p) => setPct(row.tempId, Math.min(99, p.percent ?? 0)),
      });
      if (res.ok && res.data?.asset) {
        onUploaded(row.tempId, res.data.asset);
      } else {
        toast({ title: res.data?.error ?? `فشل الرفع (HTTP ${res.status})`, variant: "destructive" });
        setPct(row.tempId, null);
      }
    } catch (error) {
      console.error("[social-calendar] image upload failed", error);
      toast({ title: "فشل الاتصال أثناء الرفع. تحقق من الإنترنت وحاول مرة أخرى.", variant: "destructive" });
      setPct(row.tempId, null);
    }
  }

  async function uploadVideo(row: PendingRow, file: File) {
    if (!VIDEO_TYPES.includes(file.type)) {
      toast({ title: "الصيغة غير مدعومة — استخدم MP4 أو MOV أو WebM", variant: "destructive" });
      return;
    }
    setPct(row.tempId, 0);
    const ticketRes = await requestSocialVideoUpload(post.id, file.name);
    if (!ticketRes.success) {
      toast({ title: ticketRes.error, variant: "destructive" });
      setPct(row.tempId, null);
      return;
    }
    const { ticket } = ticketRes;
    const dims = await probeVideo(file);
    // يُحمَّل عند الحاجة فقط — مكتبة الرفع لا تدخل حزمة الأدمن الأولى.
    const { Upload: TusUpload } = await import("tus-js-client");
    const upload = new TusUpload(file, {
      endpoint: ticket.endpoint,
      retryDelays: RETRY_DELAYS,
      headers: {
        AuthorizationSignature: ticket.signature,
        AuthorizationExpire: String(ticket.expire),
        VideoId: ticket.videoId,
        LibraryId: ticket.libraryId,
      },
      metadata: { filetype: file.type, title: file.name },
      onProgress: (sent, total) => setPct(row.tempId, Math.min(99, Math.round((sent / total) * 100))),
      onError: (error) => {
        console.error("[social-calendar] tus upload failed", error);
        toast({ title: "الرفع تعثّر — جرّب مرة ثانية", variant: "destructive" });
        setPct(row.tempId, null);
      },
      onSuccess: async () => {
        const saved = await addSocialVideoAsset({
          postId: post.id,
          videoId: ticket.videoId,
          label: row.label,
          bytes: file.size,
          width: dims.width,
          height: dims.height,
        });
        if (saved.success) onUploaded(row.tempId, saved.asset);
        else {
          toast({ title: saved.error, variant: "destructive" });
          setPct(row.tempId, null);
        }
      },
    });
    upload.start();
  }

  function handleFile(row: PendingRow, file: File) {
    const isVideo = file.type.startsWith("video/");
    const limit = isVideo ? VIDEO_LIMIT : IMAGE_LIMIT;
    if (file.size > limit) {
      toast({
        title: `حجم الملف ${(file.size / MB).toFixed(1)}MB أكبر من الحد المسموح (${limit / MB}MB ${isVideo ? "للفيديو" : "للصور"}). اختر ملف أصغر.`,
        variant: "destructive",
      });
      return;
    }
    const kind: SocialAssetKind = isVideo ? "VIDEO" : "IMAGE";
    const r = { ...row, kind };
    patchRow(row.tempId, { kind });
    if (kind === "VIDEO") void uploadVideo(r, file);
    else void uploadImage(r, file);
  }

  async function saveLabel(asset: SocialAssetRow, label: string) {
    if ((asset.label ?? "") === label.trim()) return;
    const res = await updateSocialAssetLabel({ assetId: asset.id, label });
    if (!res.success) toast({ title: res.error, variant: "destructive" });
  }

  async function confirmDelete() {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    const res = await removeSocialAsset(target.id);
    if (res.success) {
      setAssets((a) => a.filter((x) => x.id !== target.id));
      toast({ title: "تم حذف الملف", variant: "success" });
      router.refresh();
    } else {
      toast({ title: res.error, variant: "destructive" });
    }
  }

  async function markReady() {
    setBusy(true);
    try {
      const res = await markSocialPostReady(post.id);
      if (res.success) {
        toast({ title: "تم تحديث الحالة إلى جاهز للمراجعة", variant: "success" });
        router.push(backHref);
      } else {
        toast({ title: res.error, variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  }

  const iconBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div className="space-y-5 pb-24">
      {(isReview || locked) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium",
            post.status === "PUBLISHED"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          هذا المنشور في مرحلة: <span className="font-bold">{STATUS_LABEL[post.status]}</span>
        </div>
      )}

      {!canProduce && (
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          عرض للقراءة — رفع الإبداع للمصمم وكاتب المحتوى.
        </div>
      )}

      {post.rejectionNote && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950/30">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">سبب الرفض</p>
            <p className="mt-0.5 whitespace-pre-wrap leading-relaxed text-red-600 dark:text-red-300">{post.rejectionNote}</p>
          </div>
        </div>
      )}

      {/* سطر المعلومات */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <span className="shrink-0 text-sm font-semibold text-foreground">{dayLine}</span>
        {post.format && (
          <>
            <div className="h-4 w-px shrink-0 bg-border" />
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
              <FormatIcon className="h-3 w-3" />
              {FORMAT_LABEL[post.format]}
            </span>
          </>
        )}
        {post.channels.length > 0 && (
          <>
            <div className="h-4 w-px shrink-0 bg-border" />
            <div className="flex items-center gap-1.5">
              {post.channels.map((ch) => (
                <ChannelIcon key={ch} channel={ch} />
              ))}
            </div>
          </>
        )}
        {post.funnelStages.length > 0 && (
          <>
            <div className="h-4 w-px shrink-0 bg-border" />
            <div className="flex flex-wrap gap-1.5">
              {post.funnelStages.map((s) => {
                const Icon = FUNNEL_ICON[s];
                return (
                  <span key={s} className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[10px] font-semibold text-foreground">
                    <Icon className="h-2.5 w-2.5 text-muted-foreground" />
                    {FUNNEL_SHORT_LABEL[s]}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
        <p className="mb-1.5 text-[11px] font-semibold text-primary/60">الفكرة</p>
        <p className="text-base font-bold leading-snug text-foreground">{post.idea}</p>
      </div>

      <Section title="المحتوى المكتوب">
        <Field label="النص" value={post.text} multiline />
        <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
          <Field label="الخطاف Hook" value={post.hook} />
          <Field label="الدعوة للتصرف CTA" value={post.cta} />
        </div>
      </Section>

      <Section title="تفاصيل الإنتاج">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="نبرة الصوت Voice Tone" value={post.voiceTone} />
          <Field label="الإلهام Reference" value={post.inspiration} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground/70">السيناريو Script</p>
          {post.scriptUrl ? (
            /^https?:\/\//i.test(post.scriptUrl) ? (
              <a href={post.scriptUrl} target="_blank" rel="noopener noreferrer" dir="ltr" className="inline-flex items-center gap-1.5 break-all text-sm text-primary underline">
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                {post.scriptUrl.length > 70 ? `${post.scriptUrl.slice(0, 70)}…` : post.scriptUrl}
              </a>
            ) : (
              <p className="text-sm text-foreground">{post.scriptUrl}</p>
            )
          ) : (
            <Missing />
          )}
        </div>
        <Field label="ملحوظات للمصمم Notes" value={post.notes} multiline />
      </Section>

      <Section title="الإبداع">
        <div className="space-y-3">
          {assets.map((asset, idx) => (
            <div key={asset.id} className="overflow-hidden rounded-xl border border-border bg-muted/20">
              <div className="border-b border-border bg-black/5">
                <AssetMedia asset={asset} className="h-auto max-h-64 w-full" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                    asset.kind === "VIDEO"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40",
                  )}
                  title={asset.kind === "VIDEO" ? "فيديو" : "صورة"}
                >
                  {asset.kind === "VIDEO" ? <Film className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                </span>
                <button type="button" onClick={() => void copyUrl(asset.id, asset.url)} className={iconBtn} title="نسخ الرابط">
                  {copiedId === asset.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <Input
                  defaultValue={asset.label ?? ""}
                  onBlur={(e) => void saveLabel(asset, e.target.value)}
                  placeholder={`تسمية — ملف ${idx + 1}`}
                  maxLength={200}
                  disabled={!editable}
                  className="h-8 min-w-0 flex-1 text-xs"
                />
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className={iconBtn} title="فتح">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {editable && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(asset)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="حذف"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {editable &&
            pending.map((row) => {
              const pct = progress[row.tempId];
              const uploading = pct !== undefined;
              return (
                <div key={row.tempId} className="overflow-hidden rounded-xl border border-dashed border-border bg-muted/20">
                  {uploading && <Progress percent={pct} />}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => patchRow(row.tempId, { kind: row.kind === "VIDEO" ? "IMAGE" : "VIDEO" })}
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        row.kind === "VIDEO"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40",
                      )}
                      title={row.kind === "VIDEO" ? "فيديو — اضغط للتغيير لصورة" : "صورة — اضغط للتغيير لفيديو"}
                    >
                      {row.kind === "VIDEO" ? <Film className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                    </button>
                    <Input
                      value={row.label}
                      onChange={(e) => patchRow(row.tempId, { label: e.target.value })}
                      placeholder="تسمية"
                      maxLength={200}
                      disabled={uploading}
                      className="h-8 min-w-0 flex-1 text-xs"
                    />
                    <label
                      className={cn(iconBtn, "cursor-pointer", uploading && "pointer-events-none opacity-60")}
                      title="رفع ملف"
                    >
                      <input
                        type="file"
                        accept={row.kind === "VIDEO" ? "video/mp4,video/quicktime,video/webm" : "image/*"}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(row, file);
                          e.target.value = "";
                        }}
                      />
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    </label>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => setPending((p) => p.filter((r) => r.tempId !== row.tempId))}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="إزالة الصفّ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {editable && (
            <button
              type="button"
              onClick={addRow}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              إضافة ملف
            </button>
          )}

          {assets.length === 0 && !editable && (
            <p className="py-2 text-center text-sm text-muted-foreground/70">لا يوجد ملفات مرفقة</p>
          )}
        </div>
      </Section>

      {/* شريط ثابت في الأسفل */}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-end gap-3">
          {canProduce && post.status === "IN_PRODUCTION" && (
            <Button
              type="button"
              disabled={busy || assets.length === 0 || Object.keys(progress).length > 0}
              onClick={() => void markReady()}
              className="h-10 shrink-0 gap-2 px-5 font-semibold"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy ? "جاري الحفظ..." : "جاهز للمراجعة"}
            </Button>
          )}
          <Button type="button" variant="outline" className="h-10 shrink-0" onClick={() => router.push(backHref)}>
            رجوع
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإبداع؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا الملف نهائياً من المنشور ومن بَني. لا يمكن التراجع.
              {deleteTarget?.label && <span className="mt-2 block font-semibold text-foreground">{deleteTarget.label}</span>}
              {isReview && assets.length === 1 && (
                <span className="mt-2 block text-amber-600">آخر ملف — سيرجع المنشور لـ«قيد الإنتاج».</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()} className="bg-red-600 text-white hover:bg-red-700">
              نعم، احذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
