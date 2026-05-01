import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostCardPreviewContent } from "../components/postcard-preview-content";

export default function PostCardPreviewPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* ── ANNOTATION BANNER (page-only) ── */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500 text-white text-xs shrink-0">معاينة للمصمم</Badge>
          <div>
            <span className="text-sm font-semibold text-foreground">بطاقة المقال (PostCard) — أماكن الصور بالمقاسات الحقيقية</span>
            <span className="block text-xs text-muted-foreground">
              ارفع كل صورة <strong>مرة واحدة</strong> بأعلى جودة — النظام يعرضها بالحجم الصح تلقائياً في كل مكان
            </span>
          </div>
        </div>
        <Link href="/guidelines/media" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0 ms-4">
          <ChevronLeft className="h-3 w-3" />
          رجوع
        </Link>
      </div>

      <PostCardPreviewContent />
    </div>
  );
}
