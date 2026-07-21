"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatBytes } from "@modonty/database/lib/utils";
import { compressToWebP } from "@/lib/compress-image";
import { saveOptimizedImage } from "../../actions/optimize-image";
import type { OptimizableImage } from "../helpers/optimizable";

function fmt(mime: string): string {
  const sub = (mime.split("/")[1] || "img").toLowerCase();
  if (sub === "jpeg") return "JPG";
  if (sub === "svg+xml") return "SVG";
  return sub.toUpperCase();
}

// Fetch → compress (browser Canvas) → re-upload to Cloudinary → return stored fields.
async function reencodeToWebP(image: OptimizableImage) {
  const resp = await fetch(image.url, { mode: "cors" });
  if (!resp.ok) throw new Error("تعذّر جلب الصورة من Cloudinary");
  const blob = await resp.blob();
  const source = new File([blob], image.filename || "image", { type: blob.type || image.mimeType });

  const webp = await compressToWebP(source);
  const bmp = await createImageBitmap(webp);
  const width = bmp.width;
  const height = bmp.height;
  bmp.close();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error("إعدادات Cloudinary غير مضبوطة");

  const form = new FormData();
  form.append("file", webp);
  form.append("upload_preset", uploadPreset);

  const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!up.ok) throw new Error("فشل رفع النسخة المحسّنة");
  const r = await up.json();

  return {
    url: (r.secure_url || r.url) as string,
    publicId: (r.public_id as string) ?? null,
    mimeType: "image/webp",
    fileSize: (r.bytes as number) ?? webp.size,
    width,
    height,
  };
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
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
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
