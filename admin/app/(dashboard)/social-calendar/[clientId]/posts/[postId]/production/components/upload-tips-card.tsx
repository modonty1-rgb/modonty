import { ImageIcon, Info, Lightbulb, Video } from "lucide-react";

/**
 * حدود رفع الإبداع (القديم `UploadTipsCard.tsx`) بالأرقام الفعلية للمسار الجديد:
 * الصور ٤MB (سقف Vercel لجسم الطلب — القديم كان يكتب ١٠MB ولا يصلها على Vercel)،
 * والفيديو ٥٠٠MB يُرفع مباشرة إلى Bunny Stream فلا يمرّ بسيرفرنا.
 */
export function UploadTipsCard() {
  return (
    <aside className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-20">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Info className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">حدود رفع الإبداع</h3>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
          <ImageIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-foreground">الصور</p>
          <p className="text-[10px] text-muted-foreground">JPG · PNG · WebP · GIF · AVIF</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">4MB</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40">
          <Video className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-foreground">الفيديو</p>
          <p className="text-[10px] text-muted-foreground">MP4 · MOV · WebM</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-purple-600 dark:text-purple-400">500MB</span>
      </div>

      <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">نصائح لتجاوز الحد</p>
        </div>
        <ul className="space-y-1 text-[10px] leading-relaxed text-amber-900 dark:text-amber-200">
          <li>
            <span className="font-semibold">صور &gt; 4MB:</span> صدّر JPG بجودة 85% — يقل الحجم 60% بدون فرق مرئي
          </li>
          <li>
            <span className="font-semibold">فيديو &gt; 500MB:</span> اضغط بـ HandBrake (H.264, 4-6 Mbps) → ينزل لـ 30-50MB
          </li>
          <li>
            <span className="font-semibold">المحتوى الأمثل للسوشيال:</span> 60-90 ثانية فيديو، صورة 1080×1920
          </li>
          <li>
            <span className="font-semibold">الفيديو بعد الرفع:</span> Bunny يجهّزه للعرض خلال دقائق — المعاينة قد تتأخر قليلاً
          </li>
        </ul>
      </div>
    </aside>
  );
}
