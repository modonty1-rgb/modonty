"use client";

import { memo, useState } from "react";
import { m } from "framer-motion";
import { ExternalLink, Smartphone, Monitor } from "lucide-react";

type VariantId = "short" | "full";

interface Variant {
  id: VariantId;
  label: string;
  hint: string;
  outcome: string;
  duration: string;
  icon: typeof Smartphone;
  youtubeId: string;
  watchUrl: string;
  aspect: "vertical" | "landscape";
}

const VARIANTS: Variant[] = [
  {
    id: "short",
    label: "تجربة كيما زون",
    hint: "من السوق المصري للعميل السعودي",
    outcome: "تموضع في السوق السعودي بهوية موثوقة",
    duration: "Short",
    icon: Smartphone,
    youtubeId: "s4nYJRY3heE",
    watchUrl: "https://www.youtube.com/shorts/s4nYJRY3heE",
    aspect: "vertical",
  },
  {
    id: "full",
    label: "تجربة الجبر الجنوبية للمقاولات",
    hint: "من مبالغات السوشيال ميديا إلى المحتوى المستدام",
    outcome: "محتوى تقني يبني سلطة في قطاع المقاولات",
    duration: "نسخة كاملة",
    icon: Monitor,
    youtubeId: "87TI084Jc6E",
    watchUrl: "https://www.youtube.com/watch?v=87TI084Jc6E",
    aspect: "landscape",
  },
];

function TestimonialPlayerImpl() {
  const [activeId, setActiveId] = useState<VariantId>("short");
  const active = VARIANTS.find((v) => v.id === activeId);
  if (!active) return null;

  return (
    <div
      className="relative w-full h-full flex flex-col items-stretch justify-start gap-3 select-none py-2"
      dir="rtl"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">💬</span>
          <div className="flex flex-col">
            <p className="text-sm md:text-base font-extrabold text-foreground leading-tight">
              شركاء النجاح
            </p>
            <p className="text-[10px] md:text-[11px] text-foreground/65 leading-tight">
              تجارب حقيقية موثّقة على قناة مدونتي
            </p>
          </div>
        </div>
        <a
          href={active.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted hover:bg-muted/70 text-[10px] font-bold text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label="افتح في YouTube"
        >
          <span>YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* TABS — ARIA APG: roving tabindex + arrow nav */}
      <div
        role="tablist"
        aria-label="اختر النسخة"
        className="flex items-center gap-1.5 px-2"
        onKeyDown={(e) => {
          const total = VARIANTS.length;
          const idx = VARIANTS.findIndex((v) => v.id === activeId);
          let next = idx;
          // RTL: ArrowLeft = next, ArrowRight = prev
          if (e.key === "ArrowLeft") next = (idx + 1) % total;
          else if (e.key === "ArrowRight") next = (idx - 1 + total) % total;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = total - 1;
          else return;
          e.preventDefault();
          setActiveId(VARIANTS[next].id);
        }}
      >
        {VARIANTS.map((v) => {
          const isActive = v.id === activeId;
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              id={`testimonial-tab-${v.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`testimonial-panel-${v.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(v.id)}
              className={`flex-1 min-w-0 px-3 py-2 rounded-xl border text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "bg-primary/10 border-primary/50 text-foreground shadow-sm"
                  : "bg-background/40 border-border/40 text-foreground/70 hover:bg-muted/40 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary" : "text-foreground/55"}`} />
                <span className="text-[11px] md:text-[12px] font-extrabold truncate">{v.label}</span>
              </div>
              <p className="text-[9px] md:text-[10px] text-foreground/55 truncate">
                {v.duration} · {v.hint}
              </p>
              <p className="mt-0.5 text-[10px] md:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                <span aria-hidden>📈</span>
                <span className="truncate">{v.outcome}</span>
              </p>
            </button>
          );
        })}
      </div>

      {/* VIDEO STAGE — single tabpanel (iframe holds focus naturally, no double tab-stop) */}
      <div
        role="tabpanel"
        id={`testimonial-panel-${active.id}`}
        aria-labelledby={`testimonial-tab-${active.id}`}
        className="relative flex-1 min-h-[260px] flex items-center justify-center px-2"
      >
        <m.div
          key={active.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full h-full max-h-full rounded-2xl overflow-hidden bg-black shadow-2xl shadow-primary/15 ring-2 ring-foreground/10 ${
            active.aspect === "vertical"
              ? "max-w-[280px] md:max-w-[320px] aspect-[9/16] mx-auto"
              : "aspect-video"
          }`}
        >
          <iframe
            key={active.youtubeId}
            src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
            title={`${active.label} — ${active.hint}`}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </m.div>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-[10px] md:text-[11px] text-center text-foreground/55 px-3 leading-relaxed">
        شهادة موثّقة على قناة مدونتي الرسمية —{" "}
        <a
          href="https://www.youtube.com/@modonty"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          @modonty
        </a>
      </p>
    </div>
  );
}

export const TestimonialPlayer = memo(TestimonialPlayerImpl);
TestimonialPlayer.displayName = "TestimonialPlayer";
