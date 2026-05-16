"use client";

import { memo } from "react";
import { m } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { OptimizedImage } from "@/components/media/OptimizedImage";

interface Partner {
  name: string;
  logoUrl: string;
  href?: string;
}

const PARTNERS: Partner[] = [
  {
    name: "مجموعة جبر الجنوبية للمقاولات",
    logoUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774290421/%D8%AC%D8%A8%D8%B1_%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9_logo_mn4ma1.png",
    href: "http://www.jabrco.com/",
  },
  {
    name: "شركة كيما زون",
    logoUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774290721/kima-zon_wcgjxy.jpg",
    href: "https://www.kimazone.net/",
  },
  {
    name: "الساحة للتكنولوجيا",
    logoUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1776941289/WhatsApp_Image_2026-04-22_at_3.45.28_PM_yr02hw.jpg",
  },
  {
    name: "Trust Technology",
    logoUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1776941134/WhatsApp_Image_2026-04-22_at_3.45.13_PM_hwzvjf.jpg",
  },
  {
    name: "DreamToApp",
    logoUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774290641/dream_To_App2-01_kwzar5.png",
  },
];

function PartnersShowcaseImpl() {
  return (
    <div
      className="relative w-full h-full flex flex-col items-stretch justify-start gap-3 select-none py-2"
      dir="rtl"
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 px-2">
        <span aria-hidden className="text-2xl">🤝</span>
        <div className="flex flex-col">
          <p className="text-sm md:text-base font-extrabold text-foreground leading-tight">
            يثقون بنا في السعودية ومصر
          </p>
          <p className="text-[10px] md:text-[11px] text-foreground/65 leading-tight">
            ٥ شركاء أوائل اختاروا مدونتي
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="relative flex-1 min-h-[260px] overflow-hidden rounded-2xl bg-gradient-to-b from-card/60 via-transparent to-muted/30 px-3 py-4 flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-[520px] [&>*:nth-last-child(1):nth-child(odd)]:col-span-2 [&>*:nth-last-child(1):nth-child(odd)]:max-w-[calc(50%-6px)] [&>*:nth-last-child(1):nth-child(odd)]:mx-auto md:[&>*:nth-last-child(1):nth-child(odd)]:col-span-1 md:[&>*:nth-last-child(1):nth-child(odd)]:max-w-none md:[&>*:nth-last-child(1):nth-child(odd)]:mx-0">
          {PARTNERS.map((partner, idx) => {
            const card = (
              <m.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative h-24 md:h-28 rounded-xl bg-background/85 hover:bg-background border border-border/50 hover:border-primary/40 shadow-sm hover:shadow-md transition-all flex items-center justify-center overflow-hidden p-3"
              >
                <div className="relative w-full h-full">
                  <OptimizedImage
                    src={partner.logoUrl}
                    alt={`شعار ${partner.name} — شريك مدونتي`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
                {partner.href && (
                  <span
                    aria-hidden
                    className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3 text-primary" />
                  </span>
                )}
              </m.div>
            );

            return (
              <div key={partner.name} className="relative">
                {partner.href ? (
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-xl"
                    aria-label={`زر موقع ${partner.name} في تاب جديد`}
                    title={partner.name}
                  >
                    {card}
                  </a>
                ) : (
                  <div title={partner.name}>{card}</div>
                )}
                <p className="mt-1.5 text-[9px] md:text-[10px] text-center text-foreground/65 font-bold truncate px-1">
                  {partner.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-[10px] md:text-[11px] text-center text-foreground/55 px-3 leading-relaxed">
        شركاء فعليون مع مدونتي منذ ٢٠٢٤
      </p>
    </div>
  );
}

export const PartnersShowcase = memo(PartnersShowcaseImpl);
PartnersShowcase.displayName = "PartnersShowcase";
