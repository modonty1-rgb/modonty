import type { B2bPanelSettings } from "@/lib/seo/clients-page-seo";
import { CtaTrackedLink } from "@/components/cta-tracked-link";

interface ClientsHeroProps {
  totalClients: number;
  totalIndustries: number;
  totalArticles: number;
  onSearch?: (query: string) => void;
  b2b?: B2bPanelSettings | null;
}

const B2B_DEFAULTS = {
  label: "لأصحاب الأعمال والشركات",
  headline: "عملاؤك يبحثون عنك\nعلى جوجل — هل يجدونك؟",
  bullets: [
    "ظهور مضمون على جوجل بمحتوى يُقنع قبل أن تتكلم",
    "عملاء جاهزون للشراء — بلا ميزانية إعلانية تتوقف",
    "نتائج تقيسها: زيارات، مشاهدات، استفسارات حقيقية",
  ],
  ctaText: "عملاء بلا إعلانات",
  ctaUrl: "https://www.jbrseo.com",
};

export function ClientsHero({
  totalClients,
  totalIndustries,
  totalArticles,
  b2b,
}: ClientsHeroProps) {
  const label = b2b?.b2bLabel || B2B_DEFAULTS.label;
  const headline = b2b?.b2bHeadline || B2B_DEFAULTS.headline;
  const bullets = [
    b2b?.b2bBullet1 || B2B_DEFAULTS.bullets[0],
    b2b?.b2bBullet2 || B2B_DEFAULTS.bullets[1],
    b2b?.b2bBullet3 || B2B_DEFAULTS.bullets[2],
  ];
  const ctaText = b2b?.b2bCtaText || B2B_DEFAULTS.ctaText;
  const ctaUrl = b2b?.b2bCtaUrl || B2B_DEFAULTS.ctaUrl;
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-primary">
      {/* grid texture */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden
      />
      {/* glow */}
      <div className="pointer-events-none absolute bottom-0 end-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-0 start-0 h-48 w-48 rounded-full bg-white/5 blur-3xl" aria-hidden />

      <div className="relative z-10 container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* ── Left col: B2C — للقارئ ── */}
          <div className="space-y-6 text-center md:text-start">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              دليل أفضل الشركات<br className="hidden sm:block" /> والخبراء في السوق العربي
            </h1>
            <p className="text-base text-white/70 leading-relaxed">
              اكتشف شركات موثوقة تشارك خبرتها وتساعدك في اتخاذ قرارات أذكى
            </p>
            <div className="flex items-center justify-center md:justify-start gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{totalClients}</div>
                <div className="text-xs text-white/60 mt-0.5">شركة موثوقة</div>
              </div>
              <div className="h-10 w-px bg-white/15" aria-hidden />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{totalIndustries}</div>
                <div className="text-xs text-white/60 mt-0.5">صناعة</div>
              </div>
              <div className="h-10 w-px bg-white/15" aria-hidden />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{totalArticles}</div>
                <div className="text-xs text-white/60 mt-0.5">مقال خبراء</div>
              </div>
            </div>
          </div>

          {/* ── Right col: B2B — لصاحب العمل ── */}
          <div className="rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm p-7 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{label}</p>
              <h2 className="text-2xl font-bold text-white leading-snug">
                {headline.split("\n").map((line, i) => (
                  <span key={i}>{line}{i < headline.split("\n").length - 1 && <br />}</span>
                ))}
              </h2>
            </div>
            <ul className="space-y-2.5">
              {bullets.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-white/80">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white font-bold">✓</span>
                  {point}
                </li>
              ))}
            </ul>
            <CtaTrackedLink
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              label="Clients Hero B2B CTA — عملاء بلا إعلانات"
              type="BANNER"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-md hover:bg-white/90 transition-colors"
            >
              {ctaText}
              <span aria-hidden="true">↗</span>
            </CtaTrackedLink>
          </div>

        </div>
      </div>
    </div>
  );
}
