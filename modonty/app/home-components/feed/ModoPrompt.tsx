"use client";

import { CHARACTER_URL } from "@/lib/brand";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconArrowRight } from "@/lib/icons";


export function ModoPrompt() {
  const [draft, setDraft] = useState("");
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = draft.trim();
    router.push(question ? `/modo-chat?q=${encodeURIComponent(question)}` : "/modo-chat");
  };

  return (
    <section aria-labelledby="modo-heading" className="rounded-2xl border border-primary/10 bg-card p-3 shadow-[0_10px_30px_-22px_rgba(14,6,90,0.45)] sm:p-5">
      <div className="mb-2 flex items-center gap-2.5 sm:mb-3 sm:gap-3">
        <span className="relative flex size-10 shrink-0 overflow-hidden rounded-xl border border-primary/15 shadow-sm sm:size-12">
          <OptimizedImage media={asMedia(CHARACTER_URL)} alt="" fill className="object-cover" sizes="48px" />
        </span>
        <div>
          <h2 id="modo-heading" className="text-base font-bold text-foreground">اسأل Modo</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">اكتب احتياجك وسأرشدك للمحتوى أو الشريك المناسب.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <label className="sr-only" htmlFor="modo-question">ما الذي تبحث عنه؟</label>
        <input
          id="modo-question"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="مثال: أبغى أحجز موعد أسنان..."
          className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button type="submit" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors sm:hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <span className="hidden sm:inline">اسأل</span>
          <IconArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </section>
  );
}
