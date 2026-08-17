import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientsList } from "@/lib/queries/get-clients-list";
import { getModontyArticles } from "@/app/modonty/data/get-modonty-articles";
import { getModontyGallery } from "@/app/modonty/data/get-modonty-gallery";
import { getModontyReels } from "@/app/modonty/data/get-modonty-reels";
import { getModontyPhone } from "@/app/modonty/data/get-modonty-phone";
import { getLegalEntity } from "@/lib/seo/organization-jsonld";
import { toLegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { ModontyProfileHero } from "@/app/modonty/components/profile-hero/ModontyProfileHero";
import { ModontyArticlesFeed } from "@/app/modonty/components/articles-feed/ModontyArticlesFeed";
import { ModontyRightRail } from "@/app/modonty/components/right-rail/ModontyRightRail";
import { ModontyLeftRail } from "@/app/modonty/components/left-rail/ModontyLeftRail";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { messages } from "@/lib/i18n/messages";
import { SITE_URL } from "@/constants";
import { reveal } from "./helpers/reveal";

/** modonty's own slug in the `Client` table — the same row every partner card reads. */
const MODONTY_CLIENT_SLUG = "مدونتي";

export const metadata: Metadata = {
  title: { absolute: "مقالات مدونتي | مدونتي" },
  description: "كل مقالات مدونتي الخاصة — بمعرضها وأرقامها الحقيقية، من نفس صفّها في قاعدة الشركاء.",
  alternates: { canonical: `${SITE_URL}/modonty` },
};

interface ModontyPageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * modonty's own dedicated page — independent from `/about` (Khalid, 2026-08-16: «About
 * هذا موضوع ثاني»). Every field comes from modonty's own `Client` row, the same one every
 * partner card reads. Three-column shell, same widths/gaps as `/`, `/clients`, `/industries`
 * (Khalid, 2026-08-17). Right rail = about modonty (story card → `/story`, team card →
 * `/team`); left rail = the partners' side (testimonials → `/story`, the pinboard of our
 * article covers drawn at random per request, and modonty's own reels). Nothing opens in place — Khalid
 * rejected the drawer, then the popover, the same day.
 */
export default async function ModontyPage({ searchParams }: ModontyPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number.isFinite(Number(pageParam)) && Number(pageParam) > 1 ? Number(pageParam) : 1;

  const partners = await getClientsList();
  const profile = partners.find((partner) => partner.slug === MODONTY_CLIENT_SLUG);
  if (!profile) notFound();

  const [articles, gallery, reels, legalEntity, whatsappPhone] = await Promise.all([
    getModontyArticles(profile.id),
    getModontyGallery(profile.id),
    getModontyReels(profile.id),
    getLegalEntity(),
    getModontyPhone(profile.id),
  ]);
  const legal = toLegalEntityDisplay(legalEntity);

  const buildPageHref = (targetPage: number) => (targetPage > 1 ? `/modonty?page=${targetPage}` : "/modonty");

  return (
    <ThreeColumnLayout
      header={
        <div className={`space-y-4 ${reveal(0)}`}>
          <Breadcrumb
            items={[
              { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
              { label: "مدونتي" },
            ]}
          />
          <ModontyProfileHero
            name={profile.name}
            description={profile.description}
            logo={profile.logo}
            heroImage={profile.heroImage}
            services={profile.services}
          />
        </div>
      }
      right={
        <StickyRail
          label={messages.modonty.rightRailLabel}
          className={`hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block ${reveal(2)}`}
        >
          <ModontyRightRail legal={legal} clientId={profile.id} clientName={profile.name} whatsappPhone={whatsappPhone} />
        </StickyRail>
      }
      center={
        <div className={reveal(1)}>
          <ModontyArticlesFeed articles={articles} page={page} buildPageHref={buildPageHref} />
        </div>
      }
      left={
        <StickyRail
          label={messages.modonty.leftRailLabel}
          className={`hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block ${reveal(2)}`}
        >
          <ModontyLeftRail gallery={gallery} reels={reels} />
        </StickyRail>
      }
    />
  );
}
