"use client";

import { memo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { OptimizedImage } from "@/components/media/OptimizedImage";

type Dept = "leadership" | "content" | "creative" | "ops" | "outreach";

interface Member {
  name: string;
  role: string;
  bio: string;
  cloudinaryUrl?: string;
  initials?: string;
  dept: Dept;
}

const TEAM: Member[] = [
  {
    name: "م. محمد حسني جبر",
    role: "المدير العام",
    bio: "صاحب الرؤية الاستراتيجية، يضمن تكامل كل الإدارات.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1775982689/abo_salman_ylqvmd.jpg",
    dept: "leadership",
  },
  {
    name: "م. خالد علي",
    role: "المدير التنفيذي",
    bio: "قائد العمليات اليومية وتحويل الخطط لواقع ملموس.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774351813/khalid_ctesgk.jpg",
    dept: "leadership",
  },
  {
    name: "د. محمد شلبي",
    role: "أخصائي تحسين محركات البحث",
    bio: "يضمن تصدّر المواقع نتائج البحث الأولى لزيادة الانتشار.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774210371/muhammedshlpy_rnhwf0.jpg",
    dept: "content",
  },
  {
    name: "أ. مايا أحمد",
    role: "كاتبة محتوى وأخصائية SEO",
    bio: "تكتب محتوى عربياً قوياً مُحسَّناً لمحركات البحث ويتحدّث بصوت العميل.",
    cloudinaryUrl:
      "https://api.dicebear.com/9.x/micah/png?seed=maya&earringsProbability=100&facialHairProbability=0&baseColor=f9c9b6&backgroundColor=10b981,059669&size=256&radius=50",
    dept: "content",
  },
  {
    name: "أ. روان عطيتو",
    role: "استراتيجي محتوى",
    bio: "تخطّط وتبتكر محتوى إبداعي يربط الجمهور بالعلامة التجارية.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774210371/rawan_mutjax.jpg",
    dept: "content",
  },
  {
    name: "أ. مصطفى محمد",
    role: "قائد فريق التصميم",
    bio: "يقود المصممين لتقديم هوية بصرية احترافية تعزّز الثقة.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774210371/mustafa_u9fyw2.jpg",
    dept: "creative",
  },
  {
    name: "أ. أحمد عثمان",
    role: "قائد فريق المونتاج",
    bio: "يصنع محتوى مرئياً يروي قصة العلامة التجارية بأسلوب مبهر.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774210371/ahmed_vbyk9p.png",
    dept: "creative",
  },
  {
    name: "م. محمد سليمان",
    role: "مدير المشروعات",
    bio: "يخطّط ويدير الموارد لتسليم المشاريع بدقة وكفاءة عالية.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1775982692/mohamed_soliman_ztofex.jpg",
    dept: "ops",
  },
  {
    name: "م. عمر حسني",
    role: "مدير حسابات العملاء",
    bio: "حلقة الوصل مع العملاء، يبني علاقات مستدامة ويضمن رضاهم.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1775982688/omar_hosney_y1y29k.jpg",
    dept: "ops",
  },
  {
    name: "م. أحمد طارق",
    role: "الموارد البشرية",
    bio: "يستقطب الكفاءات ويطوّر بيئة العمل لضمان إنتاجية الفريق.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1775982694/ahmed_tarek_h8xe6x.jpg",
    dept: "ops",
  },
  {
    name: "ميديا باير سمية محمد",
    role: "مسؤول الحملات الإعلانية",
    bio: "تدير الحملات الإعلانية لأفضل وصول وأعلى عائد على الاستثمار.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1775982696/somaya_as3oub.jpg",
    dept: "outreach",
  },
  {
    name: "أ. أحمد فرج",
    role: "مدير المبيعات",
    bio: "يقود الخطط البيعية ويصنع الفرص التجارية لتحقيق النمو.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1775982687/ahmed_farag_fplbvi.jpg",
    dept: "outreach",
  },
  {
    name: "أ. بلال يوسف",
    role: "خدمة العملاء",
    bio: "الواجهة المباشرة للمنصة، يقدّم الدعم السريع لتجربة مثالية.",
    cloudinaryUrl:
      "https://res.cloudinary.com/dfegnpgwx/image/upload/v1775982687/belal_youssef_peprz0.jpg",
    dept: "outreach",
  },
];

const DEPT_STYLES: Record<Dept, { label: string; chip: string; ring: string; glow: string }> = {
  leadership: {
    label: "قيادة",
    chip: "bg-primary/15 text-primary border-primary/40",
    ring: "ring-primary/40",
    glow: "shadow-primary/30",
  },
  content: {
    label: "محتوى",
    chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
    ring: "ring-emerald-500/40",
    glow: "shadow-emerald-500/30",
  },
  creative: {
    label: "إبداع",
    chip: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/40",
    ring: "ring-violet-500/40",
    glow: "shadow-violet-500/30",
  },
  ops: {
    label: "عمليات",
    chip: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40",
    ring: "ring-amber-500/40",
    glow: "shadow-amber-500/30",
  },
  outreach: {
    label: "تواصل",
    chip: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/40",
    ring: "ring-sky-500/40",
    glow: "shadow-sky-500/30",
  },
};

const AUTOPLAY_MS = 5000;

function TeamCarouselImpl() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    loop: true,
    align: "center",
    skipSnaps: false,
  });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const id = setInterval(() => {
      if (!emblaApi) return;
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [emblaApi, isPaused]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (idx: number) => emblaApi?.scrollTo(idx),
    [emblaApi],
  );

  return (
    <div
      className="relative w-full h-full flex flex-col items-stretch justify-start gap-3 select-none py-2"
      dir="rtl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        // only unpause when focus leaves the entire carousel subtree
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsPaused(false);
        }
      }}
    >
      {/* HEADER STRIP */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">👥</span>
          <div className="flex flex-col">
            <p className="text-sm md:text-base font-extrabold text-foreground leading-tight">
              من خلف البنيان
            </p>
            <p className="text-[10px] md:text-[11px] text-foreground/65 leading-tight">
              ١٣ متخصّصاً يشتغلون معك
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "تشغيل التنقّل التلقائي" : "إيقاف التنقّل التلقائي"}
          className="w-11 h-11 rounded-full bg-muted hover:bg-muted/70 inline-flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {isPaused ? <Play className="w-4 h-4" fill="currentColor" /> : <Pause className="w-4 h-4" fill="currentColor" />}
        </button>
      </div>

      {/* CAROUSEL */}
      <div className="relative flex-1 min-h-[260px] overflow-hidden rounded-2xl bg-gradient-to-b from-card/60 via-transparent to-muted/30">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {TEAM.map((member, idx) => {
              const style = DEPT_STYLES[member.dept];
              const isActive = idx === selectedIdx;
              return (
                <div
                  key={member.name}
                  role="tabpanel"
                  id={`team-panel-${idx}`}
                  aria-labelledby={`team-tab-${idx}`}
                  aria-hidden={!isActive}
                  className="relative shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 px-2 md:px-3 h-full flex items-center justify-center"
                >
                  <m.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{
                        opacity: isActive ? 1 : 0.55,
                        y: 0,
                        scale: isActive ? 1 : 0.92,
                      }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full max-w-[240px] flex flex-col items-center text-center gap-3 py-3"
                    >
                      {/* AVATAR */}
                      <div className="relative">
                        <div
                          className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ${style.ring} shadow-2xl ${style.glow} bg-muted`}
                        >
                          {member.cloudinaryUrl ? (
                            <OptimizedImage
                              src={member.cloudinaryUrl}
                              alt={`صورة ${member.name} — فريق مدونتي`}
                              fill
                              sizes="(max-width: 768px) 112px, 128px"
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center text-2xl md:text-3xl font-extrabold ${style.chip}`}
                              aria-label={`صورة رمزية للأحرف الأولى — ${member.name}`}
                            >
                              {member.initials ?? member.name.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        {/* dept badge floating */}
                        <span
                          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${style.chip} shadow-md whitespace-nowrap`}
                        >
                          {style.label}
                        </span>
                      </div>

                      {/* NAME + ROLE */}
                      <div className="flex flex-col gap-0.5 px-1 mt-1">
                        <p className="text-[13px] md:text-sm font-extrabold text-foreground leading-tight">
                          {member.name}
                        </p>
                        <p className="text-[10px] md:text-[11px] font-bold text-foreground/70 leading-tight">
                          {member.role}
                        </p>
                      </div>

                      {/* BIO */}
                      <p className="text-[10px] md:text-[11px] text-foreground/65 leading-relaxed px-1 line-clamp-2">
                        {member.bio}
                      </p>
                    </m.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NAV ARROWS — WCAG 2.5.5 (44×44) */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="العضو السابق"
          className="absolute top-1/2 -translate-y-1/2 right-1.5 md:right-2 w-11 h-11 rounded-full bg-background/85 backdrop-blur hover:bg-background border border-border shadow-lg inline-flex items-center justify-center text-foreground/80 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="العضو التالي"
          className="absolute top-1/2 -translate-y-1/2 left-1.5 md:left-2 w-11 h-11 rounded-full bg-background/85 backdrop-blur hover:bg-background border border-border shadow-lg inline-flex items-center justify-center text-foreground/80 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* DOTS — WCAG 2.5.5 (44×44 hit-area) + ARIA APG (roving tabindex + arrow nav) — hidden <sm (13 dots wrap on small screens; arrows + swipe handle nav) */}
      <div
        className="hidden sm:flex items-center justify-center px-2"
        role="tablist"
        aria-label="الانتقال السريع بين أعضاء الفريق"
        onKeyDown={(e) => {
          const total = TEAM.length;
          let next = selectedIdx;
          // RTL: ArrowLeft = next, ArrowRight = prev
          if (e.key === "ArrowLeft") next = (selectedIdx + 1) % total;
          else if (e.key === "ArrowRight") next = (selectedIdx - 1 + total) % total;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = total - 1;
          else return;
          e.preventDefault();
          scrollTo(next);
        }}
      >
        {TEAM.map((member, idx) => (
          <button
            key={member.name}
            id={`team-tab-${idx}`}
            type="button"
            role="tab"
            aria-selected={idx === selectedIdx}
            aria-controls={`team-panel-${idx}`}
            aria-label={`اذهب إلى ${member.name}`}
            tabIndex={idx === selectedIdx ? 0 : -1}
            onClick={() => scrollTo(idx)}
            className="group inline-flex items-center justify-center p-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span
              aria-hidden
              className={`block h-1.5 rounded-full transition-all ${
                idx === selectedIdx
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-foreground/25 group-hover:bg-foreground/45"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export const TeamCarousel = memo(TeamCarouselImpl);
TeamCarousel.displayName = "TeamCarousel";
