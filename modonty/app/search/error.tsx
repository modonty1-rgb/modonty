"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto max-w-[1128px] px-4 py-16 flex-1" dir="rtl">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">حدث خطأ أثناء البحث</h2>
        <p className="text-muted-foreground max-w-md">
          جرّب مرة أخرى أو امسح البحث والبحث من جديد.
        </p>
        <Button onClick={reset} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    </main>
  );
}
