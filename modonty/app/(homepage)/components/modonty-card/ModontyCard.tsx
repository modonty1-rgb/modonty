"use client";

import { useState } from "react";
import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconArticle, IconChevronLeft, IconChevronRight, IconPlay, IconVolume2 } from "@/lib/icons";

import { cn } from "@/lib/utils";
import type { FeedPost } from "@/lib/types";

interface ModontyCardProps {
  articles: FeedPost[];
  brandLogoUrl: string | null;
  className?: string;
}

export function ModontyCard({ articles, brandLogoUrl, className }: ModontyCardProps) {
  const carouselArticles = articles.filter(
    (article): article is FeedPost & { image: string } => typeof article.image === "string"
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const canRotate = carouselArticles.length > 1;

  if (carouselArticles.length === 0) return null;

  const article = carouselArticles[activeIndex] ?? carouselArticles[0];
  const previous = () => setActiveIndex((index) => (index - 1 + carouselArticles.length) % carouselArticles.length);
  const next = () => setActiveIndex((index) => (index + 1) % carouselArticles.length);

  return (
    <section
      aria-label="مدونتي"
      aria-roledescription="carousel"
      className={cn("overflow-visible rounded-2xl border border-primary/15 bg-card shadow-[0_12px_32px_-24px_rgba(14,6,90,0.55)]", className)}
    >
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <span className="relative z-10 mb-[-20px] shrink-0 translate-x-2 -translate-y-[25px] -rotate-[16deg]">
          <span aria-hidden className="absolute inset-0 translate-x-1 translate-y-1 rounded-sm bg-primary" />
          <h2 className="relative flex h-8 w-[82px] items-center justify-center rounded-sm border-2 border-white/90 bg-white px-2 shadow-[0_8px_16px_-10px_rgba(14,6,90,0.8)]">
            {brandLogoUrl ? (
              <OptimizedImage media={asMedia(brandLogoUrl, "مدونتي")} alt="مدونتي" width={70} height={20} sizes="70px" className="h-5 w-[70px] object-contain" />
            ) : (
              <span className="text-xs font-bold text-primary">مدونتي</span>
            )}
          </h2>
        </span>
        <nav aria-label="محتوى مدونتي" className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <Link href="/" aria-current="page" className="inline-flex items-center gap-1 rounded-md bg-primary/[0.08] px-2 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/[0.12]">
            <IconArticle className="h-3.5 w-3.5" aria-hidden /> مقالات
          </Link>
          <Link href="/audio" className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <IconVolume2 className="h-3.5 w-3.5" aria-hidden /> استمع
          </Link>
          <Link href="/reels" className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <IconPlay className="h-3.5 w-3.5" aria-hidden /> لقطات
          </Link>
        </nav>
      </div>
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Link href={`/articles/${encodeURIComponent(article.slug)}`} aria-label={article.title} className="absolute inset-0">
          <OptimizedImage media={asMedia(article.image, article.title)} alt="" fill className="object-cover" sizes="(min-width: 1024px) 300px, 100vw" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-4 pb-4 pt-14">
            <span className="line-clamp-2 block text-sm font-bold leading-6 text-white">{article.title}</span>
          </span>
        </Link>
        {canRotate && (
          <>
            <button type="button" onClick={previous} className="absolute end-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="المقال السابق">
              <IconChevronRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={next} className="absolute start-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="المقال التالي">
              <IconChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {canRotate && (
        <div className="px-3 py-3">
          <span className="flex w-full items-center justify-center gap-2" aria-label="اختر مقالًا">
            {carouselArticles.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActiveIndex(index)} className="group flex h-6 flex-1 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`عرض: ${item.title}`} aria-current={index === activeIndex ? "true" : undefined}>
                <span className={cn("h-2 w-full rounded-full transition-colors", index === activeIndex ? "bg-primary" : "bg-border group-hover:bg-muted-foreground")} aria-hidden />
              </button>
            ))}
          </span>
        </div>
      )}
    </section>
  );
}
