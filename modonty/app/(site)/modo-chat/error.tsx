"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Without this file a render error fell through to the site-wide boundary, which replaces the
 * whole page — so a single broken message destroyed the conversation and dropped the visitor
 * somewhere generic. Here the failure stays inside the chat route and offers a way back in.
 */
export default function ModoChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[modo-chat] render error", error);
  }, [error]);

  return (
    <div dir="rtl" className="flex h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-lg font-bold text-foreground">صار خلل في مودو</h2>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        ما قدرنا نعرض المحادثة. جرّب مرة ثانية — وإذا تكرّر، ابدأ محادثة جديدة.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>جرّب مرة ثانية</Button>
        <Button variant="outline" asChild>
          <Link href="/modo-chat">محادثة جديدة</Link>
        </Button>
      </div>
    </div>
  );
}
