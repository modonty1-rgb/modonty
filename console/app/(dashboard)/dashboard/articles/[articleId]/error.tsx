"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ArticleStatsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Article stats error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <p className="text-base font-medium">تعذّر تحميل إحصائيات المقال</p>
      <p className="text-sm text-muted-foreground">حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.</p>
      <Button variant="outline" size="sm" onClick={reset}>
        إعادة المحاولة
      </Button>
    </div>
  );
}
