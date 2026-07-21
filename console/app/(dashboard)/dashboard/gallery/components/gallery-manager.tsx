"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, ImagePlus, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressToWebP } from "@/lib/compress-image";
import {
  addGalleryImage,
  updateGalleryImageAlt,
  deleteGalleryImage,
  type GalleryImage,
} from "../actions/gallery-actions";

interface Props {
  initial: GalleryImage[];
}

const MAX_BYTES = 20 * 1024 * 1024;

export function GalleryManager({ initial }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImage[]>(initial);
  const [uploading, setUploading] = useState(false);
  // Locked decision أ (2026-07-07): default ON — the image also becomes a pending reel.
  const [publishAsReel, setPublishAsReel] = useState(true);

  async function uploadOne(file: File): Promise<boolean> {
    if (!file.type.startsWith("image/")) {
      toast.error(`«${file.name}» مش صورة — تم تجاهلها`);
      return false;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`«${file.name}» حجمها كبير — الحد 20 ميجا`);
      return false;
    }

    let compressed: File;
    let width: number | null = null;
    let height: number | null = null;
    try {
      compressed = await compressToWebP(file);
      const bitmap = await createImageBitmap(compressed);
      width = bitmap.width;
      height = bitmap.height;
      bitmap.close();
    } catch {
      toast.error(`فشل ضغط «${file.name}»`);
      return false;
    }

    // Upload through OUR server route — the Bunny password never reaches the browser.
    const fd = new FormData();
    fd.append("file", compressed);
    const res = await fetch("/api/upload-bunny", { method: "POST", body: fd });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.url) {
      toast.error(json?.error || `فشل رفع «${file.name}»`);
      return false;
    }

    const saved = await addGalleryImage({
      url: json.url,
      filename: file.name,
      mimeType: "image/webp",
      width,
      height,
      fileSize: compressed.size,
      publishAsReel,
    });
    if (!saved.success) {
      toast.error(saved.error || "فشل حفظ الصورة");
      return false;
    }
    setImages((prev) => [saved.image, ...prev]);
    return true;
  }

  async function handleFiles(files: FileList) {
    setUploading(true);
    let ok = 0;
    // Sequential — keeps SEO regen + DB writes orderly and avoids hammering Cloudinary.
    for (const file of Array.from(files)) {
      try {
        if (await uploadOne(file)) ok++;
      } catch {
        toast.error(`خطأ في الشبكة أثناء رفع «${file.name}»`);
      }
    }
    setUploading(false);
    if (ok > 0) toast.success(ok === 1 ? "تم رفع الصورة" : `تم رفع ${ok} صور`);
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Upload zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        ) : (
          <ImagePlus className="h-7 w-7" />
        )}
        <span className="text-sm font-medium text-foreground">
          {uploading ? "جاري الرفع..." : "ارفع صور المعرض"}
        </span>
        <span className="text-[11px]">JPG / PNG / WebP — تُضغط تلقائياً بصيغة WebP · حتى 20 ميجا</span>
      </button>

      {/* Locked decision أ: default ON, client can opt out per upload batch */}
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={publishAsReel}
          onChange={(e) => setPublishAsReel(e.target.checked)}
          className="size-4 accent-primary"
        />
        <span>
          تظهر في <b>الريلز</b> كمان — بعد اعتماد مُدَوَّنَتِي
          <span className="ms-1 text-xs text-muted-foreground">(لو ما تبغى، شيل العلامة قبل الرفع)</span>
        </span>
      </label>

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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <GalleryCard
              key={img.id}
              image={img}
              onDeleted={() => setImages((prev) => prev.filter((x) => x.id !== img.id))}
              onAltSaved={(alt) =>
                setImages((prev) => prev.map((x) => (x.id === img.id ? { ...x, altText: alt } : x)))
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
}: {
  image: GalleryImage;
  onDeleted: () => void;
  onAltSaved: (alt: string | null) => void;
}) {
  const [alt, setAlt] = useState(image.altText ?? "");
  const [pending, startTransition] = useTransition();
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

  function remove() {
    startTransition(async () => {
      const res = await deleteGalleryImage(image.id);
      if (res.success) {
        onDeleted();
        toast.success("تم حذف الصورة");
      } else {
        toast.error(res.error || "فشل الحذف");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2">
      <div className="relative w-full overflow-hidden rounded-md bg-muted" style={{ aspectRatio: ratio }}>
        <Image
          src={image.url}
          alt={image.altText || "صورة المعرض"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={remove}
          disabled={pending}
          aria-label="حذف الصورة"
          className="absolute end-1.5 top-1.5 h-7 w-7 bg-background/90 text-destructive shadow-sm backdrop-blur hover:bg-destructive/10"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <Input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={saveAlt}
        placeholder="وصف الصورة (للسيو)"
        className="h-8 text-xs"
        maxLength={200}
      />
    </div>
  );
}
