"use client";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clapperboard,
  Clock,
  Image as ImageIcon,
  Video,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { approveReel, rejectReel } from "../actions/reel-approval";
import type { PendingReelRow } from "../helpers/load-reels";

// The approval queue (أ٥). One card per waiting reel; the two ق9 guards render as an
// explicit lock ON the approve button — the admin sees WHY it is locked, and the fix
// (the client edits the card in the console) instead of a dead button.

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function ReelsApprovalList({ reels }: { reels: PendingReelRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingReelRow | null>(null);
  const [reason, setReason] = useState("");

  if (reels.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border bg-card py-16 text-center">
        <Clapperboard className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-sm font-medium">قائمة الاعتماد فاضية</p>
        <p className="mt-1 text-xs text-muted-foreground">
          كل ريل يرفعه العميل من الكونسول يوصل هنا للمراجعة قبل ما يظهر على مودونتي.
        </p>
      </div>
    );
  }

  const handleApprove = (reel: PendingReelRow) => {
    setBusyId(reel.id);
    startTransition(async () => {
      const result = await approveReel(reel.id);
      setBusyId(null);
      if (result.success) {
        toast({
          title: "✅ اعتُمد ونُشر",
          description: `«${reel.title}» صار حيّاً في صفحة الريلز على مودونتي.`,
        });
        router.refresh();
      } else {
        toast({ title: "ما تم الاعتماد", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    const target = rejectTarget;
    setBusyId(target.id);
    startTransition(async () => {
      const result = await rejectReel(target.id, reason);
      setBusyId(null);
      if (result.success) {
        toast({
          title: "رُفض الريل",
          description: "العميل بيشوف السبب على بطاقة الريل في الكونسول، ويرجع للقائمة بعد التعديل.",
        });
        setRejectTarget(null);
        setReason("");
        router.refresh();
      } else {
        toast({ title: "ما تم الرفض", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-4">
      {reels.map((reel) => {
        const missingText = !reel.title?.trim() || !reel.description?.trim();
        const locked = missingText || reel.duplicateTitle;
        const busy = isPending && busyId === reel.id;

        return (
          <div key={reel.id} className="flex gap-4 rounded-xl border bg-card p-4">
            {/* Preview — a reel is portrait; the video plays right here so the admin
                reviews the actual clip, not a thumbnail of it. */}
            <div className="relative aspect-[9/16] w-[150px] shrink-0 overflow-hidden rounded-lg bg-muted">
              {reel.isVideo && reel.mp4Url ? (
                <video
                  src={reel.mp4Url}
                  poster={reel.previewUrl ?? undefined}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : reel.previewUrl ? (
                <OptimizedImage
                  fill media={asMedia(reel.previewUrl, reel.altText ?? "")} alt={reel.altText ?? ""} sizes="(max-width: 768px) 50vw, 240px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              {/* Client + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {reel.clientLogoUrl ? (
                    <OptimizedImage width={16} height={16} media={asMedia(reel.clientLogoUrl, "")} alt="" sizes="16px" className="h-4 w-4 rounded-full object-cover" />
                  ) : (
                    <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {reel.clientName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                  {reel.isVideo ? <Video className="h-3 w-3" aria-hidden="true" /> : <ImageIcon className="h-3 w-3" aria-hidden="true" />}
                  {reel.isVideo ? "فيديو" : "صورة"}
                  {reel.durationSec ? ` · ${reel.durationSec}ث` : ""}
                </span>
                {reel.inGallery && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    من معرض الصور
                  </span>
                )}
                <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {dateFmt.format(new Date(reel.createdAt))}
                </span>
              </div>

              {/* The three client-owned fields — exactly what the guards judge */}
              <div className="space-y-1.5">
                <Field label="العنوان" value={reel.title} highlight={reel.duplicateTitle} />
                <Field label="الوصف" value={reel.description} />
                {!reel.isVideo && <Field label="النص البديل" value={reel.altText} />}
              </div>

              {/* Guard notices — say why, and whose move it is */}
              {missingText && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  الاعتماد مقفول — {!reel.title?.trim() ? "العنوان" : "الوصف"} فاضي. العميل
                  يكمّله من بطاقة الريل في الكونسول؛ بدونه ما عندنا شي نوصفه به لمحرّك البحث،
                  فالريل ينشر ولا أحد يلقاه.
                </p>
              )}
              {reel.duplicateTitle && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                  الاعتماد مقفول — نفس العنوان مستعمل في ريل ثاني لنفس العميل. محرّك البحث
                  يشترط عنواناً فريداً لكل مقطع، ويتجاهل المكرّر.
                </p>
              )}

              {/* Decision */}
              <div className="flex items-center gap-2 pt-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="h-8 gap-1.5" disabled={locked || busy}>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      اعتماد ونشر
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader className="text-start">
                      <AlertDialogTitle>نشر الريل على مودونتي؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        «{reel.title}» بيظهر فوراً للزوار في صفحة الريلز. النص بعد الاعتماد
                        يتجمّد — العميل ما يقدر يعدّله إلا بالرجوع لنا.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleApprove(reel)}>
                        نعم، انشر
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-red-600 hover:text-red-600 dark:text-red-400"
                  disabled={busy}
                  onClick={() => {
                    setRejectTarget(reel);
                    setReason("");
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  رفض
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Reject dialog — the reason is mandatory because it lands on the client's card */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent dir="rtl">
          <DialogHeader className="text-start">
            <DialogTitle>رفض «{rejectTarget?.title || rejectTarget?.clientName}»</DialogTitle>
            <DialogDescription>
              السبب يظهر للعميل على بطاقة الريل — اكتبه بحيث يعرف بالضبط إيش يعدّل. بعد ما
              يعدّل، الريل يرجع لهذي القائمة تلقائياً.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: الوصف عام جداً — اذكر إيش اللي بيشوفه العميل في المقطع"
            rows={3}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || isPending}
              onClick={handleReject}
            >
              رفض الريل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-[70px] shrink-0 text-xs leading-6 text-muted-foreground">{label}</span>
      {value?.trim() ? (
        <span className={highlight ? "font-medium text-red-600 dark:text-red-400" : ""}>{value}</span>
      ) : (
        <span className="text-xs italic leading-6 text-muted-foreground/60">— فاضي</span>
      )}
    </div>
  );
}
