"use client";

import { useState } from "react";
import NextImage from "next/image";

interface Props {
  siteName: string;
  siteUrl: string;
  title: string;
  description: string;
  imageUrl?: string;
  logoUrl?: string;
}

const tabCls = (active: boolean) =>
  active
    ? "rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground"
    : "rounded-md px-3 py-1 font-medium text-muted-foreground hover:bg-muted";

// Live SERP + social-card preview of the homepage SEO fields — updates as the admin types.
export function SeoPreview({ siteName, siteUrl, title, description, imageUrl, logoUrl }: Props) {
  const [mode, setMode] = useState<"google" | "social">("google");
  const [errLogo, setErrLogo] = useState<string | null>(null);
  const domain = siteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const letter = siteName.trim().charAt(0) || "م";
  const hasImage = !!imageUrl?.trim();
  const hasLogo = !!logoUrl?.trim() && errLogo !== logoUrl;

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/20">
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <span className="text-xs font-semibold text-foreground/70">Live preview</span>
        <div className="flex gap-1 text-xs">
          <button type="button" onClick={() => setMode("google")} className={tabCls(mode === "google")}>
            Google
          </button>
          <button type="button" onClick={() => setMode("social")} className={tabCls(mode === "social")}>
            Social card
          </button>
        </div>
      </div>

      {mode === "google" ? (
        <div className="p-4">
          <div dir="rtl" className="rounded-lg bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              {hasLogo ? (
                <NextImage
                  key={logoUrl}
                  src={logoUrl as string}
                  alt={siteName}
                  width={24}
                  height={24}
                  unoptimized
                  onError={() => setErrLogo(logoUrl ?? null)}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[10px] text-primary">
                  {letter}
                </div>
              )}
              <div className="leading-tight">
                <div className="text-[13px] text-foreground/80">{siteName}</div>
                <div className="text-[12px] text-emerald-700 dark:text-emerald-500">{siteUrl}</div>
              </div>
            </div>
            <div className="mt-1 text-[18px] leading-snug text-[#1a0dab] dark:text-blue-400">{title || "—"}</div>
            <div className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {description || "—"}
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
            Approximate — Google may rewrite titles/descriptions.
          </p>
        </div>
      ) : (
        <div className="p-4">
          <div className="mx-auto max-w-sm overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex aspect-[1200/630] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/70 to-indigo-600">
              {hasImage ? (
                <NextImage
                  key={imageUrl}
                  src={imageUrl as string}
                  alt={title}
                  width={400}
                  height={210}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-white/90">1200×630</span>
              )}
            </div>
            <div dir="rtl" className="px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground/70">{domain}</div>
              <div className="text-[15px] font-bold leading-snug text-foreground">{title || "—"}</div>
              <div className="line-clamp-2 text-[12px] text-muted-foreground">{description || "—"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
