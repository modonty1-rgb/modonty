"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ClientsError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-[1200px] mx-auto py-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive/50" />
        <h2 className="text-xl font-semibold">حدث خطأ غير متوقع</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          لم نتمكن من تحميل البيانات. يرجى المحاولة مرة أخرى.
        </p>
        <Button onClick={reset}>إعادة المحاولة</Button>
      </div>
    </div>
  );
}
