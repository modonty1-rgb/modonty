"use client";

import { useRef, useState } from "react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { compressToWebP } from "@/lib/compress-image";

/**
 * حقلُ صورةٍ يرفع من الجهاز — لا يطلب رابطاً.
 *
 * خالد ١٦ سبتمبر ٢٠٢٦ على قسم الفريق: «الصورة ما أبغاها تكون رابط، أبغاه يعمل أبلود».
 * والسبب أعمق من الراحة: صاحبُ العيادة يملك صورة موظّفه على جوّاله، ولا يملك رابطاً
 * لها على الإنترنت. فطلبُ الرابط يعني عمليّاً أن الحقل يبقى فارغاً.
 *
 * المكوّن كان يسكن داخل `achievements-editor.tsx` ويخدمه وحده، فأُخرج إلى هنا حين
 * صار له مستهلكان في نفس المسار — الإنجازات والفريق.
 *
 * والضغط قبل الرفع مقصود: `compressToWebP` يُنزل الصورة إلى ٢٠٠٠ بكسل وWebP، فلا
 * يصل بني إلا الحجم الذي يُعرض فعلاً، وتبقى تحت حدّ الأربعة ميجا في نقطة الرفع.
 */

/** حدُّ ما يُقبل من الجهاز قبل الضغط — بعده يخرج الضغط نفسه عن جدواه. */
const IMG_MAX_BYTES = 10 * 1024 * 1024;

export type ImageFieldShape = "wide" | "round";

export function ImageField({
  image,
  onChange,
  label,
  folder,
  shape = "wide",
  hint,
}: {
  image: string;
  onChange: (url: string) => void;
  label: string;
  /** المجلّد على بني — لا بدّ أن يكون ضمن القائمة البيضاء في `/api/upload-bunny`. */
  folder: "achievements" | "team" | "gallery" | "licenses" | "reels";
  shape?: ImageFieldShape;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const round = shape === "round";
  /** الدائريّ صورةُ وجه، والعريض صورةُ مشهد — فلكلٍّ إطاره. */
  const box = round ? "h-20 w-20 rounded-full" : "w-40 rounded-md";
  const boxStyle = round ? undefined : { aspectRatio: "16/10" as const };

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("الملف مش صورة");
      return;
    }
    if (file.size > IMG_MAX_BYTES) {
      toast.error("حجم الصورة كبير — الحد 10 ميجا");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressToWebP(file);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("folder", folder);
      const res = await fetch("/api/upload-bunny", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) {
        toast.error(json?.error || "فشل رفع الصورة");
        return;
      }
      onChange(json.url);
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          /** تصفيرُ القيمة كي يُقبل اختيار **نفس** الملفّ مرّةً ثانية بعد حذفه. */
          e.target.value = "";
        }}
      />

      {image ? (
        <div className="flex items-center gap-2">
          <div className={`relative shrink-0 overflow-hidden border bg-muted ${box}`} style={boxStyle}>
            <OptimizedImage media={asMedia(image)} alt="" fill className="object-cover" sizes={round ? "80px" : "160px"} />
            {round ? null : (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="absolute inset-x-1 bottom-1 h-6 bg-background/90 px-2 text-[11px] backdrop-blur"
              >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : "استبدال"}
              </Button>
            )}
            {round ? null : (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => onChange("")}
                aria-label="حذف الصورة"
                className="absolute end-1 top-1 h-6 w-6 bg-background/90 text-[hsl(var(--destructive-ink))] backdrop-blur hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* الدائريّ صغير، فأزراره تخرج بجانبه — زرٌّ فوق صورة ٨٠ بكسل يغطّي الوجه. */}
          {round ? (
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="h-8 gap-1.5 text-xs"
              >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                استبدال
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange("")}
                className="h-8 text-xs text-[hsl(var(--destructive-ink))] hover:bg-destructive/10"
              >
                حذف الصورة
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={boxStyle}
          className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 disabled:opacity-50 ${box}`}
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <ImagePlus className="h-5 w-5" />}
          {/* الدائرة ٨٠ بكسل لا تتّسع لجملة — النصّ يخرج عنها فيُقصّ. */}
          <span className={`text-[11px] font-medium ${round ? "sr-only" : ""}`}>
            {uploading ? "جاري الرفع..." : "أضف صورة"}
          </span>
        </button>
      )}

      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
