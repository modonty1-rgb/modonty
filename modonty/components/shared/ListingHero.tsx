import Image from "next/image";

export type ListingHeroAccent = "teal" | "blue";

interface ListingHeroProps {
  badgeText: string;
  title: string;
  description: string;
  /** Site OG image (from the SEO metadata cache). When absent, a plain dark hero is shown. */
  imageUrl?: string;
  imageAlt?: string;
  accent: ListingHeroAccent;
}

const ACCENT: Record<
  ListingHeroAccent,
  { badge: string; dot: string; glow: string }
> = {
  teal: {
    badge: "border-teal-500/35 text-teal-300",
    dot: "bg-teal-400",
    glow: "[background:radial-gradient(ellipse_70%_80%_at_5%_-10%,rgba(0,216,216,0.14),transparent_60%)]",
  },
  blue: {
    badge: "border-blue-500/35 text-blue-300",
    dot: "bg-blue-400",
    glow: "[background:radial-gradient(ellipse_70%_80%_at_5%_-10%,rgba(48,48,255,0.14),transparent_60%)]",
  },
};

/**
 * Full-bleed listing hero: the site OG image as background, pushed up (object-position
 * 50% 88%) so the centered brand mark sits high and the overlaid text lands on a clean
 * dark zone. A bottom-up scrim + text-shadow keep the text readable over any image.
 */
export function ListingHero({
  badgeText,
  title,
  description,
  imageUrl,
  imageAlt,
  accent,
}: ListingHeroProps) {
  const a = ACCENT[accent];

  return (
    <div className="relative overflow-hidden border-b bg-zinc-950">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_88%]"
          />
          <div
            className="pointer-events-none absolute inset-0 [background:linear-gradient(to_top,#09090b_0%,rgba(9,9,11,0.97)_30%,rgba(9,9,11,0.55)_56%,rgba(9,9,11,0.15)_82%,transparent_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 [background:linear-gradient(to_bottom,rgba(9,9,11,0.5)_0%,transparent_26%)]"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:40px_40px]"
            aria-hidden
          />
          <div className={`pointer-events-none absolute inset-0 ${a.glow}`} aria-hidden />
        </>
      )}

      <div className="relative z-10 container mx-auto flex min-h-[340px] max-w-[1128px] flex-col justify-end px-4 py-14 sm:min-h-[400px]">
        <div
          className={`mb-5 inline-flex items-center gap-2 self-start rounded-full border bg-white/[0.06] px-4 py-1.5 text-xs font-bold shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur ${a.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
          {badgeText}
        </div>
        <h1 className="mb-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.8)] sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-zinc-200 [text-shadow:0_1px_14px_rgba(0,0,0,0.85)]">
          {description}
        </p>
      </div>
    </div>
  );
}
