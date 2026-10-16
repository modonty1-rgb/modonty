"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, Loader2, RotateCcw, Send, SkipForward, X } from "lucide-react";
import type { VideoItemStatus, VideoPlatform } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ITEM_STATUS_BADGE, ITEM_STATUS_LABEL, MANUAL_PLATFORMS, PLATFORM_LABEL } from "../../helpers/video-labels";
import { decideVideoItem } from "../actions/decide-video-item";

export type ItemView = {
  platform: VideoPlatform;
  status: VideoItemStatus;
  approvedByName: string | null;
  note: string | null;
  url: string | null;
  error: string | null;
};

/**
 * سطر منصة واحدة لملف واحد — الحالة والقرار. يوتيوب: اعتماد (السيرفر ينشر) · الريلز: اعتماد (الأدمن ينشر —
 * الخطوة ٥) · تيك توك وإنستغرام: تنزيل + نسخ + «تم النشر يدويًا». ولكل منصة: رفض بملاحظة أو «ما ننشره هنا».
 */
export function PlatformRow({ jobId, asset, item, file, caption }: { jobId: string; asset: string; item: ItemView; file: string | null; caption: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const manual = MANUAL_PLATFORMS.includes(item.platform);
  const done = item.status === "PUBLISHED";

  const act = (op: "approve" | "reject" | "skip" | "posted" | "reset", withNote?: string) =>
    start(async () => {
      const r = await decideVideoItem({ jobId, asset: asset as "long", platform: item.platform, op, note: withNote });
      if (!r.success) {
        toast({ title: r.error, variant: "destructive" });
        return;
      }
      setRejecting(false);
      setNote("");
      router.refresh();
    });

  return (
    <li className="space-y-1.5 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-24 shrink-0 text-sm font-medium">{PLATFORM_LABEL[item.platform]}</span>
        <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", ITEM_STATUS_BADGE[item.status])}>
          {ITEM_STATUS_LABEL[item.status]}
        </span>
        {item.approvedByName && (item.status === "APPROVED" || done) ? <span className="text-[11px] text-muted-foreground">— {item.approvedByName}</span> : null}
        {done && item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">افتحه ↗</a>
        ) : null}

        {!done ? (
          <span className="ms-auto flex flex-wrap items-center gap-1">
            {pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
            {/* Manual tools only while the item still waits — not on a rejected or «ما ننشره هنا» one. */}
            {manual && item.status !== "PENDING" ? null : manual ? (
              <>
                {file ? (
                  <Button asChild variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                    <a href={file} target="_blank" rel="noopener noreferrer" download>
                      <Download className="size-3" aria-hidden /> نزّل الملف
                    </a>
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  disabled={!caption}
                  onClick={() => {
                    navigator.clipboard.writeText(caption);
                    toast({ title: `اتنسخ نص ${PLATFORM_LABEL[item.platform]}`, variant: "success" });
                  }}
                >
                  <Copy className="size-3" aria-hidden /> انسخ النص
                </Button>
                <Button size="sm" className="h-7 gap-1 px-2 text-xs" disabled={pending} onClick={() => act("posted")}>
                  <Send className="size-3" aria-hidden /> تم النشر يدويًا
                </Button>
              </>
            ) : item.status === "APPROVED" ? null : (
              <Button size="sm" className="h-7 gap-1 px-2 text-xs" disabled={pending} onClick={() => act("approve")}>
                <Check className="size-3" aria-hidden /> اعتمد
              </Button>
            )}
            {item.status === "PENDING" || item.status === "FAILED" ? (
              <>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" disabled={pending} onClick={() => setRejecting((v) => !v)}>
                  <X className="size-3" aria-hidden /> ارفض
                </Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground" disabled={pending} onClick={() => act("skip")}>
                  <SkipForward className="size-3" aria-hidden /> ما ننشره هنا
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground" disabled={pending} onClick={() => act("reset")}>
                <RotateCcw className="size-3" aria-hidden /> تراجع
              </Button>
            )}
          </span>
        ) : null}
      </div>

      {item.status === "REJECTED" && item.note ? <p className="ps-24 text-xs text-rose-700 dark:text-rose-300">السبب: {item.note}</p> : null}
      {item.status === "FAILED" && item.error ? <p className="ps-24 text-xs text-red-700 dark:text-red-300">الخطأ: {item.error}</p> : null}
      {item.platform === "MODONTY_REELS" && item.status === "APPROVED" ? (
        <p className="ps-24 text-[11px] text-muted-foreground">
          انضاف لطابور الريلز — انشره من{" "}
          <a href="/reels/pending" className="text-primary hover:underline">Reels › Pending</a> بعد ما يخلص ترميز Bunny، وهنا يصير «منشور» لحاله.
        </p>
      ) : null}

      {rejecting ? (
        <div className="space-y-1.5 ps-24">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="وش اللي لازم يتغيّر؟ السكربت ينكتب من جديد على أساسه." className="min-h-16 text-sm" />
          <div className="flex gap-1.5">
            <Button size="sm" variant="destructive" className="h-7 px-3 text-xs" disabled={pending || !note.trim()} onClick={() => act("reject", note.trim())}>
              أرسل الرفض
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-3 text-xs" onClick={() => setRejecting(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
