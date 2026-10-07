"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Film } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { compressToWebP } from "@/lib/compress-image";
import { MediaUploadZone } from "@modonty/shared/components/media-upload-zone";
import { ReelCard } from "@/components/shared/reel-card";
import type { ClientReel } from "@/lib/reels/client-reel";
import { createImageReel } from "../actions/reels-actions";

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

/**
 * The transformed file's real pixel size, read in the browser before it is handed over.
 *
 * Stored on the row so the reel can declare its dimensions — the feed reserves the right
 * box instead of reflowing when the picture lands, and the structured data describes the
 * file that actually exists. Returns null rather than a guess when the decode fails.
 */
async function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

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
        onUploaded={async ({ response, file, original }) => {
          const res = response as { url?: string; bytes?: number; blurDataURL?: string } | null;
          const url = res?.url;
          if (!url) return { ok: false, error: "ما وصلنا رابط الصورة" };

          // Everything the row needs, measured rather than assumed. It used to send the URL
          // and the file name alone, so every image reel landed with no dimensions, no size,
          // no blur placeholder, and `image/jpeg` hardcoded — while `compressToWebP` had just
          // turned the file into a WebP. The row was describing a file that did not exist.
          const size = await readImageSize(file);

          const created = await createImageReel({
            url,
            filename: original.name,
            mimeType: file.type || null,
            fileSize: res.bytes ?? file.size,
            width: size?.width ?? null,
            height: size?.height ?? null,
            blurDataURL: res.blurDataURL ?? null,
          });
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
