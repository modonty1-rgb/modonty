import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconChevronLeft } from "@/lib/icons";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { cn } from "@/lib/utils";

interface IndustryPreview {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
  socialImage?: string | null;
}

interface IndustriesCarouselProps {
  industries: IndustryPreview[];
  headingId: string;
}

const FALLBACK_TONES = [
  "from-cyan-500/30 via-sky-500/15 to-primary/20 text-cyan-700 dark:text-cyan-200",
  "from-violet-500/30 via-indigo-500/15 to-primary/20 text-violet-700 dark:text-violet-200",
  "from-emerald-500/30 via-teal-500/15 to-primary/15 text-emerald-700 dark:text-emerald-200",
  "from-amber-500/30 via-orange-500/15 to-primary/15 text-amber-700 dark:text-amber-200",
  "from-rose-500/25 via-fuchsia-500/15 to-primary/15 text-rose-700 dark:text-rose-200",
] as const;

function hasIndustryImage(source?: string | null): source is string {
  return Boolean(source?.trim());
}

function IndustryVisual({ industry, index }: { industry: IndustryPreview; index: number }) {
  const imageSource = hasIndustryImage(industry.socialImage)
    ? industry.socialImage
    : null;

  return (
    <span
      className={cn(
        "relative flex size-[clamp(4rem,18vw,4.5rem)] shrink-0 items-center justify-center self-center overflow-hidden bg-muted/30",
        !imageSource && FALLBACK_TONES[index % FALLBACK_TONES.length]
      )}
    >
      {imageSource ? (
        <OptimizedImage
          media={asMedia(imageSource, industry.name)}
          alt=""
          fill
          sizes="(max-width: 390px) 18vw, 72px"
          loading="lazy"
          className="object-contain"
        />
      ) : (
        <ModontyIndustriesMark className="size-8" aria-hidden />
      )}
    </span>
  );
}

export function IndustriesCarousel({ industries, headingId }: IndustriesCarouselProps) {
  return (
    <section aria-labelledby={headingId} className="relative overflow-hidden rounded-xl border border-border/70 bg-card">
      <h2 id={headingId} className="sr-only">
        استكشف المجالات
      </h2>

      <div className="relative mt-1.5 h-8">
        <Link
          href="/industries"
          prefetch={false}
          aria-label="عرض كل المجالات"
          className="absolute left-1 inline-flex min-h-8 min-w-11 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] active:bg-accent/40 active:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span>عرض كل المجالات</span>
          <IconChevronLeft className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="relative">
        <div
          role="region"
          aria-label="المجالات"
          tabIndex={0}
          dir="rtl"
          className="flex snap-x snap-proximity gap-3 overflow-x-auto px-3 py-2 scrollbar-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          {industries.map((industry, index) => (
            <Link
              key={industry.id}
              href={`/industries/${encodeURIComponent(industry.slug)}`}
              prefetch={false}
              aria-label={`استكشف مجال ${industry.name}`}
              className="flex w-[clamp(6rem,27vw,6.75rem)] shrink-0 snap-start flex-col gap-1.5 rounded-xl border border-border/70 bg-muted/20 p-1.5 transition-colors active:border-accent/70 active:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <IndustryVisual industry={industry} index={index} />
              <span className="block w-full min-w-0 truncate px-1 pb-0.5 text-center text-xs font-semibold leading-4 text-foreground">
                {industry.name}
              </span>
            </Link>
          ))}
        </div>

        {industries.length > 3 && (
          <span
            className="pointer-events-none absolute inset-y-2 left-0 w-5 bg-gradient-to-r from-card via-card/70 to-transparent"
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}
