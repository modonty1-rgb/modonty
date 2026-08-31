import type { HomeData } from "../home/home-data";

/**
 * «مَن نحن — البيان» — the mission statement first (HubSpot/Shopify: mission · who it is for),
 * big and quiet: the slogan as the promise, one meta line, then the first paragraph.
 */
export function AboutIntro({ data }: { data: HomeData; preview?: boolean }) {
  const { hero } = data;
  const meta = [hero.industry, hero.city, hero.foundingYear ? `منذ ${hero.foundingYear}` : null].filter(Boolean).join(" · ");
  const firstParagraph = (data.about.description ?? "").split(/\n\s*\n/)[0] ?? "";
  return (
    <section id="hero" className="bg-background">
      <div className="mx-auto max-w-[1128px] px-6 py-16">
        <p className="text-sm font-medium text-[hsl(var(--primary-ink,var(--primary)))]">من نحن</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-4xl">{hero.slogan || data.name}</h1>
        {meta && <p className="mt-3 text-sm text-muted-foreground">{meta}</p>}
        {firstParagraph && <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">{firstParagraph}</p>}
      </div>
    </section>
  );
}
