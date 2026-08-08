"use client";

import { useState, useTransition } from "react";
import { OptimizedImage } from "@modonty/database/components/optimized-image";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { compressToWebP } from "@/lib/compress-image";
import { cn } from "@/lib/utils";
import { mediaSrc } from "@modonty/database/lib/media-src";
import { MediaUploadZone } from "@modonty/database/components/media-upload-zone";
import { ConfirmDeleteButton } from "@modonty/database/components/confirm-delete-button";
import {
  addGalleryImage,
  updateGalleryImageAlt,
  deleteGalleryImage,
  setImageInReels,
  type GalleryImage,
} from "../actions/gallery-actions";

/** Gallery row plus the state of its reel, if the client chose to have one. */
type GalleryItem = GalleryImage & { inReels: boolean; reelStatus: string | null };

interface Props {
  initial: GalleryItem[];
}

/**
 * Reels play full-screen and vertical, so 9:16 is what fills the frame without cropping.
 *
 * Worth stating plainly: Google imposes NO aspect ratio here. Its only thumbnail rules are
 * "Minimum 60x30 pixels, larger preferred", reachable by Googlebot, and served from a
 * stable URL (Search Central · video thumbnail guidelines, checked 2026-08-04). The 9:16
 * target is OUR screen's requirement, not an external standard — and the tooltip says so
 * rather than dressing a product choice up as a rule.
 */
const REELS_RATIO = 9 / 16;
const REELS_IDEAL = "1080 × 1920";

/** How this exact image will behave in the reels frame — read from its stored size. */
function reelFit(width: number | null, height: number | null): string {
  if (!width || !height) return `الأفضل مقاس طولي ${REELS_IDEAL} — ما نعرف مقاس صورتك.`;
  const ratio = width / height;
  const pretty = `${width}×${height}`;
  if (Math.abs(ratio - REELS_RATIO) < 0.06) {
    return `مقاس صورتك ${pretty} — طولية ومناسبة تماماً للريلز ✅`;
  }
  // Square first: 1254×1254 is neither landscape nor portrait, and calling it "portrait"
  // (the first version did) is a plain lie to a client reading his own image.
  if (Math.abs(ratio - 1) < 0.03) {
    return `مقاس صورتك ${pretty} — مربّعة، وراح ينقص كثير من فوق وتحت. الأفضل طولية ${REELS_IDEAL}.`;
  }
  if (ratio > 1) {
    return `مقاس صورتك ${pretty} — عرضية، وراح تنقص أطرافها في الريلز. الأفضل طولية ${REELS_IDEAL}.`;
  }
  if (ratio > REELS_RATIO) {
    return `مقاس صورتك ${pretty} — طولية بس مو بما يكفي، راح ينقص شوي من فوق وتحت. الأفضل ${REELS_IDEAL}.`;
  }
  return `مقاس صورتك ${pretty} — أطول من إطار الريلز، راح ينقص من الجانبين. الأفضل ${REELS_IDEAL}.`;
}

/** What the client sees under the tick — his words, not our workflow names. */
const REEL_STATE_LABEL: Record<string, string> = {
  PENDING_APPROVAL: "بانتظار موافقة مُدَوَّنَتِي",
  APPROVED: "معتمدة",
  PUBLISHED: "ظاهرة في الريلز",
  REJECTED: "مرفوضة",
  DRAFT: "بانتظار موافقة مُدَوَّنَتِي",
};

const MAX_BYTES = 20 * 1024 * 1024;

export function GalleryManager({ initial }: Props) {
  const [images, setImages] = useState<GalleryItem[]>(initial);
  // The upload-time toggle is gone (Khalid 2026-08-04). Reels are now chosen per image,
  // after upload, from the tick on each card — so nothing becomes a reel by accident.
  const publishAsReel = false;

  /** Read back the compressed file's real pixel size — the reels tooltip needs it. */
  async function readSize(file: File): Promise<{ width: number | null; height: number | null }> {
    try {
      const bitmap = await createImageBitmap(file);
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return size;
    } catch {
      return { width: null, height: null };
    }
  }

  return (
    <div className="space-y-5">
      {/* Upload zone — shared component: real byte-level progress per file + retry. */}
      <MediaUploadZone
        endpoint="/api/upload-bunny"
        maxBytes={MAX_BYTES}
        transform={compressToWebP}
        labels={{
          idle: "ارفع صور المعرض",
          hint: "JPG / PNG / WebP — تُضغط تلقائياً بصيغة WebP · حتى 20 ميجا",
        }}
        onUploaded={async ({ response, file, original }) => {
          const res = response as { url?: string; blurDataURL?: string | null } | null;
          const url = res?.url;
          if (!url) return { ok: false, error: "ما وصلنا رابط الصورة" };
          const { width, height } = await readSize(file);
          const saved = await addGalleryImage({
            url,
            filename: original.name,
            mimeType: "image/webp",
            width,
            height,
            fileSize: file.size,
            // Built server-side in /api/upload-bunny from the same buffer it uploaded.
            blurDataURL: res?.blurDataURL ?? null,
            publishAsReel,
          });
          if (!saved.success) return { ok: false, error: saved.error || "فشل حفظ الصورة" };
          setImages((prev) => [saved.image, ...prev]);
          return { ok: true };
        }}
        onSettled={(ok) => {
          if (ok > 0) toast.success(ok === 1 ? "تم رفع الصورة" : `تم رفع ${ok} صور`);
        }}
      />

      {/* Grid */}
      {images.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              ما فيه صور بعد — ارفع صورك عشان تظهر في معرض صفحتك على مودونتي.
            </p>
          </CardContent>
        </Card>
      ) : (
        // Masonry: CSS multi-column, so every card keeps its own height instead of being
        // padded to the tallest in its row — the gallery holds squares, portraits and
        // landscapes side by side and a fixed grid left big gaps under the short ones.
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {images.map((img) => (
            <GalleryCard
              key={img.id}
              image={img}
              onDeleted={() => setImages((prev) => prev.filter((x) => x.id !== img.id))}
              onAltSaved={(alt) =>
                setImages((prev) => prev.map((x) => (x.id === img.id ? { ...x, altText: alt } : x)))
              }
              onReelChanged={(inReels, status) =>
                setImages((prev) =>
                  prev.map((x) => (x.id === img.id ? { ...x, inReels, reelStatus: status } : x))
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryCard({
  image,
  onDeleted,
  onAltSaved,
  onReelChanged,
}: {
  image: GalleryItem;
  onDeleted: () => void;
  onAltSaved: (alt: string | null) => void;
  onReelChanged: (inReels: boolean, status: string | null) => void;
}) {
  const [alt, setAlt] = useState(image.altText ?? "");
  const [pending, startTransition] = useTransition();
  const [reelPending, startReel] = useTransition();
  // Its own field now — the tick used to be inferred from the status, which meant an
  // ARCHIVED reel and one that never existed were indistinguishable.
  const inReels = image.inReels;

  function toggleReel(next: boolean) {
    startReel(async () => {
      const res = await setImageInReels(image.id, next);
      if (res.success) {
        // Turning it off archives a reel visitors have seen and clears the rest — the
        // server decides which; showing PENDING here would lie about an approved one.
        onReelChanged(next, next ? "PENDING_APPROVAL" : null);
        toast.success(next ? "أضفناها للريلز — بانتظار موافقة مُدَوَّنَتِي" : "شِلناها من الريلز");
      } else {
        toast.error(res.error || "ما قدرنا نغيّرها");
      }
    });
  }
  const ratio = image.width && image.height ? `${image.width}/${image.height}` : "4/3";

  function saveAlt() {
    if ((image.altText ?? "") === alt.trim()) return;
    startTransition(async () => {
      const res = await updateGalleryImageAlt(image.id, alt);
      if (res.success) {
        onAltSaved(alt.trim() || null);
        toast.success("تم حفظ الوصف");
      } else {
        toast.error(res.error || "فشل حفظ الوصف");
      }
    });
  }

  // Awaited, not wrapped in a transition: the confirm card keeps its spinner until the
  // server answers, and only then closes — a transition would return instantly and the
  // card would vanish while the delete is still in flight.
  async function remove() {
    const res = await deleteGalleryImage(image.id);
    if (res.success) {
      onDeleted();
      toast.success("تم حذف الصورة");
    } else {
      toast.error(res.error || "فشل الحذف");
    }
  }

  return (
    <div
      className={cn(
        // break-inside-avoid keeps a card from being split across two masonry columns.
        "mb-4 flex break-inside-avoid flex-col gap-2 rounded-lg border bg-card p-2 transition-colors",
        inReels ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-border"
      )}
    >
      <div className="relative w-full overflow-hidden rounded-md bg-muted" style={{ aspectRatio: ratio }}>
        <OptimizedImage
          media={image}
          alt={image.altText || "صورة المعرض"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <ConfirmDeleteButton
          onConfirm={remove}
          disabled={pending}
          previewUrl={mediaSrc(image) ?? image.url}
          className="absolute end-1.5 top-1.5"
          labels={{
            trigger: "احذف الصورة",
            description: inReels
              ? "الصورة تروح من المعرض ومن الريلز، وما تقدر ترجّعها."
              : "الصورة تروح من معرض صفحتك، وما تقدر ترجّعها.",
          }}
        />
      </div>
      <Input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={saveAlt}
        placeholder="وصف الصورة (للسيو)"
        className="h-8 text-xs"
        maxLength={200}
      />

      {/* One tick per image, off unless the client asks for it, changeable any time.
          The tooltip is CSS-only on purpose — a whole tooltip library for one hint would
          be a dependency the console does not otherwise need. */}
      <div className="group/reel relative">
        <label
          className={cn(
            "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
            inReels ? "bg-emerald-500/10" : "bg-muted/40"
          )}
        >
          <input
            type="checkbox"
            checked={inReels}
            disabled={reelPending}
            onChange={(e) => toggleReel(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-emerald-600"
          />
          <span className="min-w-0 text-[11px] leading-tight">
            <span className="font-medium">تظهر في الريلز</span>
            {reelPending ? (
              <span className="ms-1 text-muted-foreground">لحظة…</span>
            ) : (
              image.reelStatus &&
              image.reelStatus !== "ARCHIVED" && (
                <span className="block text-muted-foreground">
                  {REEL_STATE_LABEL[image.reelStatus] ?? image.reelStatus}
                </span>
              )
            )}
          </span>
        </label>

        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full z-30 mb-1.5 w-60 -translate-y-1 rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-slate-100 opacity-0 shadow-xl transition-all duration-150 group-hover/reel:translate-y-0 group-hover/reel:opacity-100 end-0"
        >
          <p className="font-semibold text-white">الريلز شاشة كاملة طولية</p>
          <p className="mt-1 text-slate-300">{reelFit(image.width, image.height)}</p>
          <p className="mt-1.5 border-t border-white/15 pt-1.5 text-slate-400">
            الصورة تظهر للزوّار بعد موافقة مُدَوَّنَتِي — تقدر تشيل العلامة أي وقت.
          </p>
        </div>
      </div>
    </div>
  );
}
