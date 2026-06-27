"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { compressToWebP } from "@/lib/compress-image";

interface CloudinaryLicenseUploadProps {
  value: string;
  onChange: (url: string) => void;
}

/**
 * Direct unsigned Cloudinary upload for the YMYL license/credential image.
 * Mirrors the admin upload pattern (POST to api.cloudinary.com with upload_preset);
 * the console previously only had a URL paste field. Returns the secure_url.
 */
export function CloudinaryLicenseUpload({ value, onChange }: CloudinaryLicenseUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      toast.error("إعدادات الرفع غير مكتملة على الخادم");
      return;
    }
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
      fd.append("upload_preset", uploadPreset);
      fd.append("asset_folder", "ymyl-licenses");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        toast.error("فشل رفع الصورة، حاول مرة ثانية");
        return;
      }
      const json = await res.json();
      const url: string | undefined = json.secure_url || json.url;
      if (url) {
        onChange(url);
        toast.success("تم رفع الصورة");
      } else {
        toast.error("فشل رفع الصورة");
      }
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
            <Image
              src={value}
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
