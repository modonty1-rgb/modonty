"use client";

import { useRef, useState } from "react";
import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { compressToWebP } from "@/lib/compress-image";

interface LicenseUploadProps {
  value: string;
  onChange: (url: string) => void;
}

/**
 * YMYL license/credential image upload — Bunny only.
 *
 * Goes through OUR server route (`/api/upload-bunny`, folder `licenses`) so the
 * storage password never reaches the browser and the client id comes from the
 * session, not from the form. Replaces the old unsigned direct-to-Cloudinary
 * upload (kept as a tripwire in `cloudinary-license-upload.tsx`).
 */
export function LicenseUpload({ value, onChange }: LicenseUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("الملف لازم يكون صورة");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("حجم الصورة كبير — الحد الأقصى 20 ميجا");
      return;
    }

    setUploading(true);
    let compressed: File;
    try {
      compressed = await compressToWebP(file);
    } catch {
      toast.error("فشل ضغط الصورة");
      setUploading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("folder", "licenses");

      const res = await fetch("/api/upload-bunny", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        toast.error(json.error || "فشل رفع الصورة، حاول مرة ثانية");
        return;
      }
      onChange(json.url);
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("خطأ في الشبكة أثناء الرفع");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          <div className="relative aspect-video w-full">
            <OptimizedImage
              media={asMedia(value, "صورة الترخيص")}
              alt="صورة الترخيص"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="gap-1.5"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              تغيير الصورة
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange("")}
              disabled={uploading}
              className="gap-1.5 text-destructive hover:bg-destructive/10"
            >
              <X className="h-3.5 w-3.5" />
              إزالة
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
          <span className="text-sm font-medium">{uploading ? "جاري الرفع..." : "ارفع صورة الترخيص"}</span>
          <span className="text-[11px]">JPG / PNG / WebP — تُضغط تلقائياً · حتى 20 ميجا</span>
        </button>
      )}
    </div>
  );
}
