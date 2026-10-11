"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { downloadWithProgress } from "../helpers/download-with-progress";

/** زرّ «تحميل» بنسبة مئوية تملأ الزرّ (القديم `PublishForm.tsx:209-237` و`GalleryClient.tsx`). */
export function DownloadButton({ url, filename, className }: { url: string; filename: string; className?: string }) {
  const [pct, setPct] = useState<number | null>(null);

  async function run() {
    if (pct !== null) return;
    setPct(0);
    try {
      await downloadWithProgress(url, filename, setPct);
    } catch (error) {
      console.error("[social-calendar] download failed", error);
      toast({ title: "فشل التحميل", variant: "destructive" });
    } finally {
      setTimeout(() => setPct(null), 1200);
    }
  }

  return (
    <button
      type="button"
      disabled={pct !== null}
      onClick={() => void run()}
      className={cn(
        "relative flex min-w-[72px] shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed",
        className,
      )}
    >
      {pct !== null && (
        <span
          className="absolute inset-0 bg-white/20 transition-all duration-200 ease-out"
          style={{ transform: `scaleX(${pct / 100})`, transformOrigin: "right" }}
        />
      )}
      <span className="relative flex items-center gap-1">
        {pct === null ? (
          <>
            <Download className="h-3.5 w-3.5" />
            تحميل
          </>
        ) : pct === 100 ? (
          "تم"
        ) : (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            {pct}%
          </>
        )}
      </span>
    </button>
  );
}
