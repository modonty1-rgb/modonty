"use client";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatBytes } from "@modonty/shared/lib/utils";
import { compressToWebP } from "@/lib/compress-image";
import { saveOptimizedImage } from "../../actions/optimize-image";
import { uploadImageToBunny } from "../../actions/upload-image-to-bunny";
import type { OptimizableImage } from "../helpers/optimizable";

function fmt(mime: string): string {
  const sub = (mime.split("/")[1] || "img").toLowerCase();
  if (sub === "jpeg") return "JPG";
  if (sub === "svg+xml") return "SVG";
  return sub.toUpperCase();
}

// Bunny-primary (2026-07-29): fetch → compress (browser Canvas) → upload the optimized
// WebP to Bunny (same type/client folder as the original) → return stored fields.
async function reencodeToWebP(image: OptimizableImage) {
  const resp = await fetch(image.url, { mode: "cors" });
  if (!resp.ok) throw new Error("تعذّر جلب الصورة الأصلية");
  const blob = await resp.blob();
  const source = new File([blob], image.filename || "image", { type: blob.type || image.mimeType });

  const webp = await compressToWebP(source);
  const bmp = await createImageBitmap(webp);
  const width = bmp.width;
  const height = bmp.height;
  bmp.close();

  const webpName = (image.filename || "image").replace(/\.[^.]+$/, "") + ".webp";
  const formData = new FormData();
  formData.append("file", new File([webp], webpName, { type: "image/webp" }));
  formData.append("filename", webpName);
  if (image.type) formData.append("type", image.type);
  formData.append("scope", image.scope || "GENERAL");
  if (image.clientId) formData.append("clientId", image.clientId);

  const up = await uploadImageToBunny(formData);
  if (!up.success || !up.url) throw new Error(up.error || "فشل رفع النسخة المحسّنة إلى Bunny");

  return {
    url: up.url,
    publicId: null as string | null,
    mimeType: "image/webp",
    fileSize: webp.size,
    width,
    height,
    // The file changed, so the old placeholder now describes an image that no longer exists.
    // The uploader already built a fresh one from the re-encoded buffer — carry it through.
    blurDataURL: up.blurDataURL ?? null,
  };
}

/**
 * ⛔ RETIRED (2026-07-29, tripwire rule) — the old re-upload-to-Cloudinary step, kept as
 * text only. Never call: throws so a hidden Cloudinary path can't fail silently.
 */
export async function reencodeToCloudinaryRETIRED(): Promise<never> {
  throw new Error("RETIRED: Cloudinary re-upload is disabled — the optimizer now uploads to Bunny.");
  /* Original implementation (text, for reference):
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const form = new FormData();
  form.append("file", webp);
  form.append("upload_preset", uploadPreset);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  const r = await up.json();
  return { url: r.secure_url || r.url, publicId: r.public_id ?? null, ... };
  */
}

export function OptimizeImagesSection({ images }: { images: OptimizableImage[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  async function handleOptimize(image: OptimizableImage) {
    setBusyId(image.id);
    try {
      const optimized = await reencodeToWebP(image);
      const res = await saveOptimizedImage(image.id, optimized);
      if (!res.success) throw new Error(res.error);
      const saved = optimized.fileSize;
      const before = image.fileSize ?? 0;
      const cut = before > 0 && saved < before ? ` — ${Math.round((1 - saved / before) * 100)}%` : "";
      toast({ title: `تم التحسين — ${formatBytes(saved)}${cut}`, variant: "success" });
      setDoneIds((prev) => new Set(prev).add(image.id));
      router.refresh();
    } catch (e) {
      toast({
        title: "فشل التحسين",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/5 px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-400">
        ✓ كل الصور مُحسّنة — WebP وضمن الحد.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <ul className="divide-y divide-border">
        {images.map((img) => {
          const done = doneIds.has(img.id);
          const busy = busyId === img.id;
          return (
            <li key={img.id} className="flex items-center gap-3 px-4 py-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                <OptimizedImage fill media={asMedia(img.url, "")} alt="" sizes="96px" className="h-full w-full object-cover" loading="lazy" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={img.filename}>
                  {img.filename}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-bold uppercase">{fmt(img.mimeType)}</span>
                  <span className="font-semibold">{formatBytes(img.fileSize)}</span>
                  <span>· {img.type ?? "—"}</span>
                  {img.clientName && <span>· {img.clientName}</span>}
                  {img.reasons.map((r) => (
                    <span key={r} className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-500">
                      {r}
                    </span>
                  ))}
                </p>
              </div>

              {done ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  تم
                </span>
              ) : (
                <Button size="sm" className="h-8 shrink-0 gap-1.5" disabled={busy} onClick={() => handleOptimize(img)}>
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                  {busy ? "جارٍ…" : "حوّل لـ WebP"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
