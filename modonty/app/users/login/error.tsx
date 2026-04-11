"use client";

import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { IconError, IconRefresh, IconHome } from "@/lib/icons";

export default function LoginError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center space-y-4">
        <IconError className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">تعذّر تحميل صفحة تسجيل الدخول</h2>
        <p className="text-muted-foreground">حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.</p>
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
    </div>
  );
}
