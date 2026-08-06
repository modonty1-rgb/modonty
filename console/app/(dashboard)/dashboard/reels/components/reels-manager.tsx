"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Film, ImageIcon, Eye, Heart, MessageCircle, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { compressToWebP } from "@/lib/compress-image";
import { cn } from "@/lib/utils";
import { mediaSrc } from "@modonty/database/lib/media-src";
import { MediaUploadZone } from "@modonty/database/components/media-upload-zone";
import { ConfirmDeleteButton } from "@modonty/database/components/confirm-delete-button";
import { setImageInReels } from "../../gallery/actions/gallery-actions";
import { removeVideoReel, setVideoCover } from "../../videos/actions/video-actions";
import {
  createImageReel,
  updateReelDetails,
  removeReel,
  type ClientReel,
} from "../actions/reels-actions";

/**
 * Upload + manage the client's IMAGE reels.
 *
 * Video reels are a route of their own (ق8) with their own uploader: a 90-second clip is
 * 10–50MB, past both Vercel's request-body limit and the 60s function ceiling, so it goes
 * browser→Bunny directly over tus. Nothing about that fits in the same box as picking a
 * picture, which is why the two screens are separate.
 *
 * `ReelCard` is shared with the videos screen — the management half is identical.
 */

const MAX_BYTES = 20 * 1024 * 1024;

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING_APPROVAL: { label: "بانتظار موافقة مُدَوَّنَتِي", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  DRAFT: { label: "بانتظار موافقة مُدَوَّنَتِي", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  APPROVED: { label: "معتمد", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  PUBLISHED: { label: "ظاهر للزوّار", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  REJECTED: { label: "مرفوض", cls: "bg-red-50 text-red-700 ring-red-200" },
};

export function ReelsManager({ initial }: { initial: ClientReel[] }) {
  const [reels, setReels] = useState<ClientReel[]>(initial);

  return (
    <div className="space-y-5">
      <MediaUploadZone
        endpoint="/api/upload-bunny"
        fields={{ folder: "reels" }}
        maxBytes={MAX_BYTES}
        transform={compressToWebP}
        labels={{
          idle: "ارفع صورة للريلز",
          hint: "أفضل مقاس 1080 × 1920 (طولية) · حتى 20 ميجا",
        }}
        onUploaded={async ({ response, original }) => {
          const url = (response as { url?: string } | null)?.url;
          if (!url) return { ok: false, error: "ما وصلنا رابط الصورة" };
          const created = await createImageReel({ url, filename: original.name });
          if (!created.success) return { ok: false, error: created.error };
          return { ok: true };
        }}
        onSettled={(ok) => {
          if (ok > 0) {
            toast.success(`رفعنا ${ok} — اكتب العنوان والوصف عشان نعتمدها`);
            window.location.reload();
          }
        }}
      />

      {reels.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Film className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              ما فيه ريلز بعد — ارفع صورة، أو أشّر على صورة من معرض الصور.
            </p>
          </CardContent>
        </Card>
      ) : (
        // Masonry, same as the gallery: the frame is 9:16 for everyone, but the card
        // below it isn't — a rejection reason or the gallery tick makes it taller, and a
        // fixed grid would pad every neighbour to match.
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {reels.map((r) => (
            <ReelCard
              key={r.id}
              reel={r}
              onRemoved={() => setReels((prev) => prev.filter((x) => x.id !== r.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Upload a still to use as the video's cover. Deliberately a plain file input rather than
 * the full upload zone: it is one small image inside an already-dense card, and the drag
 * area, queue and retry list of the big component would dwarf the card it sits in.
 */
function VideoCoverPicker({ mediaId }: { mediaId: string }) {
  const [busy, setBusy] = useState(false);

  async function pick(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", await compressToWebP(file));
      body.append("folder", "reels");
      const res = await fetch("/api/upload-bunny", { method: "POST", body });
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) throw new Error();

      const saved = await setVideoCover(mediaId, data.url);
      if (!saved.success) {
        toast.error(saved.error);
        return;
      }
      toast.success("غيّرنا الغلاف");
      window.location.reload();
    } catch {
      toast.error("ما قدرنا نغيّر الغلاف");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void pick(file);
        }}
      />
      <ImageIcon className="h-3 w-3" />
      {busy ? "نرفع الغلاف…" : "غيّر الغلاف"}
    </label>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span className="flex items-center gap-0.5" title={label}>
      {icon}
      {value.toLocaleString("ar-SA")}
    </span>
  );
}

export function ReelCard({ reel, onRemoved }: { reel: ClientReel; onRemoved: () => void }) {
  const [details, setDetails] = useState({
    title: reel.title ?? "",
    description: reel.description ?? "",
    altText: reel.altText ?? "",
  });
  const [saved, setSaved] = useState(details);
  const [pending, startTransition] = useTransition();
  const src = mediaSrc({ url: reel.thumbnailUrl ?? reel.url, bunnyUrl: reel.bunnyUrl });
  const state = STATUS[reel.status ?? ""] ?? {
    label: reel.status ?? "—",
    cls: "bg-muted text-foreground ring-border",
  };
  const locked = reel.status === "APPROVED" || reel.status === "PUBLISHED";
  // The card is shared between the two screens; only the noun changes.
  const noun = reel.isVideo ? "المقطع" : "الريل";

  // What Modonty checks before it can approve — shown here so the client fixes it now
  // instead of waiting days for a rejection that says "اكتب وصفاً".
  const missing = [
    !details.title.trim() && "العنوان",
    !details.description.trim() && "الوصف",
    !reel.isVideo && !details.altText.trim() && "الوصف البديل",
  ].filter(Boolean) as string[];

  const dirty =
    details.title !== saved.title ||
    details.description !== saved.description ||
    details.altText !== saved.altText;

  function save() {
    startTransition(async () => {
      const res = await updateReelDetails(reel.id, details);
      if (res.success) {
        setSaved(details);
        toast.success("تم الحفظ");
      } else {
        toast.error(res.error);
      }
    });
  }

  // Awaited so the confirm card holds its spinner until the server actually answers.
  // A video routes elsewhere: deleting its row must also drop the file from the Bunny
  // library, or we keep paying to store something nothing can reach.
  async function remove() {
    const res = reel.isVideo ? await removeVideoReel(reel.id) : await removeReel(reel.id);
    if (res.success) {
      onRemoved();
      toast.success("تم الحذف");
    } else {
      toast.error(res.error);
    }
  }

  function unpinFromGallery() {
    startTransition(async () => {
      const res = await setImageInReels(reel.id, false);
      if (res.success) {
        onRemoved();
        toast.success("شِلناها من الريلز — باقية في معرض الصور");
      } else {
        toast.error(res.error || "ما قدرنا نغيّرها");
      }
    });
  }

  return (
    <div
      className={cn(
        // break-inside-avoid keeps a card from splitting across two masonry columns.
        "mb-4 flex break-inside-avoid flex-col gap-2 rounded-lg border bg-card p-2 transition-colors",
        // Same green as the gallery tick — the client sees one visual language for
        // "this image is in the reels" wherever the image shows up.
        reel.inGallery ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-border"
      )}
    >
      {/* 9:16 — the frame the reel actually plays in, so the client sees the real crop. */}
      <div className="relative w-full overflow-hidden rounded-md bg-muted" style={{ aspectRatio: "9/16" }}>
        {reel.isVideo && reel.mp4Url ? (
          // Plays right here rather than behind a modal: the client's whole question is
          // "did the right clip go up", and a click-to-open dialog puts a door in front of
          // the answer. `preload="metadata"` means the poster shows without pulling the
          // file — a page of ten reels downloads ten headers, not ten videos.
          <video
            src={reel.mp4Url}
            poster={reel.thumbnailUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : src ? (
          <Image src={src} alt={reel.title ?? ""} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <span className={`absolute start-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${state.cls}`}>
          {state.label}
        </span>
        {/* A reel that also lives in the gallery is managed from the gallery tick — the
            row is the same file, so deleting it here would delete the page image too. */}
        {!reel.inGallery && (
          <ConfirmDeleteButton
            onConfirm={remove}
            disabled={pending}
            previewUrl={src}
            className="absolute end-1.5 top-1.5"
            labels={{
              trigger: reel.isVideo ? "احذف المقطع" : "احذف الريل",
              title: reel.isVideo ? "متأكد من حذف المقطع؟" : "متأكد من حذف الريل؟",
              description:
                reel.status === "APPROVED" || reel.status === "PUBLISHED"
                  ? `${noun} يطلع من الفيد، وتعليقات الزوّار وإعجاباتهم تبقى محفوظة.`
                  : `${noun} يروح نهائياً وما تقدر ترجّعه.`,
            }}
          />
        )}
      </div>

      <Input
        value={details.title}
        onChange={(e) => setDetails({ ...details, title: e.target.value })}
        disabled={locked}
        placeholder={reel.isVideo ? "عنوان المقطع" : "عنوان الريل"}
        className="h-8 text-xs"
        maxLength={100}
      />

      <Textarea
        value={details.description}
        onChange={(e) => setDetails({ ...details, description: e.target.value })}
        disabled={locked}
        placeholder="وصف قصير — إيش يشوف الزائر في المقطع؟"
        className="min-h-[54px] resize-none text-xs"
        maxLength={500}
      />

      {/* The video's third client-owned field (ق9): Bunny's auto-frame is sometimes a
          blink, and this is both the first thing a visitor sees and the thumbnail Google
          asks for. Images need none of it — the picture IS the cover. */}
      {reel.isVideo && !locked && <VideoCoverPicker mediaId={reel.id} />}

      {/* Images only: this is the single strongest signal Google has about a still
          picture, and a reel uploaded straight here had no field for it at all. */}
      {!reel.isVideo && (
        <Input
          value={details.altText}
          onChange={(e) => setDetails({ ...details, altText: e.target.value })}
          disabled={locked}
          placeholder="وصف بديل — اوصف الصورة لمن ما يشوفها"
          className="h-8 text-xs"
          maxLength={200}
        />
      )}

      {!locked && missing.length > 0 && (
        <p className="rounded bg-amber-50 px-2 py-1 text-[11px] leading-tight text-amber-800">
          ناقص: {missing.join(" · ")} — مُدَوَّنَتِي ما تقدر تعتمده قبل ما تكمله.
        </p>
      )}

      {dirty && !locked && (
        <Button size="sm" onClick={save} disabled={pending} className="h-8 w-full text-xs">
          {pending ? "نحفظ…" : "احفظ البيانات"}
        </Button>
      )}

      {/* Only once it is out there. Before that the four zeros say nothing except
          "nobody saw it", which the status badge already said better. */}
      {(reel.status === "APPROVED" || reel.status === "PUBLISHED") && (
        <div className="flex items-center justify-between gap-1 border-t border-border pt-1.5 text-[11px] text-muted-foreground">
          <Metric icon={<Eye className="h-3 w-3" />} value={reel.views} label="مشاهدة" />
          <Metric icon={<Heart className="h-3 w-3" />} value={reel.likes} label="إعجاب" />
          <Metric icon={<MessageCircle className="h-3 w-3" />} value={reel.comments} label="تعليق" />
          <Metric icon={<Star className="h-3 w-3" />} value={reel.favorites} label="مفضّلة" />
        </div>
      )}

      {reel.status === "REJECTED" && reel.rejectionReason && (
        <p className="rounded bg-red-50 px-2 py-1 text-[11px] leading-tight text-red-700">
          سبب الرفض: {reel.rejectionReason}
        </p>
      )}
      {/* From the gallery: no delete — the row IS the page image. Unticking here only
          takes it out of the reels; the image stays in the gallery untouched. */}
      {reel.inGallery && (
        <label className="flex cursor-pointer items-start gap-2 rounded-md bg-emerald-500/10 px-2 py-1.5">
          <input
            type="checkbox"
            checked
            disabled={pending}
            onChange={unpinFromGallery}
            className="mt-0.5 size-4 shrink-0 accent-emerald-600"
          />
          <span className="min-w-0 text-[11px] leading-tight">
            <span className="font-medium">تظهر في الريلز</span>
            <span className="block text-muted-foreground">
              {pending ? "لحظة…" : "من معرض الصور — شيل العلامة وتبقى في المعرض"}
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
