"use client";

import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { IconError, IconRefresh, IconHome } from "@/lib/icons";

export default function TrendingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-16 text-center">
      <IconError className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">تعذّر تحميل المقالات الرائجة</h2>
      <p className="text-muted-foreground mb-6">حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={reset} className="gap-2">
          <IconRefresh className="h-4 w-4" />
          إعادة المحاولة
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/"><IconHome className="h-4 w-4" />الرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
