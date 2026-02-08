"use client";

import { cn } from "@/lib/utils";

export function TypingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} role="status" aria-label="جاري البحث">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}
